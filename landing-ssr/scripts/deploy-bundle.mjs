#!/usr/bin/env node
// Deploy the .open-next build to Kodena's worker-bundle endpoint.
//
// Usage:
//   KODENA_CLERK_JWT=eyJ... node scripts/deploy-bundle.mjs [--dry-run] [--api-base URL]
//
// Reads env vars from .env.smoke.local in this template's root (gitignored).
// See PLAN-kodena-landing-ssr.md for the full contract.

import { readFileSync, statSync, mkdirSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, relative, resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_ROOT = resolve(__dirname, '..')
const OPEN_NEXT_DIR = join(TEMPLATE_ROOT, '.open-next')
const WORKER_PATH = join(OPEN_NEXT_DIR, 'worker.js')
const BUNDLE_OUT_DIR = join(OPEN_NEXT_DIR, '.bundle')
const BUNDLE_OUT_PATH = join(BUNDLE_OUT_DIR, 'worker.bundled.js')
const ASSETS_DIR = join(OPEN_NEXT_DIR, 'assets')
const ENV_FILE = join(TEMPLATE_ROOT, '.env.smoke.local')

const WORKER_MODULE_MAX_BYTES = 10 * 1024 * 1024 // 10 MiB, mirrors Kodena cap.
const ASSETS_AGGREGATE_MAX_BYTES = 100 * 1024 * 1024 // 100 MiB, mirrors Kodena cap.

const VAR_KEYS = [
  'KONTENA_BASE_URL',
  'KONTENA_PROJECT_ID',
  'NEXT_PUBLIC_KONTENA_API_KEY',
  'DEFAULT_LOCALE',
  'LOCALES',
  'SITE_NAME',
  'SITE_ORIGIN',
  'NEXT_PUBLIC_FORMULIR_API_KEY',
  'NEXT_PUBLIC_FORMULIR_CONTACT_FORM_SLUG',
]

const MIME_BY_EXT = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
}

function mimeFor(ext) {
  return MIME_BY_EXT[ext.toLowerCase()] ?? 'application/octet-stream'
}

function die(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

function parseEnvFile(filePath) {
  // Returns {} if the file does not exist — callers fall back to process.env.
  // Real M4 deploys must populate the file; for the M3 dry-run, exporting the
  // vars directly in the shell is sufficient.
  let raw
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch {
    return {}
  }
  const out = {}
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    // Strip optional matching quotes.
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

async function walkAssets(base) {
  const out = []
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs)
      } else if (entry.isFile()) {
        const size = statSync(abs).size
        const rel = '/' + relative(base, abs).split(/\\/g).join('/')
        out.push({ abs, path: rel, size })
      }
    }
  }
  await walk(base)
  return out
}

