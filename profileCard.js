/**
 * profileCard.js
 * ---------------------------------------------------------------
 * Anime (girl + boy alternating) + Love aesthetic images
 * High quality, no repeats, proper hashtags
 * 1080x1350 portrait
 * ---------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { logger } from './logger.js';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const FONTS_DIR  = path.join(__dirname, 'public', 'fonts');
const POSTED_LOG = path.join(__dirname, 'posted-profiles.json');

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
const FONT_MEDIUM = registeredFonts.includes('Poppins-Medium') ? 'Poppins-Medium' : 'sans-serif';

// ── Track last type for alternating ──────────────────────────────
let lastType = 'love'; // start with anime girl first

// ── Anime girl categories (waifu.pics SFW) ───────────────────────
const ANIME_GIRL_CATS = ['waifu', 'neko', 'shinobu', 'megumin', 'smile', 'happy', 'blush', 'wave', 'dance'];

// ── Anime boy categories (waifu.pics SFW) ────────────────────────
const ANIME_BOY_CATS  = ['husbando', 'kitsune'];

// ── Anime love/couple categories (waifu.pics SFW) ─────────────────
const ANIME_LOVE_CATS = ['hug', 'kiss', 'cuddle', 'handhold'];

// ── De-dup tracking ───────────────────────────────────────────────
function loadPosted() {
  try {
    if (fs.existsSync(POSTED_LOG)) return JSON.parse(fs.readFileSync(POSTED_LOG, 'utf-8')) || [];
  } catch {}
  return [];
}

function savePosted(urls) {
  try {
    const dir = path.dirname(POSTED_LOG);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POSTED_LOG, JSON.stringify(urls.slice(-200), null, 2));
  } catch {}
}

export function markImageAsPosted(url) {
  const posted = loadPosted();
  if (!posted.includes(url)) { posted.push(url); savePosted(posted); }
}

function isPosted(url) { return loadPosted().includes(url); }

// ── Image fetch with retry ────────────────────────────────────────
async function fetchAnimeGirlImage() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const cat = ANIME_GIRL_CATS[Math.floor(Math.random() * ANIME_GIRL_CATS.length)];
    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 15000 });
      const url = res.data?.url;
      if (url && !isPosted(url)) {
        logger.info(`Anime girl [${cat}]: ${url}`);
        return { imageUrl: url, type: 'anime_girl', category: cat };
      }
    } catch (e) { logger.warn(`Girl fetch attempt ${attempt+1} failed: ${e.message}`); }
  }
  throw new Error('Could not fetch unique anime girl image');
}

async function fetchAnimeBoyImage() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const cat = ANIME_BOY_CATS[Math.floor(Math.random() * ANIME_BOY_CATS.length)];
    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 15000 });
      const url = res.data?.url;
      if (url && !isPosted(url)) {
        logger.info(`Anime boy [${cat}]: ${url}`);
        return { imageUrl: url, type: 'anime_boy', category: cat };
      }
    } catch (e) { logger.warn(`Boy fetch attempt ${attempt+1} failed: ${e.message}`); }
  }
  // Fallback to girl if boy fails
  logger.warn('Boy fetch failed — falling back to girl');
  return await fetchAnimeGirlImage();
}

async function fetchLoveImage() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const cat = ANIME_LOVE_CATS[Math.floor(Math.random() * ANIME_LOVE_CATS.length)];
    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${cat}`, { timeout: 15000 });
      const url = res.data?.url;
      if (url && !isPosted(url)) {
        logger.info(`Anime love [${cat}]: ${url}`);
        return { imageUrl: url, type: 'love', category: cat };
      }
    } catch (e) { logger.warn(`Love fetch attempt ${attempt+1} failed: ${e.message}`); }
  }
  // Fallback to girl if love couple images fail
  logger.warn('Love fetch failed — falling back to anime girl');
  return await fetchAnimeGirlImage();
}

async function downloadBuffer(imageUrl) {
  const res = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 25000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)' },
  });
  return Buffer.from(res.data);
}

// ── Card renderer ─────────────────────────────────────────────────
function drawCoverImage(ctx, img, W, H) {
  const r = img.width / img.height, cr = W / H;
  let dw, dh, dx, dy;
  if (r > cr) { dh = H; dw = H * r; dx = -(dw - W) / 2; dy = 0; }
  else         { dw = W; dh = W / r; dx = 0; dy = -(dh - H) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

async function renderCard(imgBuffer, watermark) {
  const W = 1080, H = 1350;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  const img = await loadImage(imgBuffer);
  drawCoverImage(ctx, img, W, H);

  // Subtle vignette
  const vig = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.80);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // Watermark bottom-right only
  if (watermark) {
    ctx.font      = `500 ${W * 0.018}px ${FONT_MEDIUM}`;
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.textAlign = 'right';
    ctx.fillText(watermark, W - W * 0.04, H - H * 0.022);
  }

  return canvas;
}

// ── Captions ──────────────────────────────────────────────────────
const CAPTIONS = {
  anime_girl: [
    "She carries the universe in her eyes ✨🌸",
    "Soft but strong — just like her 🌙💜",
    "Living in my own anime world 🌸✨",
    "Her smile could end any war 🌸💕",
    "Kawaii and powerful at the same time 💜✨",
    "The kind of beauty that stops time 🌙🌸",
    "She's not just a character, she's a feeling 💫",
    "Gentle heart, fierce soul 🌸⚡",
    "Lost in her aesthetic 🌙💜",
    "This energy is unmatched ✨🌸",
  ],
  anime_boy: [
    "The protagonist energy is real ⚡💙",
    "Cool, calm and absolutely unreal 🌙💙",
    "He walks like he owns the plot 💙✨",
    "Silent type. Loudest presence 🌙⚡",
    "Built different from the start 💙🔥",
    "The kind of character you never forget 💫",
    "Dark academia anime vibes 🌙💙",
    "His story isn't over yet ⚡💙",
    "Mysterious and magnetic 🌙✨",
    "Every frame he's in is a masterpiece 💙🔥",
  ],
  love: [
    "Love is the answer ❤️✨",
    "Falling in love with life, one moment at a time 🌸",
    "Soft life. Love life. Good vibes only 💕✨",
    "Romance is everywhere if you look close enough 🌹",
    "Your vibe attracts your tribe 💕",
    "Beauty in the little things 🌸✨",
    "Chasing sunsets and good feelings 💕🌙",
    "Aesthetic mood, loving heart 💜🌸",
    "Every moment is beautiful when you choose love ❤️",
    "Dreamy, soft, and full of love 🌸💕",
  ],
};

// ── Hashtags ──────────────────────────────────────────────────────
const HASHTAGS = {
  anime_girl: '#anime #animegirl #animeart #kawaii #waifu #otaku #animeaesthetic #mangagirl #animelover #animestyle #animecharacter #kawaiigirl #animefan #cuteanimegirl #animelife #viral #trending #foryou #foryoupage #explore #reels #instagood',
  anime_boy:  '#anime #animeboy #animeart #otaku #husbando #animestyle #animeaesthetic #mangaboy #animelover #coolanimeguy #animecharacter #animefan #animelife #darkacademia #viral #trending #foryou #foryoupage #explore #reels #instagood',
  love:       '#love #aesthetic #loveaesthetic #romance #beautiful #softaesthetic #lofi #chill #dreamy #pastel #cottagecore #aestheticpics #pinkvibes #softhues #cozy #viral #trending #foryou #foryoupage #explore #reels #instagood',
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Main export ───────────────────────────────────────────────────
export async function generateProfileCard() {
  const watermark = process.env.WATERMARK_TEXT || '';

  // Rotate: anime_girl → anime_boy → love → anime_girl → ...
  let fetchType;
  if (lastType === 'love')       fetchType = 'anime_girl';
  else if (lastType === 'anime_girl') fetchType = 'anime_boy';
  else                           fetchType = 'love';
  lastType = fetchType;

  let imageData;
  try {
    if (fetchType === 'anime_girl')      imageData = await fetchAnimeGirlImage();
    else if (fetchType === 'anime_boy')  imageData = await fetchAnimeBoyImage();
    else                                 imageData = await fetchLoveImage();
  } catch (err) {
    logger.warn(`Fetch failed: ${err.message} — fallback to love`);
    imageData = await fetchLoveImage();
  }

  const imgBuffer = await downloadBuffer(imageData.imageUrl);
  const canvas    = await renderCard(imgBuffer, watermark);

  const fileName  = `profile-${Date.now()}.jpg`;
  const filePath  = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/jpeg', 95));
  logger.success(`Card: ${fileName} [${imageData.type}]`);

  return {
    filePath,
    fileName,
    type:     imageData.type,
    category: imageData.category,
    imageUrl: imageData.imageUrl,
  };
}

export function generateProfileCaption(type) {
  const caption  = pickRandom(CAPTIONS[type]  || CAPTIONS.love);
  const hashtags = HASHTAGS[type] || HASHTAGS.love;
  return `${caption}\n\n${hashtags}`;
}

export function cleanupProfileImage(filePath) {
  try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); }
  catch (err) { logger.warn(`Cleanup failed: ${err.message}`); }
}

export { IMAGES_DIR };
