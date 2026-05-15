import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'node:path'

const nextConfig: NextConfig = {
  // Pin turbopack root to the monorepo root (parent of this template),
  // so workspace packages resolve and Next stops walking up to find an
  // unrelated parent lockfile.
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // Static export: the Kodena builder uploads `out/` via kind: 'assets'.
  output: 'export',
  // R2-served images skip Next's image optimiser (no server runtime).
  images: { unoptimized: true },
  // Workspace packages export .ts/.tsx directly from their `src/`. Next
  // needs to transpile these like local source files rather than expect
  // pre-built JS.
  transpilePackages: [
    '@kodena-templates/ui',
    '@kodena-templates/seo',
    '@kodena-templates/kontena',
  ],
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl(nextConfig)