function readAssetAsEntry({ abs, path: relPath, size }) {
  const content = readFileSync(abs).toString('base64')
  const mime = mimeFor(extname(relPath))
  return { path: relPath, content, mime, size }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`
  return `${(n / 1024 / 1024).toFixed(2)} MiB`
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const apiBaseIdx = args.indexOf('--api-base')
  const apiBase = apiBaseIdx >= 0 ? args[apiBaseIdx + 1] : 'https://api.sawala.cloud'

  // 1. Locate build output.
  try {
    statSync(WORKER_PATH)
    statSync(ASSETS_DIR)
  } catch {
    die(`missing build output — run \`npm run build:opennext -w @kodena-templates/landing-ssr\` first (expected ${WORKER_PATH})`)
  }

  // 2. Bundle worker.js → single self-contained ES module via esbuild.
  // OpenNext emits a multi-module tree (worker.js imports ./cloudflare/, ./middleware/,
  // ./server-functions/, ./.build/durable-objects/). Wrangler bundles these for normal
  // deploys; Kodena's worker-bundle endpoint only accepts a single ES module, so we do
  // the equivalent bundling here. `cloudflare:*` and `node:*` are externals (provided by
  // the Workers runtime when compatibility_flags include `nodejs_compat`).
  mkdirSync(BUNDLE_OUT_DIR, { recursive: true })
  const buildResult = await esbuild.build({
    entryPoints: [WORKER_PATH],
    outfile: BUNDLE_OUT_PATH,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
    mainFields: ['module', 'main'],
    conditions: ['workerd', 'worker', 'browser', 'import', 'default'],
    // With compatibility_flags: ['nodejs_compat'], the Workers runtime provides
    // both unprefixed ('fs') and node: ('node:fs') forms of Node built-ins. Mark
    // every built-in as external so esbuild doesn't try to inline a Node
    // implementation. The list is the Node 22 built-in module set.
    external: [
      'cloudflare:*',
      'node:*',
      'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
      'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
      'events', 'fs', 'http', 'http2', 'https', 'inspector', 'module', 'net',
      'os', 'path', 'perf_hooks', 'process', 'punycode', 'querystring',
      'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls',
      'trace_events', 'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads',
      'zlib',
    ],
    minify: true,
    logLevel: 'silent',
    loader: { '.wasm': 'binary' },
  })
  if (buildResult.errors.length) {
    console.error(buildResult.errors)
    die('esbuild reported errors bundling worker.js')
  }
  const workerBytes = readFileSync(BUNDLE_OUT_PATH)
  if (workerBytes.byteLength > WORKER_MODULE_MAX_BYTES) {
    die(`bundled worker is ${workerBytes.byteLength} B; Kodena cap is ${WORKER_MODULE_MAX_BYTES} B`)
  }
  const scriptContent = workerBytes.toString('base64')

  // 3. Walk and encode every asset.
  const fileList = await walkAssets(ASSETS_DIR)
  let assetsTotal = 0
  const assets = []
  for (const f of fileList) {
    assetsTotal += f.size
    if (assetsTotal > ASSETS_AGGREGATE_MAX_BYTES) {
      die(`assets aggregate exceeds ${ASSETS_AGGREGATE_MAX_BYTES} B (so far ${assetsTotal})`)
    }
    assets.push(readAssetAsEntry(f))
  }

  // 4. Vars. .env.smoke.local takes precedence; fall back to process.env.
  const env = parseEnvFile(ENV_FILE)
  const vars = {}
  for (const key of VAR_KEYS) {
    const val = env[key] ?? process.env[key]
    if (val == null || val === '') {
      die(`missing ${key} (set in ${ENV_FILE} or export in shell)`)
    }
    vars[key] = val
  }

  // 5. Clerk JWT.
  const jwt = process.env.KODENA_CLERK_JWT
  if (!dryRun && !jwt) {
    die('KODENA_CLERK_JWT env var is required (export a fresh JWT from the dashboard)')
  }

  const scriptSlug = 'landing-ssr-smoke'
  const url = `${apiBase}/kodena/scripts/${scriptSlug}/deploy`
  const body = {
    kind: 'worker-bundle',
    scriptContent,
    assets,
    vars,
    compatibilityFlags: ['nodejs_compat'],
    compatibilityDate: '2025-04-01',
  }

  // Dry-run summary or POST.
  console.log(`Worker module: bundled ${formatBytes(workerBytes.byteLength)} → base64 ${formatBytes(scriptContent.length)}`)
  console.log(`Assets:        ${assets.length} files, ${formatBytes(assetsTotal)} raw`)
  console.log(`Vars:          ${Object.keys(vars).sort().join(', ')}`)
  console.log(`Target:        POST ${url}`)
  console.log(`compatFlags:   ${body.compatibilityFlags.join(', ')}  compatDate: ${body.compatibilityDate}`)

  if (dryRun) {
    console.log('\n(dry-run: not sending)')
    return
  }

  console.log('\nPosting...')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText}`)
    console.error(text)
    process.exit(2)
  }
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    console.error('non-JSON response:')
    console.error(text)
    process.exit(3)
  }
  console.log(`HTTP ${res.status}`)
  console.log(JSON.stringify(parsed, null, 2))
  const tenantUrl = parsed.url ?? parsed.tenantUrl ?? `https://${scriptSlug}-<orgHandle>.kodena.id`
  console.log(`\nDeployed: ${tenantUrl}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(99)
})
