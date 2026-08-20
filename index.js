/**
 * index.js
 * ---------------------------------------------------------------
 * Application entry point.
 *
 *  - Loads environment variables
 *  - Starts an Express server with:
 *      GET /        -> basic health check
 *      GET /health  -> detailed health check (used by Railway)
 *      GET /images/*  -> static hosting of generated images so the
 *                         Instagram Graph API can fetch them
 *  - Starts the node-cron scheduler that drives the posting flow
 * ---------------------------------------------------------------
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { startScheduler, runTask } from './scheduler.js';
import { IMAGES_DIR } from './newsCard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const app = express();

// Serve generated images statically so Instagram's Graph API can
// fetch them via a public URL (see instagram.js / PUBLIC_BASE_URL).
app.use('/images', express.static(IMAGES_DIR));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ig-ai-image-bot',
    message: 'Instagram AI image bot is running.',
    time: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    time: new Date().toISOString(),
  });
});

// Optional manual trigger endpoint, handy for testing the flow
// without waiting for the next cron tick. Not required by the
// scheduler itself.
app.post('/run-now', async (req, res) => {
  logger.info('Manual run triggered via /run-now endpoint.');
  res.status(202).json({ status: 'accepted', message: 'Task triggered — check logs for progress.' });
  runTask().catch((err) => logger.error('Manual run failed', err));
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Express error-handling middleware — last line of defense for any
// synchronous error thrown inside a route handler.
app.use((err, req, res, next) => {
  logger.error('Unhandled Express error', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  logger.info(`Health check server listening on port ${PORT}`);

  try {
    startScheduler();
  } catch (err) {
    // If the cron schedule itself is misconfigured, log it clearly
    // but keep the HTTP server (and health check) alive.
    logger.error('Failed to start scheduler', err);
  }
});

// ---------------------------------------------------------------
// Global safety nets — make sure the process never dies silently.
// Railway will restart the container if the process truly exits,
// but we want to survive transient errors instead of restarting.
// ---------------------------------------------------------------
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received — shutting down gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});
