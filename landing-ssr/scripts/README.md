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

On success the script prints the deploy row JSON and the tenant URL. On HTTP failure it prints Kodena's error body and exits non-zero.
