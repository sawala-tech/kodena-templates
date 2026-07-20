#!/usr/bin/env node
// Run OpenNext build with kodena.json's `vars` exported as env so Next can
// pick them up at build time. Kodena CLI's runBuild() spawns the build with
// the caller's env unchanged — kodena.json `vars` only become Cloudflare
// bindings at runtime, not env at build time. Templates that read env vars
// inside `lib/config.ts` (loadConfig() etc.) need them present in
// `process.env` while `next build` runs; this script bridges the gap.
//
// Use in kodena.json:
//   "build": { "command": "node scripts/build.mjs && node scripts/bundle-worker.mjs" }

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const KODENA_JSON = join(PROJECT_ROOT, 'kodena.json')

let config
try {
  config = JSON.parse(readFileSync(KODENA_JSON, 'utf8'))
} catch (err) {
  console.error(`build: cannot read ${KODENA_JSON}: ${err.message}`)
  process.exit(1)
}

// kodena.json `vars` are defaults — real values come from process.env (so
// `.env.local` / `.env.smoke.local` / shell-exported vars override the
// placeholders committed in kodena.json). Mirrors deploy-bundle.mjs's
// precedence (env file > process.env > kodena.json). Defaults only fill in
// keys that are otherwise unset.
const declared = config.vars ?? {}
const resolved = {}
for (const [k, v] of Object.entries(declared)) {
  resolved[k] = process.env[k] ?? v
}
const buildEnv = { ...process.env, ...resolved, NODE_ENV: 'production' }
const declaredVarKeys = Object.keys(declared).sort().join(', ')
const overridden = Object.keys(declared).filter((k) => process.env[k] !== undefined)
console.log(`build: resolving ${Object.keys(declared).length} kodena.json vars for build (${declaredVarKeys})`)
if (overridden.length > 0) {
  console.log(`build: process.env overrides for: ${overridden.sort().join(', ')}`)
}

const result = spawnSync('npx', ['@opennextjs/cloudflare', 'build'], {
  cwd: PROJECT_ROOT,
  env: buildEnv,
  stdio: 'inherit',
})

if (result.status !== 0) {
  console.error(`build: OpenNext exited with code ${result.status}`)
  process.exit(result.status ?? 1)
}
