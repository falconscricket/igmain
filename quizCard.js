/**
 * quizCard.js
 * ---------------------------------------------------------------
 * Anime Quiz Card — 1080x1350
 * Background = anime-specific wallpaper
 * Question + 4 options overlaid
 * No answer revealed — followers comment to answer
 * ---------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { logger } from './logger.js';
import { getRandomQuiz } from './quizData.js';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const FONTS_DIR  = path.join(__dirname, 'public', 'fonts');
const POSTED_LOG = process.env.POSTED_LOG_PATH || path.join(__dirname, 'posted-quiz.json');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// ── Fonts ─────────────────────────────────────────────────────────
const registeredFonts = [];
try {
  if (fs.existsSync(FONTS_DIR)) {
    for (const f of fs.readdirSync(FONTS_DIR).filter(f => f.toLowerCase().endsWith('.ttf'))) {
      const family = path.basename(f, path.extname(f));
      GlobalFonts.registerFromPath(path.join(FONTS_DIR, f), family);
      registeredFonts.push(family);
    }
  }
} catch (e) {}

const FONT_BOLD   = registeredFonts.includes('Poppins-Bold')   ? 'Poppins-Bold'   : 'sans-serif';
const FONT_MEDIUM = registeredFonts.includes('Poppins-Medium') ? 'Poppins-Medium' : 'sans-serif';

// ── Posted log ────────────────────────────────────────────────────
function loadPosted() {
  try { return JSON.parse(fs.readFileSync(POSTED_LOG, 'utf-8')) || []; } catch { return []; }
}
function savePosted(ids) {
  try {
    const dir = path.dirname(POSTED_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POSTED_LOG, JSON.stringify(ids.slice(-200), null, 2));
  } catch {}
}
export function markQuizAsPosted(index) {
  const posted = loadPosted();
  if (!posted.includes(index)) { posted.push(index); savePosted(posted); }
}

// ── Option labels ─────────────────────────────────────────────────
const LABELS = ['A', 'B', 'C', 'D'];

// ── Type badge colors ─────────────────────────────────────────────
const TYPE_COLORS = {
  power:   '#FF4444',
  compare: '#FF8C00',
  plot:    '#00D4FF',
  character: '#00E676',
};

// ── Helpers ───────────────────────────────────────────────────────
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = []; let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCoverImage(ctx, img, W, H) {
  const r = img.width / img.height, cr = W / H;
  let dw, dh, dx, dy;
  if (r > cr) { dh = H; dw = H * r; dx = -(dw - W) / 2; dy = 0; }
  else         { dw = W; dh = W / r; dx = 0; dy = -(dh - H) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}

// ── Card renderer ─────────────────────────────────────────────────
async function renderQuizCard(quiz, imgBuffer) {
  const W = 1080, H = 1350;
  const brandName = process.env.BRAND_NAME    || 'ALPHA NEWS';
  const watermark = process.env.WATERMARK_TEXT || '';
  const typeColor = TYPE_COLORS[quiz.type] || '#7C4DFF';

  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // 1. Background image
  const img = await loadImage(imgBuffer);
  drawCoverImage(ctx, img, W, H);

  // 2. Strong dark overlay for readability
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);

  // 3. Top glow
  const topGlow = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, W*0.7);
  topGlow.addColorStop(0, typeColor + '22');
  topGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, W, H);

  // 4. Brand badge top-left
  const bPX = W*0.055, bPY = H*0.038, bFS = W*0.021;
  ctx.font = `700 ${bFS}px ${FONT_BOLD}`;
  const bTW = ctx.measureText(brandName).width;
  const bPW = bFS*0.8, bPH = bFS*0.5;
  const bW  = bTW + bPW*2, bH = bFS + bPH*2;
  roundRect(ctx, bPX, bPY, bW, bH, bH/2);
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fill();
  ctx.strokeStyle = typeColor; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(brandName, bPX + bPW, bPY + bH/2);
  ctx.textBaseline = 'alphabetic';

  // 5. Anime name + type badge top-right
  const typeBadge = `${quiz.anime} • ${quiz.type.toUpperCase()}`;
  const tFS = W * 0.017;
  ctx.font = `700 ${tFS}px ${FONT_BOLD}`;
  const tTW = ctx.measureText(typeBadge).width;
  const tPW = tFS*0.75, tPH = tFS*0.5;
  const tW  = tTW + tPW*2, tH = tFS + tPH*2;
  const tPX = W - W*0.055 - tW;
  roundRect(ctx, tPX, bPY + (bH-tH)/2, tW, tH, tH/2);
  ctx.fillStyle = typeColor + 'cc'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(typeBadge, tPX + tPW, bPY + bH/2);
  ctx.textBaseline = 'alphabetic';

  // 6. ANIME QUIZ header
  const headerY = H * 0.18;
  ctx.font      = `900 ${W*0.038}px ${FONT_BOLD}`;
  ctx.fillStyle = typeColor;
  ctx.textAlign = 'center';
  ctx.fillText('ANIME QUIZ', W/2, headerY);

  // Underline
  ctx.fillStyle = typeColor;
  ctx.fillRect(W*0.35, headerY + W*0.012, W*0.30, 3);

  // 7. Question box
  const qBoxX = W*0.055, qBoxY = H*0.22;
  const qBoxW = W*0.89, qBoxH = H*0.22;
  roundRect(ctx, qBoxX, qBoxY, qBoxW, qBoxH, W*0.025);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  ctx.strokeStyle = typeColor + '66'; ctx.lineWidth = 1.5; ctx.stroke();

  // Question text
  let qFS = W * 0.042;
  let qLines;
  do {
    ctx.font = `700 ${qFS}px ${FONT_BOLD}`;
    qLines   = wrapText(ctx, quiz.q, qBoxW - W*0.08);
    if (qLines.length <= 3) break;
    qFS *= 0.92;
  } while (qFS > W*0.028);

  const qLineH  = qFS * 1.35;
  const totalQH = qLines.length * qLineH;
  let qY        = qBoxY + (qBoxH - totalQH) / 2 + qFS;

  ctx.font      = `700 ${qFS}px ${FONT_BOLD}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  for (const line of qLines) {
    ctx.fillText(line, W/2, qY);
    qY += qLineH;
  }

  // 8. Options (2x2 grid)
  const optFS   = W * 0.034;
  const optPadX = W * 0.055;
  const optPadY = H * 0.475;
  const optW    = (W - optPadX*2 - W*0.03) / 2;
  const optH    = H * 0.095;
  const optGapX = W * 0.03;
  const optGapY = H * 0.018;

  quiz.options.forEach((opt, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ox  = optPadX + col * (optW + optGapX);
    const oy  = optPadY + row * (optH + optGapY);

    // Option box
    roundRect(ctx, ox, oy, optW, optH, W*0.022);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    ctx.strokeStyle = typeColor + '88'; ctx.lineWidth = 1.5; ctx.stroke();

    // Label circle
    const lblR  = optH * 0.32;
    const lblCX = ox + lblR + W*0.022;
    const lblCY = oy + optH/2;
    ctx.beginPath();
    ctx.arc(lblCX, lblCY, lblR, 0, Math.PI*2);
    ctx.fillStyle = typeColor; ctx.fill();

    ctx.font      = `700 ${W*0.028}px ${FONT_BOLD}`;
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(LABELS[i], lblCX, lblCY);
    ctx.textBaseline = 'alphabetic';

    // Option text
    ctx.font      = `600 ${optFS}px ${FONT_MEDIUM}`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    const optTextX = lblCX + lblR + W*0.018;
    const optMaxW  = optW - (optTextX - ox) - W*0.02;
    const optLines = wrapText(ctx, opt, optMaxW);
    const optLH    = optFS * 1.2;
    const totalOptH = optLines.length * optLH;
    let optY = oy + (optH - totalOptH)/2 + optFS*0.85;
    for (const ol of optLines) {
      ctx.fillText(ol, optTextX, optY);
      optY += optLH;
    }
  });

  // 9. Comment CTA
  const ctaY = H * 0.82;
  ctx.font      = `700 ${W*0.032}px ${FONT_BOLD}`;
  ctx.fillStyle = typeColor;
  ctx.textAlign = 'center';
  ctx.fillText('Comment your answer! 👇', W/2, ctaY);

  ctx.font      = `500 ${W*0.022}px ${FONT_MEDIUM}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Follow for more anime quizzes!', W/2, ctaY + W*0.045);

  // 10. Bottom accent line
  ctx.fillStyle = typeColor + '44';
  ctx.fillRect(W*0.055, H*0.88, W*0.89, 1);

  // 11. Watermark
  if (watermark) {
    ctx.font      = `${W*0.016}px ${FONT_MEDIUM}`;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'right';
    ctx.fillText(watermark, W - W*0.04, H - H*0.022);
  }

  return canvas;
}

// ── Download background image ─────────────────────────────────────
async function downloadBg(url) {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer', timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    return Buffer.from(res.data);
  } catch {
    // Fallback dark background
    const c   = createCanvas(1080, 1350);
    const ctx = c.getContext('2d');
    const g   = ctx.createLinearGradient(0, 0, 1080, 1350);
    g.addColorStop(0, '#0a0014');
    g.addColorStop(1, '#000508');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1350);
    return c.toBuffer('image/jpeg');
  }
}

// ── Main export ───────────────────────────────────────────────────
export async function generateQuizCard() {
  const posted      = new Set(loadPosted());
  const { quiz, index, reset } = getRandomQuiz(posted);
  if (reset) savePosted([]);

  logger.info(`Quiz [${quiz.anime}/${quiz.type}]: "${quiz.q.slice(0, 50)}..."`);

  const bgBuffer = await downloadBg(quiz.bg);
  const canvas   = await renderQuizCard(quiz, bgBuffer);

  const fileName  = `quiz-${Date.now()}.jpg`;
  const filePath  = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/jpeg', 95));
  logger.success(`Quiz card saved: ${fileName}`);

  return { filePath, fileName, quiz, index };
}

export function generateQuizCaption(quiz) {
  const typeLabels = {
    power:     'Who is stronger?',
    compare:   'Who would win?',
    plot:      'Do you remember?',
    character: 'Test your knowledge!',
  };

  const tags = '#anime #animequiz #animefacts #otaku #animelife #animelover #animecommunity #weeb #animefan #manga #animequestions #animetrivia #viral #trending #foryou #foryoupage #explore #reels #instagood';

  return `${quiz.anime} Quiz — ${typeLabels[quiz.type] || 'Can you answer this?'}\n\n${quiz.q}\n\nA) ${quiz.options[0]}\nB) ${quiz.options[1]}\nC) ${quiz.options[2]}\nD) ${quiz.options[3]}\n\nComment your answer! 👇\n\n${tags}`;
}

export { IMAGES_DIR };

export function cleanupQuizImage(filePath) {
  try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); }
  catch (err) { logger.warn(`Cleanup failed: ${err.message}`); }
}
