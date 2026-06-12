/**
 * Static export: `next build` writes plain HTML/CSS/JS to `out/`, which
 * Kodena deploys as kind:'assets' (no server runtime, no worker code).
 * The image optimizer needs a server, so it is disabled for export.
 */
const nextConfig = {
  output: 'export',
  // Directory-style URLs (`/about/` → `out/about/index.html`) so Kodena's
  // auto-trailing-slash asset serving hits files directly, no redirects.
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
