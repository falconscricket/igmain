/**
 * scheduler.js
 * ---------------------------------------------------------------
 * Every 30 mins — anime girl / anime boy / love aesthetic
 * Rotates: girl → boy → love → girl → boy → love...
 * ---------------------------------------------------------------
 */

import cron from 'node-cron';
import { logger } from './logger.js';
import { generateProfileCard, generateProfileCaption, cleanupProfileImage, markImageAsPosted } from './profileCard.js';
import { postToInstagram } from './instagram.js';

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/30 * * * *';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let isTaskRunning = false;

export async function runTask() {
  if (isTaskRunning) { logger.warn('Task already running — skipping.'); return; }
  isTaskRunning = true;
  let item;

  try {
    logger.info('Starting task...');

    // 1. Generate card
    item = await generateProfileCard();

    const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    if (!base) throw new Error('PUBLIC_BASE_URL not set.');

    const imageUrl = `${base}/images/${item.fileName}`;
    const caption  = generateProfileCaption(item.type);

    // 2. Wait for Express
    await sleep(5000);

    // 3. Post to Instagram
    logger.info(`Posting [${item.type}] to Instagram...`);
    const postId = await postToInstagram({ imageUrl, caption });
    logger.success(`Posted! ID: ${postId} [${item.type}]`);

    // 4. Mark image URL as posted
    markImageAsPosted(item.imageUrl);

    logger.info('Task complete!');

  } catch (err) {
    logger.error(`Task failed: ${err.message}`);
  } finally {
    if (item?.filePath) {
      await sleep(60000);
      cleanupProfileImage(item.filePath);
    }
    isTaskRunning = false;
    logger.info('Waiting for next schedule...');
  }
}

export function startScheduler() {
  if (!cron.validate(CRON_SCHEDULE)) throw new Error(`Invalid CRON_SCHEDULE: "${CRON_SCHEDULE}"`);
  logger.info(`Scheduler: "${CRON_SCHEDULE}"`);
  cron.schedule(CRON_SCHEDULE, () => {
    runTask().catch(err => logger.error('Unexpected error', err));
  });
  if (process.env.RUN_ON_STARTUP === 'true') {
    logger.info('Running on startup...');
    runTask().catch(err => logger.error('Startup error', err));
  }
}
