import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // `next build` and `next dev` share `.next`, so a verification build run
  // while the dev server is up rewrites the manifests underneath it and every
  // request after that fails with ENOENT until it is restarted. Setting
  // NEXT_DIST_DIR sends a build somewhere else; unset, nothing changes.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default withNextIntl(nextConfig);
