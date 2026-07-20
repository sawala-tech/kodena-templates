import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import path from 'node:path'

const nextConfig: NextConfig = {
  // Pin turbopack root to the monorepo root (parent of this template), so Next
  // stops walking up to find an unrelated parent lockfile.
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
}

// Only initialise the OpenNext dev-bindings shim under `next dev`. Calling the
// helper during a production build fails with `ENOENT @cloudflare/workerd-*`
// because the optional workerd platform binary may not be installed there.
if (process.env.NODE_ENV !== 'production') {
  initOpenNextCloudflareForDev()
}

export default nextConfig
