import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'node:path'

const nextConfig: NextConfig = {
  // Pin turbopack root to the monorepo root (parent of this template), so
  // workspace packages resolve and Next stops walking up to find an unrelated
  // parent lockfile.
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // Workspace packages export .ts/.tsx directly from their `src/`. Next needs
  // to transpile these like local source files rather than expect pre-built JS.
  transpilePackages: [
    '@kodena-templates/ui',
    '@kodena-templates/seo',
  ],
}

// Only initialise the OpenNext dev-bindings shim under `next dev`. The
// helper spawns the workerd binary to mount local Cloudflare bindings,
// which is only useful for development. Calling it during `next build`
// (NODE_ENV=production) inside the sites-builder container — or any CI
// box that doesn't ship the workerd platform binary — fails with
// `ENOENT @cloudflare/workerd-<platform>/bin/workerd` because npm's
// optional-dep selection isn't always aligned with the runtime platform.
// Gating on NODE_ENV sidesteps that entirely; production builds never
// need the dev-time workerd shim.
if (process.env.NODE_ENV !== 'production') {
  initOpenNextCloudflareForDev()
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl(nextConfig)
