import { defineRouting } from 'next-intl/routing'
import { loadConfig } from '@/lib/config'

const config = loadConfig()

export const routing = defineRouting({
  locales: config.locales,
  defaultLocale: config.defaultLocale,
  // `always`: every locale URL is prefixed (/id, /en). `as-needed` would
  // require middleware to rewrite `/` → `/<defaultLocale>`, but static
  // export has no middleware runtime — Next can only pre-render the
  // routes that exist, so the unprefixed default would never get an HTML
  // file. Root `/` is handled by a meta-refresh in `public/index.html`.
  localePrefix: 'always',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
