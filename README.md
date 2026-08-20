# Instagram Tech News Bot

Automatically pulls a fresh tech-news headline + photo every 2 hours from
free public RSS feeds (TechCrunch, The Verge, Ars Technica, Engadget, Wired),
composites it into a branded news card, and posts it to Instagram via the
official **Instagram Graph API**. Built with Node.js 20+, Express, and
`node-cron`, and designed to run continuously on [Railway](https://railway.app).

---

## How it works

1. `node-cron` fires on the schedule defined by `CRON_SCHEDULE` (default
   `0 */2 * * *` — every 2 hours).
2. `newsFetch.js` pulls the latest items from the configured RSS feeds,
   skips anything already posted (tracked in `posted-news.json`), and
   returns the newest unposted story that has an image.
3. `newsCard.js` downloads that photo and draws a card over it — bottom
   gradient, bold headline, brand badge, optional watermark — and saves it
   to `public/images/`.
4. `index.js` serves that folder statically, so the file is reachable at
   `PUBLIC_BASE_URL/images/<filename>.jpg`.
5. `instagram.js` calls the Instagram Graph API:
   - creates a media container pointing at that public image URL,
   - polls until Instagram finishes fetching/processing it,
   - publishes the container to the feed.
6. The Post ID is logged, the article is marked as posted, the local image
   file is deleted, and the app waits for the next scheduled run.
7. An Express server exposes `/` and `/health` for Railway's health checks.

---

## Project structure

```
.
├── index.js           # Express server, health checks, app bootstrap
├── scheduler.js        # node-cron scheduling + task orchestration
├── newsFetch.js          # RSS feed fetching, de-dup tracking, image extraction
├── newsCard.js            # Composites the headline+photo card, builds captions
├── instagram.js             # Instagram Graph API upload/publish logic
├── logger.js                # Timestamped console logger
├── package.json
├── .env.example
├── .gitignore
├── posted-news.json          # Auto-created; GUIDs already posted (gitignored)
└── public/images/           # Generated cards (served statically, gitignored)
```

---

## Requirements

- Node.js **20+**
- A Facebook Developer App with Instagram Graph API access
- An **Instagram Business or Creator account**, linked to a Facebook Page
- A publicly reachable deployment (Railway, or any host with a public URL) —
  the Graph API must be able to fetch your generated image over HTTPS

---

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable          | Required | Description                                                                 |
|-------------------|----------|-------------------------------------------------------------------------------|
| `IG_ACCESS_TOKEN` | Yes      | Long-lived Graph API access token (see setup steps below)                    |
| `IG_USER_ID`      | Yes      | Instagram Business Account ID (not the Facebook Page ID)                     |
| `PORT`            | No       | Port for the Express server (Railway sets this automatically)                |
| `CRON_SCHEDULE`   | No       | Cron expression for posting frequency. Default: `0 */2 * * *` (every 2 hrs)  |
| `RUN_ON_STARTUP`  | No       | If `true`, runs one post immediately when the app starts (default `false`)   |
| `PUBLIC_BASE_URL` | Yes      | Public HTTPS URL of this deployed app, e.g. `https://your-app.up.railway.app`|
| `NEWS_FEEDS`      | No       | Comma-separated RSS feed URLs. Default: TechCrunch, The Verge, Ars Technica, Engadget, Wired |
| `BRAND_NAME`      | No       | Brand text in the top-left badge on every card (default `TECH BYTES`)        |
| `WATERMARK_TEXT`  | No       | Small bottom-right watermark (e.g. an email/handle). Blank = omitted          |
| `ACCENT_COLOR`    | No       | Hex color for the logo dot / source tag (default `#7c4dff`)                  |
| `NEWS_CARD_SIZE`  | No       | Square canvas size in px (default `1080`, Instagram's native size)           |

---

## Instagram Business account & Graph API setup

Instagram's Content Publishing API only works with **Business or Creator**
accounts connected to a Facebook Page, accessed through a Facebook Developer
App. Steps:

1. **Convert your Instagram account** to a Business or Creator account
   (Instagram app → Settings → Account type and tools → Switch to
   Professional Account).
2. **Link it to a Facebook Page.** Every Instagram Business account must be
   connected to a Facebook Page you manage (Instagram app → Settings →
   Business → linked Facebook Page, or via Facebook Page Settings →
   Linked Accounts).
3. **Create a Facebook App** at [developers.facebook.com](https://developers.facebook.com/apps).
   - Add the **Instagram Graph API** product to the app.
   - Under App Review, request (or use in Development mode with test users)
     the following permissions:
     - `instagram_basic`
     - `instagram_content_publish`
     - `pages_show_list`
     - `pages_read_engagement`
     - `business_management`
4. **Generate a User Access Token** using the Graph API Explorer
   (developers.facebook.com/tools/explorer), selecting your app and the
   permissions above.
5. **Exchange it for a long-lived token** (valid ~60 days) using:
   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
       ?grant_type=fb_exchange_token
       &client_id={app-id}
       &client_secret={app-secret}
       &fb_exchange_token={short-lived-token}
   ```
   Use this long-lived token as `IG_ACCESS_TOKEN`. Since it still expires,
   plan to refresh it periodically (see Troubleshooting below).
6. **Find your Instagram Business Account ID** (this is `IG_USER_ID`, and is
   different from both your Facebook Page ID and your Instagram username):
   ```
   GET https://graph.facebook.com/v21.0/{page-id}?fields=instagram_business_account&access_token={token}
   ```
   The response contains `instagram_business_account.id` — that's your
   `IG_USER_ID`.

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env with your real IG_ACCESS_TOKEN, IG_USER_ID, PUBLIC_BASE_URL, etc.

# 3. Start the app
npm start
```

The Express server starts on `PORT` (default 3000) and the cron scheduler
starts alongside it. You should see:

```
[INFO] Health check server listening on port 3000
[INFO] Scheduler starting with cron expression: "0 */2 * * *" (every 2 hours by default)
```

### Testing without waiting 2 hours

Two options:

- Set `RUN_ON_STARTUP=true` in `.env` to fire a post immediately on boot.
- While the app is running, trigger a run manually:
  ```bash
  curl -X POST http://localhost:3000/run-now
  ```
  (This calls the same `runTask()` the cron job uses, and logs progress to
  the console.)

> **Note on local testing:** Instagram must be able to reach
> `PUBLIC_BASE_URL/images/<file>` over the public internet. Running purely
> on `localhost` will fail at the "create media container" step unless you
> expose your local server with a tunneling tool (e.g. `ngrok http 3000`)
> and set `PUBLIC_BASE_URL` to the resulting HTTPS URL.

---

## Deploying to Railway

1. Push this project to a GitHub repository.
2. In [Railway](https://railway.app), click **New Project → Deploy from GitHub repo**
   and select the repository.
3. Railway auto-detects Node.js and will run `npm install` then `npm start`
   (from `package.json`'s `scripts`). No `Procfile` is needed.
4. Go to the service's **Variables** tab and add:
   - `IG_ACCESS_TOKEN`
   - `IG_USER_ID`
   - `CRON_SCHEDULE` (optional — defaults to every 2 hours)
   - `RUN_ON_STARTUP` (optional)
   - `PUBLIC_BASE_URL` — set this to your Railway-generated domain, e.g.
     `https://your-app.up.railway.app` (found under **Settings → Networking →
     Generate Domain** if you haven't enabled one yet)

   Do **not** set `PORT` manually — Railway injects it automatically and
   `index.js` already reads `process.env.PORT`.
5. Under **Settings → Networking**, make sure a **public domain** is
   generated — the Graph API needs to fetch images from `PUBLIC_BASE_URL`,
   so the service must be publicly reachable (not internal-only).
6. Deploy. Check the **Deployments → Logs** tab to confirm you see:
   ```
   [INFO] Health check server listening on port ...
   [INFO] Scheduler starting with cron expression: "0 */2 * * *" ...
   ```
7. (Optional) Configure a Railway **Health Check** pointing at `/health` so
   Railway can detect and restart the service if it ever becomes unresponsive.

---

## Logging

Every run logs a consistent sequence so progress is easy to follow in
Railway's log viewer:

```
[INFO] Starting scheduled task...
[INFO] Fetching tech news + generating card...
[INFO] Fetched news item: "..." (TechCrunch)
[INFO] Uploading to Instagram...
[INFO] Publishing...
[SUCCESS] Success! Instagram Post ID: 179...
[INFO] Waiting for next schedule...
```

Failures are logged with `[ERROR]` and full details but never crash the
process — the scheduler keeps running and will simply try again on the next
cron tick.

---

## Error handling & resilience

- **Image download**: retried up to 3 times with a delay between attempts
  before giving up on that run.
- **Instagram upload/publish**: each Graph API call (create container,
  publish) is retried up to 3 times independently.
- **Container processing**: the app polls the container's `status_code`
  until it's `FINISHED` before attempting to publish, since Instagram
  processes the fetched image asynchronously.
- **Overlap protection**: if a run is still in progress when the next cron
  tick fires, the new trigger is skipped rather than running two posts
  concurrently.
- **Process-level safety nets**: `unhandledRejection` and `uncaughtException`
  handlers log the error instead of letting the process crash, and
  `SIGTERM`/`SIGINT` are handled for graceful shutdown on redeploys.
- **Cleanup**: downloaded images are deleted from disk after each run
  (success or failure) to avoid unbounded disk usage.

---

## Troubleshooting

**"Missing IG_ACCESS_TOKEN or IG_USER_ID environment variables"**
Double-check both variables are set in Railway's Variables tab (or your
local `.env`) and that the service has redeployed since adding them.

**Media container creation fails with an OAuth/permissions error**
Your access token likely lacks `instagram_content_publish`, has expired, or
your Instagram account isn't a Business/Creator account properly linked to
the Facebook Page tied to your app. Regenerate the token via the Graph API
Explorer and re-check the permissions listed in the setup section above.

**Container status stays `IN_PROGRESS` and eventually times out**
Instagram couldn't fetch the image in time. Confirm `PUBLIC_BASE_URL` is
correct, publicly reachable (test it by opening
`PUBLIC_BASE_URL/images/<file>.jpg` in a browser), served over HTTPS, and
that the app hasn't already deleted the file before Instagram finished
fetching it.

**Access token expired after ~60 days**
Long-lived user tokens expire periodically. Generate a new long-lived token
using the token-exchange endpoint (see setup step 5) and update
`IG_ACCESS_TOKEN` in Railway. For a fully hands-off setup, consider building
a small separate token-refresh routine using Meta's refresh endpoint before
tokens expire.

**Pollinations image generation is slow or times out**
Pollinations is a free, best-effort service and can occasionally be slow.
The bot already retries failed downloads automatically; increase
`retryDelayMs` in `ai.js` if you see frequent timeouts.

**Nothing posts and no errors appear**
Check that the cron expression in `CRON_SCHEDULE` is valid and check
Railway's logs for the `Scheduler starting with cron expression...` line to
confirm the schedule that was actually loaded. Use `RUN_ON_STARTUP=true` or
`POST /run-now` to trigger an immediate run for debugging.

---

## License

MIT
