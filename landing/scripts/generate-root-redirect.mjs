// Generates `public/index.html` as a meta-refresh to `/<DEFAULT_LOCALE>/`.
// Run as part of `prebuild`. Reads DEFAULT_LOCALE from the build env.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultLocale = process.env.DEFAULT_LOCALE ?? 'id'
const out = resolve(__dirname, '..', 'public', 'index.html')

const html = `<!doctype html>
<html lang="${defaultLocale}">
  <head>
    <meta charset="utf-8">
    <title>Redirecting…</title>
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=/${defaultLocale}/">
    <link rel="canonical" href="/${defaultLocale}/">
  </head>
  <body>
    <p>Redirecting to <a href="/${defaultLocale}/">/${defaultLocale}/</a>…</p>
  </body>
</html>
`

await mkdir(dirname(out), { recursive: true })
await writeFile(out, html, 'utf8')
console.log(`Wrote ${out} → /${defaultLocale}/`)
