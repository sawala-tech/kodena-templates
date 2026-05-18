# landing-ssr/scripts

Helper scripts for the landing-ssr smoke deploy.

## `deploy-bundle.mjs`

Packages the `.open-next/` build output into a Kodena `kind: 'worker-bundle'` POST and sends it to `https://api.sawala.cloud/kodena/scripts/landing-ssr-smoke/deploy`.

Prerequisites:

1. Run `npm run build:opennext -w @kodena-templates/landing-ssr` (or `cd landing-ssr && npx @opennextjs/cloudflare build`) so `.open-next/worker.js` and `.open-next/assets/` exist.
2. Create `landing-ssr/.env.smoke.local` (gitignored) with every key the smoke needs — see `.env.example` for the canonical list. `SITE_ORIGIN` should be the tenant URL (e.g. `https://landing-ssr-smoke-<orgHandle>.kodena.id`).
3. Export a fresh Clerk JWT in `KODENA_CLERK_JWT`.

Run:

    KODENA_CLERK_JWT=eyJ... node scripts/deploy-bundle.mjs

Flags:

- `--dry-run` — log the request shape without POSTing.
- `--api-base <url>` — override the Sawala API base (defaults to `https://api.sawala.cloud`).
- `--emit-folder <dir>` — instead of POSTing, write a drop-ready folder containing the bundled `worker.js` at the root and the `assets/` subdirectory copied as-is. The folder layout matches what the kodena-ui "Upload Bundle" tab expects. No Clerk JWT or env file needed for this mode.

On success the script prints the deploy row JSON and the tenant URL. On HTTP failure it prints Kodena's error body and exits non-zero.

## Drop-into-dashboard recipe

Use this when you want to deploy through the Kodena dashboard's drag-and-drop UI instead of the CLI:

    cd /Users/sutisnamulyana/Sawala/kodena-templates/landing-ssr
    nvm use 22.19.0
    set -a; source .env.smoke.local; set +a   # only needed if the template uses build-time public vars
    npx @opennextjs/cloudflare build           # produces .open-next/
    npm run bundle:emit                         # produces .bundle-out/

Then in Firefox/Chrome:

1. Open the Kodena dashboard → Scripts → your script → Deploy → "Upload Bundle".
2. Drag the `.bundle-out/` folder from Finder into the drop zone.
3. The UI lists one worker entry and 17 (or so) assets, with no skipped files.
4. Fill in env vars, check `nodejs_compat`, set compatibility date `2025-04-01`, click Deploy.

Why this two-step flow exists: OpenNext emits a multi-module bundle (`.open-next/worker.js` is a 2 KiB dispatcher that imports `./middleware/`, `./server-functions/`, etc.) that Kodena's single-module endpoint cannot accept as-is. `--emit-folder` runs esbuild to flatten the tree into one self-contained `worker.js`, which is what the dashboard then uploads.
