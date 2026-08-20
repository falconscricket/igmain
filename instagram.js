/**
 * instagram.js
 * ---------------------------------------------------------------
 * Publishes an image to Instagram using the official Instagram
 * Graph API (Content Publishing).
 *
 * The Graph API does not accept raw file uploads for this flow —
 * it needs a publicly reachable image URL that Instagram's servers
 * can fetch. Because this app already runs an Express server with
 * a static `/images` route (see index.js), we build a public URL
 * pointing back at our own downloaded file and pass that to the
 * Graph API.
 *
 * Flow:
 *   1. POST /{ig-user-id}/media        -> create a media container
 *   2. GET  /{container-id}?fields=status_code  -> poll until ready
 *   3. POST /{ig-user-id}/media_publish -> publish the container
 * ---------------------------------------------------------------
 */

import axios from 'axios';
import { logger } from './logger.js';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Meta's "User is performing too many actions" is a rate-limit / anti-
// spam throttle, not a transient network error. Retrying it after a
// short 5s delay almost always hits the same block again and wastes
// the whole retry budget in seconds. Detect it and back off much
// longer instead.
function isRateLimitError(err) {
  const apiError = err.response?.data?.error;
  const message = (apiError?.message || err.message || '').toLowerCase();
  const code = apiError?.code;
  return (
    message.includes('too many actions') ||
    message.includes('too many requests') ||
    code === 4 || code === 17 || code === 32 || code === 9
  );
}

/**
 * Create a media container on Instagram pointing at the given
 * publicly-accessible image URL.
 */
async function createMediaContainer({ igUserId, accessToken, imageUrl, caption }) {
  const url = `${GRAPH_API_BASE}/${igUserId}/media`;

  const response = await axios.post(url, null, {
    params: {
      image_url: imageUrl,
      caption,
      access_token: accessToken,
    },
    timeout: 30000,
  });

  if (!response.data || !response.data.id) {
    throw new Error(`Unexpected response when creating media container: ${JSON.stringify(response.data)}`);
  }

  return response.data.id;
}

/**
 * Poll the media container's status until it is FINISHED (ready to
 * publish) or ERROR / EXPIRED. Instagram processes the image
 * asynchronously after fetching it from our public URL.
 */
async function waitForContainerReady({ containerId, accessToken, maxAttempts = 15, delayMs = 4000 }) {
  const url = `${GRAPH_API_BASE}/${containerId}`;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await axios.get(url, {
      params: {
        fields: 'status_code,status',
        access_token: accessToken,
      },
      timeout: 15000,
    });

    const statusCode = response.data.status_code;
    logger.debug(`Container ${containerId} status: ${statusCode} (attempt ${attempt}/${maxAttempts})`);

    if (statusCode === 'FINISHED') {
      return true;
    }

    if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
      throw new Error(`Media container failed to process. Status: ${statusCode}`);
    }

    // IN_PROGRESS or PUBLISHED (not yet reached) — wait and retry
    await sleep(delayMs);
  }

  throw new Error('Timed out waiting for media container to finish processing.');
}

/**
 * Publish a previously created media container to the IG account's feed.
 */
async function publishMediaContainer({ igUserId, accessToken, containerId }) {
  const url = `${GRAPH_API_BASE}/${igUserId}/media_publish`;

  const response = await axios.post(url, null, {
    params: {
      creation_id: containerId,
      access_token: accessToken,
    },
    timeout: 30000,
  });

  if (!response.data || !response.data.id) {
    throw new Error(`Unexpected response when publishing media: ${JSON.stringify(response.data)}`);
  }

  return response.data.id;
}

/**
 * Full end-to-end post flow, with retries around each network call.
 *
 * @param {object} options
 * @param {string} options.imageUrl - publicly reachable URL of the image to post
 * @param {string} options.caption - caption text
 * @param {number} options.maxRetries - retry attempts for each API step
 */
