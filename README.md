# kodena-templates

Site templates for Kodena's **Instant Page** feature.

A monorepo of buildable Next.js templates plus shared workspace packages
(`@kodena-templates/{ui,kontena,seo}`) that the Kodena `sites-builder`
service consumes to provision one-click sites against Sawala Cloud
(Kontena CMS, Berkasna media, Formulir forms, Kodena deploy).

This repo is **public** and **not** published to npm — versions are git
tags (`v0.1.0`, `v0.1.1`, …). The Kodena builder reaches the code via
`git clone --depth 1 --branch <tag>`. Workspace packages use the
`@kodena-templates/` scope purely for name-collision avoidance; every
`package.json` carries `"private": true`.

## Templates

| Template  | Build kind | Status   |
|-----------|------------|----------|
| `landing` | static     | v1       |

See `TEMPLATES.md` for the manifest spec each template declares.

## Local preview

    nvm use 22.19.0
    npm ci
    KONTENA_BASE_URL=https://api.sawala.cloud/public/kontena \
    KONTENA_PROJECT_ID=proj_… \
    NEXT_PUBLIC_KONTENA_API_KEY=pk_live_… \
    DEFAULT_LOCALE=id \
    LOCALES=id,en \
    SITE_NAME='My Landing' \
    SITE_ORIGIN=http://localhost:8787 \
    NEXT_PUBLIC_FORMULIR_API_KEY=pk_test_… \
    NEXT_PUBLIC_FORMULIR_CONTACT_FORM_ID=form_… \
    npm run build -w landing && npx serve landing/out -p 8787
