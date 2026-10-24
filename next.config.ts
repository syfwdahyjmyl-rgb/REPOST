import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // `npm run typecheck` remains the authoritative strict check. Keeping the
  // production build independent of Next's worker type-checker makes builds
  // reliable in constrained local/CI containers.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
