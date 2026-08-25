import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { startScheduler } from './scheduler.js';
import { IMAGES_DIR } from './quizCard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app  = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use('/images', express.static(IMAGES_DIR));
app.get('/',       (_, res) => res.send('Anime Quiz Bot running!'));
app.get('/health', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.listen(PORT, () => {
  logger.info(`Health check server listening on port ${PORT}`);
  startScheduler();
});
