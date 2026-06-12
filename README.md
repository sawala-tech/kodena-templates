# kodena-templates

Site templates for Kodena's **Instant Page** feature and the `kodena` CLI.

A monorepo of buildable Next.js templates plus shared workspace packages
(`@kodena-templates/{ui,kontena,seo}`) with **two consumers**:

- the **`kodena` CLI** (`kodena init`, `kodena template list`), which reads
  the repo-root `templates.json` index and scaffolds standalone templates
  locally over public GitHub — no auth, no backend;
- the hosted **`sites-builder`** service, which provisions one-click sites
  against Sawala Cloud (Kontena CMS, Berkasna media, Formulir forms,
  Kodena deploy) for the CMS-backed templates.

This repo is **public** and **not** published to npm — versions are git
tags (`v0.1.0`, `v0.1.1`, …). The Kodena builder reaches the code via
`git clone --depth 1 --branch <tag>`; the CLI fetches `templates.json` from
`raw.githubusercontent.com` and template subtrees from the GitHub tarball
endpoint. Workspace packages use the `@kodena-templates/` scope purely for
name-collision avoidance; every `package.json` carries `"private": true`.

## Templates

| Template      | Build kind | Kind       | Deploys as | Status |
|---------------|------------|------------|------------|--------|
| `starter`     | static     | standalone | Kodena assets (`out/`), content in-repo (`content/site.json`) | v1 |
| `landing`     | static     | CMS-backed | Kodena assets (`out/`), content from a Kontena project | v1 |
| `landing-ssr` | opennext   | CMS-backed | Kodena worker bundle (`.open-next/`), content from a Kontena project | smoke |
| `blog-ssr`    | opennext   | CMS-backed | Kodena worker bundle (`.open-next/`), content from a Kontena project | v1 |

**Standalone** templates build with zero backend provisioning — nothing is
fetched from any Sawala service at build or run time — so the CLI offers
them to `kodena init`. **CMS-backed** templates read from a provisioned
Kontena project at build time (`NEXT_PUBLIC_KONTENA_API_KEY`,
`KONTENA_PROJECT_ID`, …); they declare a non-empty `requires` in
`templates.json`, which makes the CLI hide them until a CLI-side
provisioning path exists. They remain fully available through the hosted
Instant Page builder.

See `TEMPLATES.md` for the `sawala-template.json` manifest spec each
template declares.

## `templates.json` is the CLI's source of truth

The repo-root `templates.json` lists **every** template directory — it must
be edited whenever a template is added or removed. Each entry carries
`slug`, `displayName`, `description`, `path`, `buildKind`
(`static` | `opennext`), optional `default` (exactly one entry), and
optional `requires` (non-empty ⇒ hidden from the CLI). The `kodena` CLI
validates this file strictly; a malformed index breaks `kodena init` and
`kodena template list` for everyone.

Cross-repo rule: the CMS-backed templates' slugs must stay aligned with the
in-code `TEMPLATE_REGISTRY` in
`sawala-cloud-core/services/sites-builder/src/services/templates.ts`. If
they ever disagree, `HEAD` of each repo wins for its own consumer — fix the
drift rather than working around it.

## Adding a template

1. Create `<slug>/` at the repo root with a `sawala-template.json`
   declaring at least `buildKind`, `buildCommand`, and `outputDir`
   (`starter/` is the minimal reference; CMS templates add the seed and
   provisioning fields from `TEMPLATES.md`).
2. Add the directory to the root `package.json` `workspaces` list and run
   `npm install` so the lockfile covers it.
3. Add an entry to `templates.json`. Set `requires`
   (e.g. `["kontena", "formulir"]`) if the template reads from any Sawala
   service at build time; omit it only if `npm install && npm run build`
   succeeds on a machine with no Sawala credentials.
4. Only if the template is also for the hosted builder: register it in
   `sawala-cloud-core`'s `TEMPLATE_REGISTRY` and ship a `seed/` corpus per
   `TEMPLATES.md`.

## Local preview

The standalone `starter` needs no env at all:

    nvm use 22.19.0
    npm ci
    npm run build -w starter && npx serve starter/out -p 8787

The CMS-backed templates need a provisioned Kontena project:

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
