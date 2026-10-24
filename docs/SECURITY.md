# Security

RepostFlow is intended to use TikTok's documented OAuth flow and to keep the
user in control of any repost-removal action. The project must never request a
TikTok password, use private APIs, or claim that an item was removed without a
verified result.

## OAuth and tokens

- Register redirect URIs exactly as they are used in the application. Use
  HTTPS in production and do not accept arbitrary `redirect_uri` values from a
  browser request.
- Use the documented authorization-code flow and a cryptographically random,
  single-use `state` value. Add PKCE (`S256`) only when the current TikTok
  Login Kit documentation supports it; do not invent provider parameters. Bind
  any verifier and the state to the initiating session, expire them quickly,
  and reject reuse or mismatches.
- Exchange the code on the server. Keep the TikTok client secret and all access
  or refresh tokens server-side; never put them in `NEXT_PUBLIC_*` variables,
  HTML, URLs, client JavaScript, or analytics events.
- Store only the scopes the product needs. Encrypt tokens at rest when they are
  persisted, limit database access, set an expiry, and refresh or revoke them
  according to TikTok's documentation. Remove tokens when a user disconnects
  or when the authorization is revoked.
- Do not log authorization codes, state values, PKCE verifiers, tokens, client
  secrets, or complete provider responses. Redact authorization headers and
  sensitive query parameters in errors and request logs.

## Sessions and cookies

Use a server-managed session with a high-entropy secret. Session cookies must be
`Secure`, `HttpOnly`, and have an appropriate `SameSite` policy (`Lax` is a
reasonable default for the OAuth callback). Rotate the session identifier after
login and privilege changes, expire idle and absolute sessions, and provide a
logout path that invalidates the server-side session. Do not place tokens or
personal data in a client-readable cookie.

## CSRF and request validation

Protect every state-changing application endpoint (including connect,
disconnect, delete, and settings actions) with a server-checked CSRF token or a
same-origin, equivalent mechanism. Check `Origin`/`Referer` where appropriate,
use `POST`/`DELETE` rather than state-changing `GET` requests, and validate
content types and request bodies. OAuth `state` protects the callback; it does
not replace CSRF protection on the rest of the application.

Validate OAuth callback parameters, issuer/provider responses, user ownership,
IDs, and redirect destinations on the server. Apply rate limits to login,
callback, token, and destructive endpoints, and return generic errors that do
not reveal whether an account or token exists.

## Local data and development

Keep local databases, session stores, downloaded exports, and debug logs out of
version control. Ensure `.env.local` is ignored by Git, use it for development
secrets, and copy the non-secret variable names from `.env.example`. Use separate credentials
and OAuth applications for development and production. Do not use real user
data in fixtures or screenshots; clear local data before sharing a workspace.

Collect the minimum data needed to show repost status and user actions. Define
retention and deletion behavior, provide disconnect/delete controls, and avoid
storing TikTok content or identifiers unless the feature requires them. Protect
backups and local files with operating-system permissions.

In production, enforce HTTPS, a restrictive Content Security Policy, clickjacking
protection (`frame-ancestors`/`X-Frame-Options`), and secure referrer and
permissions policies. Keep dependencies and the runtime patched, and review
provider API and scope changes before enabling them.

## Reporting a vulnerability

Please do not open a public issue containing credentials, tokens, personal data,
or an exploitable proof of concept. Report privately to the repository
maintainer with the affected component, reproduction steps, impact, and a safe
contact address. Revoke exposed credentials immediately, preserve relevant
logs, and notify affected users and providers when required.
