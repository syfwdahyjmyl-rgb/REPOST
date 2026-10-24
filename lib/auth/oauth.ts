import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";

const STATE_COOKIE = "repostflow_oauth_state";
const SESSION_COOKIE = "repostflow_session";
const STATE_MAX_AGE = 10 * 60;
const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_REVOKE_URL = "https://open.tiktokapis.com/v2/oauth/revoke/";

type OAuthConfig = { clientKey: string; clientSecret: string; redirectUri: string; sessionSecret: string; appUrl: string };
export type TikTokSession = { accessToken: string; refreshToken?: string; expiresAt?: number; openId?: string };

function value(name: string) { return process.env[name]?.trim() ?? ""; }
export function getOAuthConfig(): OAuthConfig | null {
  const config = { clientKey: value("TIKTOK_CLIENT_KEY"), clientSecret: value("TIKTOK_CLIENT_SECRET"), redirectUri: value("TIKTOK_REDIRECT_URI"), sessionSecret: value("SESSION_SECRET"), appUrl: value("NEXT_PUBLIC_APP_URL") || "http://localhost:3000" };
  // Do not enable token handling with the example placeholder or a weak signing key.
  if (!config.clientKey || !config.clientSecret || !config.redirectUri || config.sessionSecret.length < 32 || config.sessionSecret === "replace-with-a-long-random-value") return null;
  return config;
}
export const isOAuthConfigured = () => getOAuthConfig() !== null;

function key(secret: string) { return createHash("sha256").update(secret).digest(); }
function sign(secret: string, text: string) { return createHmac("sha256", secret).update(text).digest("base64url"); }
function validSignature(secret: string, text: string, signature: string) {
  const expected = sign(secret, text);
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function oauthCookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/api/auth", maxAge };
}
export async function issueState() {
  const config = getOAuthConfig();
  if (!config) return null;
  const state = randomBytes(32).toString("base64url");
  const signed = `${state}.${sign(config.sessionSecret, state)}`;
  (await cookies()).set(STATE_COOKIE, signed, oauthCookieOptions(STATE_MAX_AGE));
  return state;
}
export async function consumeState(candidate: string | null) {
  const config = getOAuthConfig();
  const jar = await cookies();
  const stored = jar.get(STATE_COOKIE)?.value ?? "";
  jar.delete(STATE_COOKIE);
  if (!config || !candidate || !stored) return false;
  const [state, signature] = stored.split(".");
  return state === candidate && !!signature && validSignature(config.sessionSecret, state, signature);
}

export function authorizationUrl(state: string, config = getOAuthConfig()) {
  if (!config) return null;
  const url = new URL(TIKTOK_AUTHORIZE_URL);
  url.searchParams.set("client_key", config.clientKey);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "user.info.basic");
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", state);
  return url;
}

export async function exchangeCode(code: string) {
  const config = getOAuthConfig();
  if (!config || !code) return null;
  const response = await fetch(TIKTOK_TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_key: config.clientKey, client_secret: config.clientSecret, code, grant_type: "authorization_code", redirect_uri: config.redirectUri }), cache: "no-store" });
  if (!response.ok) throw new Error(`TikTok token exchange failed (${response.status})`);
  const data = await response.json() as { access_token?: string; refresh_token?: string; expires_in?: number; open_id?: string; error?: string };
  if (!data.access_token) throw new Error(data.error || "TikTok token response did not include an access token");
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined, openId: data.open_id } satisfies TikTokSession;
}

function encrypt(session: TikTokSession, secret: string) {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${ciphertext.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
}
function decrypt(value: string, secret: string): TikTokSession | null {
  try { const [ivText, cipherText, tagText] = value.split("."); if (!ivText || !cipherText || !tagText) return null; const decipher = createDecipheriv("aes-256-gcm", key(secret), Buffer.from(ivText, "base64url")); decipher.setAuthTag(Buffer.from(tagText, "base64url")); return JSON.parse(Buffer.concat([decipher.update(Buffer.from(cipherText, "base64url")), decipher.final()]).toString("utf8")) as TikTokSession; } catch { return null; }
}
export async function saveSession(session: TikTokSession) { const config = getOAuthConfig(); if (!config) return; (await cookies()).set(SESSION_COOKIE, encrypt(session, config.sessionSecret), { ...oauthCookieOptions(60 * 60 * 24 * 30), path: "/" }); }
export async function readSession() { const config = getOAuthConfig(); if (!config) return null; const raw = (await cookies()).get(SESSION_COOKIE)?.value; return raw ? decrypt(raw, config.sessionSecret) : null; }
export async function clearSession() { (await cookies()).set(SESSION_COOKIE, "", { ...oauthCookieOptions(0), path: "/" }); }
export async function revokeToken(token: string) { const config = getOAuthConfig(); if (!config || !token) return; await fetch(TIKTOK_REVOKE_URL, { method: "POST", headers: { authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => undefined); }
export { SESSION_COOKIE };
