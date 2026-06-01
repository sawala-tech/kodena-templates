import type { Locale } from './config'

/** Format an ISO date string for display in the given locale. Returns '' on bad input. */
export function formatDate(iso: string | undefined, locale: Locale): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Resolve a menu/content `href` for rendering, per the Blog content model:
 * external/anchor/protocol hrefs pass through untouched; internal absolute
 * paths (starting with `/`) get the current locale prefix prepended so a
 * stored `/tentang-kami` becomes `/id/tentang-kami`.
 */
export function resolveHref(href: string | undefined, locale: Locale): string {
  const h = (href ?? '').trim()
  if (!h) return `/${locale}`
  if (/^(https?:|mailto:|tel:|#)/i.test(h)) return h
  if (h.startsWith('/')) return `/${locale}${h === '/' ? '' : h}`
  // Bare slug without a leading slash — treat as an internal path too.
  return `/${locale}/${h}`
}

/** True for hrefs that should open in a new tab (absolute external URLs). */
export function isExternal(href: string | undefined): boolean {
  return /^https?:/i.test((href ?? '').trim())
}
