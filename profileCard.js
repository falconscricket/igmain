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

// ── Anime character search terms (Wallhaven — curated wallpapers) ──
// Wallhaven is a dedicated wallpaper platform (not a fanart dump), so
// results are consistently high-res, well-composed "wallpaper style"
// images — much closer to what you'd want to actually post, and it
// supports minimum-resolution filtering for real 4K.
// Popular characters across Naruto, One Piece, Attack on Titan,
// Demon Slayer, My Hero Academia, Jujutsu Kaisen, Dragon Ball,
// Bleach, Sword Art Online, Fairy Tail, Re:Zero, Konosuba.
const ANIME_GIRL_CATS = [
  'hinata hyuga', 'sakura haruno', 'tsunade naruto',
  'nami one piece', 'nico robin', 'boa hancock',
  'mikasa ackerman', 'historia reiss',
  'nezuko kamado', 'shinobu kocho', 'kanao tsuyuri',
  'mitsuri kanroji', 'aoi kanzaki demon slayer',
  'ochaco uraraka', 'himiko toga',
  'momo yaoyorozu', 'kyoka jiro',
  'nobara kugisaki', 'maki zenin', 'utahime iori', 'kasumi miwa jjk',
  'android 18', 'bulma dragon ball',
  'rukia kuchiki', 'orihime inoue',
  'winry rockbell', 'riza hawkeye',
  'erza scarlet', 'lucy heartfilia',
  'asuna sword art online',
  'power chainsaw man', 'makima chainsaw man', 'reze chainsaw man',
  'anya forger', 'yor forger',
  'rem re zero', 'emilia re zero',
  'megumin konosuba', 'aqua konosuba',
  // newer / trending anime (2023-2026)
  'frieren', 'fern frieren',
  'ai hoshino oshi no ko', 'ruby hoshino oshi no ko',
  'cha hae-in solo leveling',
  'marin kitagawa my dress-up darling',
  'kaguya shinomiya', 'chika fujiwara',
  'bocchi hitori', 'nijika ijichi bocchi the rock',
  'momo ayase dandadan',
  'chizuru mizuhara rent a girlfriend',
  'kyoko hori horimiya',
  'marcille donato delicious in dungeon',
  'albedo overlord',
  'kei karuizawa classroom of the elite',
  'nene yashiro hanako kun',
];

const ANIME_BOY_CATS = [
  'naruto uzumaki', 'sasuke uchiha', 'kakashi hatake',
  'luffy one piece', 'zoro one piece', 'sanji one piece',
  'eren yeager', 'levi ackerman',
  'tanjiro kamado', 'zenitsu agatsuma', 'inosuke hashibira',
  'izuku midoriya', 'bakugo', 'todoroki',
  'yuji itadori', 'megumi fushiguro', 'gojo satoru',
  'goku dragon ball', 'vegeta',
  'light yagami death note', 'l death note',
  'gon freecss', 'killua zoldyck',
  'edward elric',
  'natsu dragneel',
  'kirito sword art online',
  'denji chainsaw man',
  'loid forger',
  'ichigo kurosaki',
];

const ANIME_LOVE_CATS = [
  'naruto hinata', 'sasuke sakura', 'luffy nami',
  'eren mikasa', 'izuku ochaco', 'kirito asuna',
  'natsu lucy', 'loid yor', 'edward winry',
  'anime couple aesthetic', 'anime couple wallpaper',
];

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
    fs.writeFileSync(POSTED_LOG, JSON.stringify(urls.slice(-5000), null, 2));
  } catch {}
}

export function markImageAsPosted(url) {
  const posted = loadPosted();
  if (!posted.includes(url)) { posted.push(url); savePosted(posted); }
}

function isPosted(url) { return loadPosted().includes(url); }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Last-resort fallback that doesn't depend on any anime source at
// all. Used only if BOTH Wallhaven and Safebooru fail (e.g. DNS/
// network issue on the host), so a single flaky domain can never
// take the whole posting run down. Note: real photos, NOT anime —
// only fires if every anime source is completely unreachable.
function picsumFallback() {
  const seed = Date.now();
  const url = `https://picsum.photos/1080/1350?random=${seed}`;
  logger.warn(`All anime sources failed — using non-anime picsum fallback: ${url}`);
  return { imageUrl: url, type: 'love', category: 'aesthetic' };
}

function buildWallhavenQuery(term) {
  // Wallhaven treats space-separated terms as OR by default; prefix
  // each word with + so ALL words are required (proper phrase match).
  return term.split(' ').map(w => `+${w}`).join(' ');
}

