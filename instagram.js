import axios from 'axios';
import { logger } from './logger.js';

const GRAPH_API_BASE = 'https://graph.facebook.com/v20.0';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForContainerReady({ containerId, accessToken, maxAttempts = 15, delayMs = 4000 }) {
  for (let i = 1; i <= maxAttempts; i++) {
    const res = await axios.get(`${GRAPH_API_BASE}/${containerId}`, {
      params: { fields: 'status_code,status', access_token: accessToken }, timeout: 15000,
    });
    const status = res.data?.status_code;
    logger.info(`Container status (${i}/${maxAttempts}): ${status}`);
    if (status === 'FINISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`Container failed: ${status}`);
    await sleep(delayMs);
  }
  throw new Error('Container timed out');
}

export async function postToInstagram({ imageUrl, caption }) {
  const accessToken = process.env.IG_ACCESS_TOKEN;
  const igUserId    = process.env.IG_USER_ID;
  if (!accessToken || !igUserId) throw new Error('Missing IG_ACCESS_TOKEN or IG_USER_ID');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      logger.info(`Uploading to Instagram (attempt ${attempt}/3...`);
      const uploadRes = await axios.post(`${GRAPH_API_BASE}/${igUserId}/media`, null, {
        params: { image_url: imageUrl, caption, access_token: accessToken }, timeout: 30000,
      });
      const containerId = uploadRes.data?.id;
      if (!containerId) throw new Error('No container ID');
      await waitForContainerReady({ containerId, accessToken });
      const publishRes = await axios.post(`${GRAPH_API_BASE}/${igUserId}/media_publish`, null, {
        params: { creation_id: containerId, access_token: accessToken }, timeout: 30000,
      });
      const postId = publishRes.data?.id;
      if (!postId) throw new Error('No post ID');
      logger.success(`Instagram published! Post ID: ${postId}`);
      return postId;
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      logger.warn(`Failed to create media container (attempt ${attempt}/3): ${msg}`);
      if (attempt < 3) await sleep(5000);
      else throw new Error(`Failed to create media container after 3 attempts: ${msg}`);
    }
  }
}
