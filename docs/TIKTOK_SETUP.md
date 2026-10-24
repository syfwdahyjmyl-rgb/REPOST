# TikTok developer setup for RepostFlow

This guide covers account connection only. It does not unlock repost listing or deletion; TikTok's public documentation currently does not document those operations (see [FEASIBILITY.md](./FEASIBILITY.md)). Never send a password, client secret, or access token in chat or commit one to Git.

## 1. Create a developer account and app

1. Open [TikTok for Developers](https://developers.tiktok.com/) and sign in with the TikTok account you control.
2. Follow TikTok's current developer onboarding flow and create an app. Product names, eligibility checks, and console labels can change, so use the labels shown in the console and its linked documentation.
3. Enable **Login Kit for Web** only after reading the current [Login Kit for Web documentation](https://developers.tiktok.com/docs/en/login-kit-web). Select only documented scopes required by the profile/account screen. There is no documented scope for repost listing or removal.
4. Complete the app's basic information and redirect-URI configuration in the developer console. The URI in the console must exactly match the URI sent by the app, including scheme, host, path, and any trailing slash. Follow TikTok's current HTTPS/localhost rules; do not assume a public deployment is required or that an arbitrary HTTP URL is accepted.

## 2. Optional Sandbox setup

Use [Add a Sandbox](https://developers.tiktok.com/docs/en/add-a-sandbox) for documented test flows:

1. Open the app's Sandbox section in the developer console.
2. Create/configure the Sandbox using the options currently offered by TikTok.
3. Add your own TikTok account as a target/test user exactly as the Sandbox documentation describes, then complete any account-side authorization steps.
4. Test Login Kit and only the products/scopes that TikTok states are available in that Sandbox. A successful Sandbox login is not evidence that repost listing, repost removal, or bulk removal exists.

If the console does not offer a requested product, scope, or target-user action, stop at that point and follow TikTok's current eligibility/review process. Do not work around the restriction.

## 3. Configure RepostFlow locally

Copy the repository's environment template and fill values locally (never paste them into chat):

```powershell
Copy-Item .env.example .env.local
```

Set the placeholders used by this app, for example:

```dotenv
TIKTOK_CLIENT_KEY=replace-with-the-client-key-from-the-console
TIKTOK_CLIENT_SECRET=replace-with-the-client-secret-from-the-console
TIKTOK_REDIRECT_URI=https://your-authorized-host.example.com/auth/tiktok/callback
```

Use the exact variable names in the repository's `.env.example`; the names above are configuration names, not additional TikTok API fields. Keep `.env.local` ignored by Git, restrict access to the file, and rotate the secret through TikTok if it is exposed.

For local development, choose a redirect URI that TikTok's current console accepts. If a public HTTPS callback is required, use a secure development tunnel or a hosted HTTPS development URL whose callback is controlled by you, then register that exact URL. Do not expose the client secret in browser code or tunnel logs.

## 4. Test the connection

1. Start RepostFlow in Demo Mode first and confirm the UI labels demo data as fictional.
2. Add the approved values to `.env.local`, restart the development server, and select **Connect with TikTok**.
3. Confirm that the browser reaches TikTok's official authorization page and returns to the exact registered callback.
4. Verify success and failure handling, then disconnect the account and confirm local session data is cleared according to the app's settings.
5. Do not expect a repost list or removal button. The supported path is the manual assistant: open each official TikTok URL, use TikTok's own **Remove repost** action, and record your confirmation.

## 5. Approval and production limits

Read the current [App review guidelines](https://developers.tiktok.com/docs/en/app-review-guidelines) before requesting production access. Personal use does not automatically waive TikTok's product eligibility, scope consent, review, redirect-URI, rate-limit, or terms requirements. Approval for Login Kit does not approve undocumented repost operations. If review or eligibility is unavailable, keep RepostFlow in Demo Mode/manual mode and do not attempt private APIs or UI automation.

## 6. Troubleshooting checklist

- **Redirect mismatch:** compare the registered URI and the app value character by character.
- **Missing scope/product:** verify that the product is enabled and that the scope is listed in TikTok's current scopes documentation; do not invent a scope.
- **Sandbox account rejected:** check the Sandbox target-user instructions and account eligibility in the current console.
- **Approval pending/denied:** retain manual mode; do not treat credentials as approval.
- **Secret exposure:** revoke/rotate it in TikTok's developer console, replace the local value, and review logs.
