import { routing } from '@/i18n/routing'
import { getKontenaClient } from '@/lib/kontena-server'
import type { Locale } from '@/lib/config'
import type { PageEntry, PostEntry } from '@/lib/types'

/**
 * Resolve the equivalent URL of the *current* page in the target locale, then
 * 307 the visitor there. A naive switcher just swaps the locale prefix
 * (`/id/selamat-datang` → `/en/selamat-datang`), which breaks for collection
 * entries because each locale row has its own slug (`selamat-datang` ↔
 * `welcome`). For a `[locale]/[slug]` content path this route looks the source
 * entry up by slug, reads its `documentId`, and finds the target-locale row
 * sharing that `documentId` — the link Kontena uses to pair translations.
 *
 * Query: `?to=<locale>&path=<current pathname>`.
 * Home and static routes (`/kontak`, `/search`) just swap the prefix; a content
 * slug with no translation falls back to the target-locale home.
 *
 * Lives under `/api/*` so the next-intl middleware (which excludes `api`)
 * doesn't try to localize it.
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const to = url.searchParams.get('to') as Locale | null
  const path = url.searchParams.get('path') ?? '/'

  if (!to || !routing.locales.includes(to)) {
    return redirect(new URL(`/${routing.defaultLocale}`, request.url))
  }

  const segments = path.split('/').filter(Boolean)
  const fromLocale = (
    routing.locales.includes(segments[0] as Locale) ? segments[0] : routing.defaultLocale
  ) as Locale
  const rest = routing.locales.includes(segments[0] as Locale) ? segments.slice(1) : segments

  // Default: same sub-path under the target locale prefix.
  const swapped = `/${to}${rest.length ? `/${rest.join('/')}` : ''}`

  // Only a single-segment content slug needs documentId resolution. Home (`[]`)
  // and the static `kontak` / `search` routes use the same segment in both
  // locales, so the prefix swap is already correct.
  const STATIC = new Set(['kontak', 'search'])
  if (rest.length !== 1 || STATIC.has(rest[0])) {
    return redirect(new URL(swapped, request.url))
  }

  const slug = rest[0]
  try {
    const k = getKontenaClient()
    // The catch-all resolves `page` before `post`; mirror that here.
    const fromSchema: 'page' | 'post' = (await k
      .getCollectionEntry<PageEntry>('page', slug, fromLocale)
      .then((e) => (e ? 'page' : null))
      .catch(() => null)) ?? 'post'

    const src =
      fromSchema === 'page'
        ? await k.getCollectionEntry<PageEntry>('page', slug, fromLocale).catch(() => null)
        : await k.getCollectionEntry<PostEntry>('post', slug, fromLocale).catch(() => null)

    const documentId = src?._row.documentId
    if (documentId) {
      const { items } = await k.listCollection<PostEntry | PageEntry>(fromSchema, {
        locale: to,
        limit: 100,
      })
      const targetSlug = items.find((e) => e._row.documentId === documentId)?._row.slug
      if (targetSlug) {
        return redirect(new URL(`/${to}/${targetSlug}`, request.url))
      }
    }
  } catch {
    /* fall through to the target-locale home below */
  }

  // No paired translation — send to the target-locale home rather than a
  // guaranteed 404 at the source slug under the new prefix.
  return redirect(new URL(`/${to}`, request.url))
}

function redirect(target: URL): Response {
  return new Response(null, { status: 307, headers: { Location: target.toString() } })
}
