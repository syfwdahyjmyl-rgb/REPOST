# RepostFlow

RepostFlow is a demo-first, local Next.js workspace for keeping an honest list of TikTok repost links and guiding a user through TikTok's own **Remove repost** action. It is an independent project and is not endorsed by TikTok.

The current TikTok developer documentation does not describe an authorized API for listing a user's reposts or removing them. RepostFlow therefore keeps real repost listing, single-item deletion, and bulk deletion disabled. The manual assistant opens an official TikTok URL, records the user's confirmation, and never claims that TikTok verified a deletion.

## Run it on Windows

Requirements: Node.js 20.9 or newer.

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The application starts without credentials in clearly labeled Demo Mode and uses fictional sample records. No TikTok password is requested.

Checks:

```powershell
npm run typecheck
npm test
npm run build
npm run start
```

The production server is available at <http://localhost:3000> after `npm run build` and `npm run start`. Next's production build skips its own worker type-check because that worker is unreliable in some constrained containers; `npm run typecheck` is the strict check that must pass before a build is accepted.

## What is implemented

- Responsive dark dashboard with Arabic RTL as the default and an English navigation toggle.
- Demo landing page, dashboard, manual assistant, activity history, and settings screens.
- Manual URL validation restricted to HTTPS `tiktok.com` hosts.
- Local JSON persistence in `.data/reposts.json`, with atomic writes and ignored local data.
- Browser `localStorage` fallback keeps the Demo Mode list usable on Vercel's ephemeral serverless filesystem.
- Manual completion requires explicit confirmation and a timestamp; removed records retain verification metadata.
- CSV import/export with size limits, duplicate detection, required columns, URL validation, and spreadsheet-formula protection.
- Official OAuth Login Kit scaffolding under `/api/auth/tiktok/*`, with signed one-time state, encrypted HttpOnly session cookie, safe error responses, logout, and disconnect. Real mode stays disabled until all required local environment values exist.
- Demo provider that exposes fictional data and explicitly returns `manual_required`; it never fakes deletion.
- TikTok deletion endpoints are intentionally unavailable; local tracking data can be cleared from Settings.

The API routes used by the manual assistant are:

- `GET /api/reposts` — local records.
- `GET /api/reposts?provider=demo` — fictional provider records.
- `POST /api/reposts` — validated JSON or CSV import.
- `GET /api/reposts/:id` — one local record.
- `POST /api/reposts/:id` with `action=complete-manual` — save a user confirmation.
- `GET /api/reposts/export` — download the local list as CSV.
- `DELETE /api/reposts` — clear only local tracking data after an explicit user confirmation.
- `GET /api/account` — return non-secret connection status and disabled repost capabilities.
- `POST /api/auth/tiktok/disconnect` — clear an integration session when configured.

## Optional TikTok connection

Copy the template and edit it locally; never paste secrets into chat or commit them:

```powershell
Copy-Item .env.example .env.local
```

Set the approved values from the TikTok developer console:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback
SESSION_SECRET=use-at-least-32-random-characters
```

Register the exact redirect URI with TikTok, restart the dev server, and use the connection control in Settings. If TikTok requires an HTTPS callback for the current app configuration, use a secure development tunnel and register that exact URL. Login approval still does not grant repost-management capabilities.

Read [docs/TIKTOK_SETUP.md](docs/TIKTOK_SETUP.md) before creating an app. Read [docs/FEASIBILITY.md](docs/FEASIBILITY.md) for the dated research and [docs/SECURITY.md](docs/SECURITY.md) for the security model. For a public HTTPS deployment, follow [docs/VERCEL.md](docs/VERCEL.md).

## Project layout

- `app/` — Next.js routes and pages.
- `components/` — responsive dashboard and manual assistant UI.
- `lib/` — provider contract, demo provider, validation, CSV, persistence, and OAuth helpers.
- `docs/` — feasibility, setup, and security documentation.
- `tests/` — domain and import/export tests that never call TikTok.

Do not add private TikTok endpoints, cookie extraction, scraping, CAPTCHA bypass, automated UI clicks, or a fake TikTok “Delete all” control. Reassess the provider only when TikTok publishes an endpoint, scope, authorization requirement, response semantics, and Sandbox behavior for the exact operation.
