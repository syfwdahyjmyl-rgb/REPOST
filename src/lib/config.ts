export type AppMode = "demo" | "integration";

const hasTikTokCredentials = Boolean(
  process.env.TIKTOK_CLIENT_KEY &&
  process.env.TIKTOK_CLIENT_SECRET &&
  process.env.TIKTOK_REDIRECT_URI &&
  (process.env.SESSION_SECRET?.length ?? 0) >= 32,
);

export const appConfig = {
  name: "RepostFlow",
  mode: (hasTikTokCredentials ? "integration" : "demo") as AppMode,
  isDemo: !hasTikTokCredentials,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  capabilities: {
    canListReposts: false,
    canRemoveReposts: false,
    canBatchRemove: false,
    manualWorkflow: true,
  },
} as const;