// ── Primary source: Wallhaven (curated 4K wallpapers, anime only) ──
async function fetchFromWallhaven(termOptions, label) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const term = termOptions[Math.floor(Math.random() * termOptions.length)];
    try {
      const res = await axios.get('https://wallhaven.cc/api/v1/search', {
        params: {
          q: buildWallhavenQuery(term),
          categories: '010',   // general/anime/people — anime only
          purity: '100',       // SFW only
          atleast: '1920x1080', // minimum HD, plenty are true 4K
          sorting: 'random',
        },
        timeout: 15000,
      });
      const results = Array.isArray(res.data?.data) ? res.data.data : [];
      const candidates = results.filter(w => w?.path && !isPosted(w.path));
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        logger.info(`${label} [Wallhaven: ${term}] ${chosen.resolution}: ${chosen.path}`);
        return { imageUrl: chosen.path, cat: term };
      }
    } catch (e) {
      logger.warn(`${label} Wallhaven attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < 3) await sleep(500 * Math.pow(2, attempt));
    }
  }
  return null;
}

// ── Secondary source: Safebooru (used only if Wallhaven has no
// results for a term, e.g. a less-common character/pairing) ────────
async function fetchFromSafebooru(tagOptions, label) {
  const toSafebooruTag = (term) => term.trim().replace(/\s+/g, '_');
  for (let attempt = 0; attempt < 4; attempt++) {
    const term = tagOptions[Math.floor(Math.random() * tagOptions.length)];
    const tags = toSafebooruTag(term);
    try {
      const query = `${tags} rating:safe`;
      const res = await axios.get('https://safebooru.org/index.php', {
        params: { page: 'dapi', s: 'post', q: 'index', json: 1, tags: query, limit: 100, pid: Math.floor(Math.random() * 6) },
        timeout: 15000,
      });
      const posts = Array.isArray(res.data) ? res.data : [];
      const pickUrl = (p) => {
        if (p?.sample === 1 && p?.sample_url) return p.sample_url;
        if (p?.directory && p?.image) return `https://safebooru.org/images/${p.directory}/${p.image}`;
        return null;
      };
      const candidates = posts
        .map(p => ({ post: p, url: pickUrl(p) }))
        .filter(c => c.url && !isPosted(c.url));
      if (candidates.length > 0) {
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        logger.info(`${label} [Safebooru: ${tags}]: ${chosen.url}`);
        return { imageUrl: chosen.url, cat: tags };
      }
    } catch (e) {
      logger.warn(`${label} Safebooru attempt ${attempt + 1} failed: ${e.message}`);
      if (attempt < 3) await sleep(500 * Math.pow(2, attempt));
    }
  }
  return null;
}

async function fetchAnimeGirlImage() {
  let result = await fetchFromWallhaven(ANIME_GIRL_CATS, 'Anime girl');
  if (result) return { imageUrl: result.imageUrl, type: 'anime_girl', category: result.cat };
  result = await fetchFromSafebooru(ANIME_GIRL_CATS, 'Anime girl');
  if (result) return { imageUrl: result.imageUrl, type: 'anime_girl', category: result.cat };
  return picsumFallback();
}

async function fetchAnimeBoyImage() {
  let result = await fetchFromWallhaven(ANIME_BOY_CATS, 'Anime boy');
  if (result) return { imageUrl: result.imageUrl, type: 'anime_boy', category: result.cat };
  result = await fetchFromSafebooru(ANIME_BOY_CATS, 'Anime boy');
  if (result) return { imageUrl: result.imageUrl, type: 'anime_boy', category: result.cat };
  logger.warn('Boy fetch failed — falling back to girl');
  return await fetchAnimeGirlImage();
}

async function fetchLoveImage() {
  let result = await fetchFromWallhaven(ANIME_LOVE_CATS, 'Anime love');
  if (result) return { imageUrl: result.imageUrl, type: 'love', category: result.cat };
  result = await fetchFromSafebooru(ANIME_LOVE_CATS, 'Anime love');
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
// Crops to a "cover" fit, but biases the vertical crop point toward
// the top instead of dead-center. Anime character art almost always
// has the face/head in the upper portion of the image — a pure
// center-crop chops heads off when the source is much taller than
// the 4:5 canvas. focusY=0 keeps the very top, 0.5 = old center-crop.
function drawCoverImage(ctx, img, W, H, focusY = 0.22) {
  const r = img.width / img.height, cr = W / H;
  let dw, dh, dx, dy;
  if (r > cr) {
    dh = H; dw = H * r;
    dx = -(dw - W) / 2; // wide images: horizontal-only crop, center is fine
    dy = 0;
  } else {
    dw = W; dh = W / r;
    dx = 0;
    const maxCropY = dh - H; // total vertical pixels being cropped away
    dy = -maxCropY * focusY; // keep more of the top than the bottom
  }
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
