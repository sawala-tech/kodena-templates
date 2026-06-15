# Kodena starter

A standalone Next.js site scaffolded by `kodena init`. Everything it
renders lives in this directory — no CMS, no API keys, no backend
provisioning. It builds to a static export (`out/`) and deploys to
Kodena as plain assets.

## Where things live

- `content/site.json` — the editable, non-decorative text. Fields:
  `title` (page `<title>`), `tagline` (the big hero line),
  `heroSubtitle` (the gray sub-line under it), `installCmd` (the command
  shown in the hero install chip and copied by its **COPY** button),
  `browseHref` (where the "Browse templates" button links), and
  `footerLinks` (a list of `{ label, href }` for the footer nav). Edit
  this to change the site's wording without touching JSX.
- `public/` — brand images served at the site root: `logo-mark-black.svg`
  (hero + header wordmark) and `logo-mark-white.svg` (dark-footer
  wordmark). They are tiny pixel-exact SVGs, so they stay crisp at any
  size and cost a few KB each.
- `app/icon.svg` + `app/apple-icon.png` — the favicon and Apple
  touch icon (Next's App Router emits the `<link>` tags automatically).
- `app/` — the Next.js App Router pages. `app/page.tsx` is the homepage
  (hero + a decorative `npx create-kodena` terminal), `app/about/page.tsx`
  is a second route, and `app/CopyButton.tsx` is the small client
  component behind the install chip's copy button; add directories here
  to add pages.
- `app/globals.css` — all of the styling (plain CSS, no framework): the
  Kodena pixel theme — white page with a graph-paper grid, near-black
  ink, the `#19e58a` accent, sharp black borders and hard offset shadows.
- `sawala-template.json` — the template manifest `kodena init` used to
  generate your `kodena.json`. You can delete it after scaffolding.

The hero wordmark, the green/black palette, the decorative terminal
transcript, and the floating pixel squares are **intentionally hardcoded
Kodena branding** — they are not driven by `site.json`. The two brand
fonts (Space Grotesk for body and headings, JetBrains Mono for
code/labels) load via `next/font/google`, which downloads them once at
build time and self-hosts them into the static export, so the deployed
site makes no runtime calls to Google.

## Develop locally

    npm install
    npm run dev

Then open http://localhost:3000.

## Deploy

    kodena deploy --build

This runs `npm run build` (a Next.js static export into `out/`) and
uploads the result to your Kodena project as static assets. The CLI
prints the live `https://<tenant>.kodena.id` URL when it finishes.
