/**
 * scheduler.js
 * ---------------------------------------------------------------
 * Every 30 mins — Anime Quiz post to Instagram
 * Background = anime-specific wallpaper
 * No answer revealed — engagement through comments
 * ---------------------------------------------------------------
 */

import cron from 'node-cron';
import { logger } from './logger.js';
import { generateQuizCard, generateQuizCaption, cleanupQuizImage, markQuizAsPosted } from './quizCard.js';
import { postToInstagram } from './instagram.js';

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '*/30 * * * *';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let isTaskRunning = false;

export async function runTask() {
  if (isTaskRunning) { logger.warn('Task already running — skipping.'); return; }
  isTaskRunning = true;
  let item;

  try {
    logger.info('Starting quiz task...');

    // 1. Generate quiz card
    item = await generateQuizCard();

    const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    if (!base) throw new Error('PUBLIC_BASE_URL not set.');

    const imageUrl = `${base}/images/${item.fileName}`;
    const caption  = generateQuizCaption(item.quiz);

    // 2. Wait for Express to serve
    await sleep(5000);

    // 3. Post to Instagram
    logger.info(`Posting quiz [${item.quiz.anime}] to Instagram...`);
    const postId = await postToInstagram({ imageUrl, caption });
    logger.success(`Posted! ID: ${postId} — ${item.quiz.q.slice(0, 40)}...`);

    // 4. Mark as posted
    markQuizAsPosted(item.index);
    logger.info('Task complete!');

  } catch (err) {
    logger.error(`Task failed: ${err.message}`);
  } finally {
    if (item?.filePath) {
      await sleep(60000);
      cleanupQuizImage(item.filePath);
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
