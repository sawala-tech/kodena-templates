# Kodena starter

A standalone Next.js site scaffolded by `kodena init`. Everything it
renders lives in this directory — no CMS, no API keys, no backend
provisioning. It builds to a static export (`out/`) and deploys to
Kodena as plain assets.

## Where things live

- `content/site.json` — the homepage's title, tagline, and section
  cards. Edit this to change the site's content without touching JSX.
- `app/` — the Next.js App Router pages. `app/page.tsx` is the
  homepage, `app/about/page.tsx` is a second route; add directories
  here to add pages.
- `app/globals.css` — all of the styling (plain CSS, no framework).
- `sawala-template.json` — the template manifest `kodena init` used to
  generate your `kodena.json`. You can delete it after scaffolding.

## Develop locally

    npm install
    npm run dev

Then open http://localhost:3000.

## Deploy

    kodena deploy --build

This runs `npm run build` (a Next.js static export into `out/`) and
uploads the result to your Kodena project as static assets. The CLI
prints the live `https://<tenant>.kodena.id` URL when it finishes.
