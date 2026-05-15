# TEMPLATES.md — template manifest spec

Every template in this repo declares a `sawala-template.json` at its
root. The Kodena `sites-builder` reads it to decide what to build and
how to deploy.

## Schema

    interface TemplateManifest {
      // Which Kodena deploy kind the builder should use after build.
      //   "static"   → Kodena kind: 'assets'        (pre-rendered HTML)
      //   "opennext" → Kodena kind: 'worker-bundle' (SSR via OpenNext)
      buildKind: 'static' | 'opennext'

      // Command the builder runs from the template root, e.g. "npm run build".
      buildCommand: string

      // Directory whose contents become the deploy artifact.
      //   static:   "out"        (Next.js static export)
      //   opennext: ".open-next" (worker.js + assets/)
      outputDir: string

      // Locales this template supports; the wizard offers the intersection.
      supportedLocales: Array<'id' | 'en'>

      // Required Kontena schemas this template reads. The orchestrator
      // seed step seeds at least these (extras OK).
      requiredSchemas: string[]

      // Whether this template's /kontak (or /contact) page needs a
      // Formulir form. If true, the orchestrator creates a Contact form
      // and injects its IDs as build-time env.
      needsContactForm: boolean

      // Static templates won't propagate Kontena edits without a rebuild.
      // The builder's queue consumer respects this flag.
      rebuildOnContentChange?: boolean
    }

## Build-time env vars

Templates must consume these via `process.env.*` at build time. The
builder injects them from job config:

| Var                                | Required | Notes                                       |
|------------------------------------|----------|---------------------------------------------|
| `KONTENA_BASE_URL`                 | Yes      | e.g. `https://api.sawala.cloud/public/kontena` |
| `KONTENA_PROJECT_ID`               | Yes      | `proj_…`                                    |
| `NEXT_PUBLIC_KONTENA_API_KEY`      | Yes      | Public read key (X-API-Key)                 |
| `DEFAULT_LOCALE`                   | Yes      | `id` or `en`                                |
| `LOCALES`                          | Yes      | Comma-separated, e.g. `id,en`               |
| `SITE_NAME`                        | Yes      | Editor-facing site name                     |
| `SITE_ORIGIN`                      | Yes      | `https://<scriptSlug>-<orgHandle>.kodena.id`|
| `NEXT_PUBLIC_FORMULIR_API_KEY`        | Iff form | Publishable form key                     |
| `NEXT_PUBLIC_FORMULIR_CONTACT_FORM_SLUG` | Iff form | Form slug (Formulir's `FormulirForm` uses `slug`, not id) |
