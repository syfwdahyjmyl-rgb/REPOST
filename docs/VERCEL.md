# Deploy RepostFlow on Vercel

Vercel detects this repository as a Next.js application automatically. No custom `vercel.json` is required.

## Demo deployment

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project**, import `syfwdahyjmyl-rgb/REPOST`, and keep the detected Next.js settings.
3. Leave the TikTok variables unset. The deployed site runs in clearly labeled Demo Mode.
4. Deploy and open the generated HTTPS URL on Android Chrome.

The build command is `npm run build`; the output directory and install command should remain Vercel's defaults.

## Optional OAuth configuration

Add these as Vercel **Environment Variables** for the environments where the integration is enabled, then redeploy:

- `NEXT_PUBLIC_APP_URL` — the exact deployed HTTPS origin, for example `https://repostflow.example.com`.
- `TIKTOK_CLIENT_KEY` — the client key from TikTok for Developers.
- `TIKTOK_CLIENT_SECRET` — the client secret, stored only as a Vercel secret.
- `TIKTOK_REDIRECT_URI` — the exact registered callback, for example `https://repostflow.example.com/api/auth/tiktok/callback`.
- `SESSION_SECRET` — a random value with at least 32 characters.

Register the exact callback URL with TikTok. Never commit these values or put the client secret in a `NEXT_PUBLIC_*` variable.

## Persistence and limits

The manual assistant also keeps its demo list in browser `localStorage`, so adding, importing, and confirming items remains usable on a Vercel Demo deployment even when the serverless filesystem is ephemeral. The repository's `.data/reposts.json` is still only a local-development store and must not be treated as durable production storage. For multi-device or production persistence, replace the local store with an approved hosted database and configure its credentials through Vercel Environment Variables. Do not add a TikTok repost-deletion provider unless TikTok documents and authorizes it.

## Mobile use

Open the Vercel HTTPS URL in Android Chrome. The app is responsive and defaults to Arabic RTL; the navigation language control can switch the shell labels to English. Keep the Vercel project private if the deployment is only for personal testing, and do not expose OAuth secrets in client code.
