#!/usr/bin/env node
// Bundle .open-next/worker.js into a single self-contained ES module
// suitable for Kodena's worker-bundle endpoint, then overwrite
// .open-next/worker.js with the result.
//
// Approach: shell out to `wrangler deploy --dry-run --outdir=...`, which
// runs the same bundler wrangler uses for real deploys. Wrangler's
// bundle is reliably runnable on workerd; an earlier attempt to do this
// step with a hand-written esbuild config (minified, esm, neutral
// platform) produced a worker that 1101'd at runtime on Cloudflare even
// though it ran locally. Letting wrangler own the bundling step
// eliminates that drift.
//
// This script is a direct port of blank-ssr's equivalent — see
// /Users/sutisnamulyana/Sawala/kodena-coba-deploy/blank-ssr/scripts/bundle-worker.mjs
// and PLAN-kodena-blank-ssr.md for the discovery sequence.

import { copyFileSync, existsSync, rmSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const WORKER_PATH = join(PROJECT_ROOT, '.open-next', 'worker.js')
const DUMP_DIR = join(PROJECT_ROOT, '.wrangler-dump')
const DUMP_WORKER = join(DUMP_DIR, 'worker.js')

const WORKER_MODULE_MAX_BYTES = 10 * 1024 * 1024

if (!existsSync(WORKER_PATH)) {
  console.error(`bundle-worker: ${WORKER_PATH} missing — run \`npx @opennextjs/cloudflare build\` first.`)
  process.exit(1)
}

rmSync(DUMP_DIR, { recursive: true, force: true })

const result = spawnSync(
  'npx',
  ['wrangler', 'deploy', '--dry-run', `--outdir=${DUMP_DIR}`, WORKER_PATH],
  { cwd: PROJECT_ROOT, stdio: ['inherit', 'pipe', 'pipe'] },
)

if (result.status !== 0) {
  process.stdout.write(result.stdout?.toString() ?? '')
  process.stderr.write(result.stderr?.toString() ?? '')
  console.error(`bundle-worker: wrangler dry-run failed with exit code ${result.status}`)
  process.exit(1)
}

if (!existsSync(DUMP_WORKER)) {
  console.error(`bundle-worker: wrangler did not write ${DUMP_WORKER}`)
  process.exit(1)
}

const bundledSize = statSync(DUMP_WORKER).size
if (bundledSize > WORKER_MODULE_MAX_BYTES) {
  console.error(`bundle-worker: bundled worker is ${bundledSize} B; Kodena cap is ${WORKER_MODULE_MAX_BYTES} B.`)
  process.exit(1)
}

copyFileSync(DUMP_WORKER, WORKER_PATH)

const mib = (bundledSize / 1024 / 1024).toFixed(2)
console.log(`bundle-worker: wrote ${mib} MiB → ${WORKER_PATH} (via wrangler bundler)`)
