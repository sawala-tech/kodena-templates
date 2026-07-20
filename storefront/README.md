# Storefront — Kiosna Display reference shop

A fork-able Next.js shop that consumes the **Kiosna Display + Kiosna Pay** public
API: browse published products, hold a cart, quote real Indonesian courier
shipping, and check out through a hosted Xendit payment page. It's server-rendered
and deploys on **Kodena** (Sawala's Cloudflare-Workers hosting).

It's also the **living acceptance harness** for the public API — clicking through
it exercises browse → cart → shipping → checkout → thank-you end to end.

## Configure

Everything is env-driven; no code changes to re-point at another shop. Copy
`.env.example` → `.env.local` and fill in:

| Var | Required | What |
|-----|----------|------|
| `API_BASE_URL` | ✓ | Gateway base, e.g. `https://api.sawala.cloud` |
| `NEXT_PUBLIC_STOREFRONT_SLUG` | ✓ | Your storefront's slug |
| `KIOSNA_PUBLISHABLE_KEY` | ✓ | A **publishable** `pk_…` key. **Never** a secret `sk_` key. |
| `NEXT_PUBLIC_SITE_NAME` | | Shop name in the header |
| `NEXT_PUBLIC_CURRENCY` | | Default `IDR` |
| `API_USE_HOST_PLANE` | | `true` to use the consumer-host plane (shop on its own hostname; no key) |

> **Security:** this app only ever holds a *publishable* key, which the gateway
> resolves to your org and grants read access to your *published* data only. It
> never handles payment details — checkout redirects to Xendit's hosted page.

## Run locally

```bash
nvm use 22.19.0
npm install          # from the kodena-templates repo root
npm run dev -w storefront   # http://localhost:3000
```

Unconfigured, the home page shows a "not configured" placeholder. Set the three
required vars (and publish at least one product to your storefront from the Kiosna
dashboard) and the product grid appears.

## Rebrand

- **Name:** `NEXT_PUBLIC_SITE_NAME`.
- **Colours/spacing:** Tailwind v4 tokens in `app/globals.css` (`@theme`) and the
  utility classes in `components/*` and `app/*`.
- **Copy:** edit the page components under `app/`.

## Deploy to Kodena

The build recipe (in `kodena.json` + `scripts/`) is the proven OpenNext-on-Kodena
setup — compatibility date `2025-10-08`, `nodejs_compat`, and the wrangler-bundler
re-bundle. Don't hand-roll it.

```bash
nvm use 22.19.0
cd storefront
node scripts/build.mjs && node scripts/bundle-worker.mjs   # → .open-next/worker.js (< 10 MiB)
```

Then either:
- **API/CLI:** `KODENA_CLERK_JWT=… node scripts/deploy-bundle.mjs` (set the target
  script slug in `kodena.json`), or
- **Dashboard:** `npm run bundle:emit` → in the Kodena dashboard, Scripts → your
  script → Deploy → Upload Bundle → drag `.bundle-out/`, set the env vars above,
  check `nodejs_compat`, set compatibility date `2025-10-08`, Deploy.

Set the runtime vars (`API_BASE_URL`, `NEXT_PUBLIC_STOREFRONT_SLUG`,
`KIOSNA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_CURRENCY`) as Kodena
script vars.

## Notes

- Guest checkout only — member (Akuna/Clerk) login is intentionally out of scope
  for this reference build.
- `lib/storefront-api.ts` is the whole data layer (one typed function per public
  endpoint); it's the intended seed for a published `@sawala/kiosna` SDK and for a
  platform-generated storefront.
