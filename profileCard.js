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

// ── Anime character tags (Safebooru, rating:safe only) ────────────
// These pull real character art (Naruto/One Piece etc.) instead of the
// generic non-character categories waifu.pics offered.
const ANIME_GIRL_CATS = ['hinata_hyuga', 'sakura_haruno', 'nami_(one_piece)', 'nico_robin', 'boa_hancock', 'tsunade_(naruto)'];
const ANIME_BOY_CATS  = ['naruto_uzumaki', 'sasuke_uchiha', 'kakashi_hatake', 'monkey_d._luffy', 'roronoa_zoro'];
const ANIME_LOVE_CATS = ['naruto_uzumaki hinata_hyuga', 'sasuke_uchiha sakura_haruno', 'monkey_d._luffy nami_(one_piece)'];

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Last-resort fallback that doesn't depend on Safebooru at all. Used
// only if every tag search fails (e.g. DNS/network issue on the host),
// so a single flaky domain can never take the whole posting run down.
// Note: this is real photos, NOT anime — it only fires if the anime
// source is completely unreachable.
function picsumFallback() {
  const seed = Date.now();
  const url = `https://picsum.photos/1080/1350?random=${seed}`;
  logger.warn(`All Safebooru attempts failed — using non-anime picsum fallback: ${url}`);
  return { imageUrl: url, type: 'love', category: 'aesthetic' };
}

// ── Image fetch with retry ────────────────────────────────────────
// Generic helper: searches Safebooru (SFW-only board) for the given
// character tag(s), tries up to 5 times with short exponential
// backoff between attempts.
async function fetchFromSafebooru(tagOptions, label) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const tags = tagOptions[Math.floor(Math.random() * tagOptions.length)];
    try {
      const query = `${tags} rating:safe`;
      const res = await axios.get('https://safebooru.org/index.php', {
        params: { page: 'dapi', s: 'post', q: 'index', json: 1, tags: query, limit: 100 },
        timeout: 15000,
      });
      const posts = Array.isArray(res.data) ? res.data : [];
      const candidates = posts.filter(p => p?.directory && p?.image && !isPosted(`https://safebooru.org/images/${p.directory}/${p.image}`));
      if (candidates.length > 0) {
        const post = candidates[Math.floor(Math.random() * candidates.length)];
        const url = `https://safebooru.org/images/${post.directory}/${post.image}`;
        logger.info(`${label} [${tags}]: ${url}`);
        return { imageUrl: url, cat: tags };
      }
    } catch (e) {
      logger.warn(`${label} fetch attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < 4) await sleep(500 * Math.pow(2, attempt)); // 500ms, 1s, 2s, 4s
    }
  }
  return null;
}

async function fetchAnimeGirlImage() {
  const result = await fetchFromSafebooru(ANIME_GIRL_CATS, 'Anime girl');
  if (result) return { imageUrl: result.imageUrl, type: 'anime_girl', category: result.cat };
  return picsumFallback();
}

async function fetchAnimeBoyImage() {
  const result = await fetchFromSafebooru(ANIME_BOY_CATS, 'Anime boy');
  if (result) return { imageUrl: result.imageUrl, type: 'anime_boy', category: result.cat };
  logger.warn('Boy fetch failed — falling back to girl');
  return await fetchAnimeGirlImage();
}

async function fetchLoveImage() {
  const result = await fetchFromSafebooru(ANIME_LOVE_CATS, 'Anime love');
  if (result) return { imageUrl: result.imageUrl, type: 'love', category: result.cat };
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