export async function postToInstagram({ imageUrl, caption, maxRetries = 3 }) {
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID;

  if (!accessToken || !igUserId) {
    throw new Error('Missing IG_ACCESS_TOKEN or IG_USER_ID environment variables.');
  }

  // Step 1: create the media container (with retry)
  let containerId;
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Uploading to Instagram (creating media container), attempt ${attempt}/${maxRetries}...`);
      containerId = await createMediaContainer({ igUserId, accessToken, imageUrl, caption });
      logger.info(`Media container created: ${containerId}`);
      break;
    } catch (err) {
      lastError = err;
      const apiMessage = err.response?.data?.error?.message || err.message;
      logger.warn(`Failed to create media container on attempt ${attempt}: ${apiMessage}`);
      if (attempt < maxRetries) {
        if (isRateLimitError(err)) {
          logger.warn('Rate limit detected — backing off 90s before retry.');
          await sleep(90000);
        } else {
          await sleep(5000);
        }
      }
    }
  }

  if (!containerId) {
    throw new Error(`Failed to create media container after ${maxRetries} attempts: ${lastError?.message}`);
  }

  // Step 2: wait until Instagram finishes fetching/processing the image
  await waitForContainerReady({ containerId, accessToken });

  // Step 3: publish the container (with retry)
  let postId;
  lastError = undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Publishing media container, attempt ${attempt}/${maxRetries}...`);
      postId = await publishMediaContainer({ igUserId, accessToken, containerId });
      break;
    } catch (err) {
      lastError = err;
      const apiMessage = err.response?.data?.error?.message || err.message;
      logger.warn(`Failed to publish media on attempt ${attempt}: ${apiMessage}`);
      if (attempt < maxRetries) {
        if (isRateLimitError(err)) {
          logger.warn('Rate limit detected — backing off 90s before retry.');
          await sleep(90000);
        } else {
          await sleep(5000);
        }
      }
    }
  }

  if (!postId) {
    throw new Error(`Failed to publish media after ${maxRetries} attempts: ${lastError?.message}`);
  }

  return postId;
}

/**
 * Verify image URL is publicly accessible before passing to Instagram.
 */
async function verifyImageUrl(imageUrl, maxAttempts = 8, delayMs = 3000) {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      const res = await axios.head(imageUrl, { timeout: 10000 });
      if (res.status === 200) {
        logger.info(`Image URL verified (attempt ${i}): ${imageUrl}`);
        return true;
      }
    } catch {
      logger.warn(`Image URL not ready yet (attempt ${i}/${maxAttempts}): ${imageUrl}`);
    }
    await sleep(delayMs);
  }
  throw new Error(`Image URL not publicly accessible after ${maxAttempts} attempts: ${imageUrl}`);
}

/**
 * Creates a single child media container for a carousel.
 */
async function createCarouselChild({ igUserId, accessToken, imageUrl }) {
  const url = `${GRAPH_API_BASE}/${igUserId}/media`;
  try {
    const response = await axios.post(url, null, {
      params: {
        image_url:        imageUrl,
        is_carousel_item: true,
        access_token:     accessToken,
      },
      timeout: 30000,
    });
    if (!response.data?.id) throw new Error(`No id in child response: ${JSON.stringify(response.data)}`);
    return response.data.id;
  } catch (err) {
    const apiErr = err.response?.data?.error?.message || err.message;
    throw new Error(`Carousel child failed for ${imageUrl}: ${apiErr}`);
  }
}

/**
 * Posts a carousel (multiple images) to Instagram.
 */
export async function postCarouselToInstagram({ imageUrls, caption }) {
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const igUserId    = process.env.IG_USER_ID;

  if (!accessToken || !igUserId) throw new Error('Missing IG_ACCESS_TOKEN or IG_USER_ID.');
  if (!imageUrls?.length || imageUrls.length < 2) throw new Error('Carousel needs at least 2 images.');

  // Step 1: verify all image URLs are publicly accessible
  logger.info('Verifying all image URLs are publicly accessible...');
  for (const url of imageUrls) {
    await verifyImageUrl(url);
  }

  // Step 2: create child containers with 3s gap between each
  logger.info(`Creating ${imageUrls.length} carousel child containers...`);
  const childIds = [];
  for (const url of imageUrls) {
    const childId = await createCarouselChild({ igUserId, accessToken, imageUrl: url });
    childIds.push(childId);
    logger.info(`Child container created: ${childId}`);
    await sleep(3000);
  }

  // Step 3: create carousel container
  logger.info('Creating carousel container...');
  const carouselRes = await axios.post(`${GRAPH_API_BASE}/${igUserId}/media`, null, {
    params: {
      media_type:   'CAROUSEL',
      children:     childIds.join(','),
      caption,
      access_token: accessToken,
    },
    timeout: 30000,
  });
  const carouselId = carouselRes.data?.id;
  if (!carouselId) throw new Error(`No id in carousel container: ${JSON.stringify(carouselRes.data)}`);
  logger.info(`Carousel container created: ${carouselId}`);

  // Step 4: wait for processing
  await waitForContainerReady({ containerId: carouselId, accessToken, maxAttempts: 20, delayMs: 5000 });

  // Step 5: publish
  logger.info('Publishing carousel...');
  const publishRes = await axios.post(`${GRAPH_API_BASE}/${igUserId}/media_publish`, null, {
    params: { creation_id: carouselId, access_token: accessToken },
    timeout: 30000,
  });
  const postId = publishRes.data?.id;
  if (!postId) throw new Error(`No id in publish response: ${JSON.stringify(publishRes.data)}`);
  logger.success(`Carousel published! Post ID: ${postId}`);
  return postId;
}
