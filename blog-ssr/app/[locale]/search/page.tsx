import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import { PostCard } from '@/components/PostCard'
import { formatDate } from '@/lib/format'
import type { Locale } from '@/lib/config'
import type { PageEntry, PostEntry } from '@/lib/types'

// Search results are request-specific and never cached.
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params
  const q = ((await searchParams).q ?? '').trim()
  const t = await getTranslations({ locale, namespace: 'Search' })
  return {
    title: q ? `${q} — ${t('title')}` : t('title'),
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: raw } = await params
  const q = ((await searchParams).q ?? '').trim()
  const locale = raw as Locale
  setRequestLocale(locale)

  const config = loadConfig()
  const t = await getTranslations('Search')
  const empty = { items: [], pagination: { limit: 10, hasMore: false } as const }

  let posts: Array<import('@sawala/kontena-client').KontenaEntry<PostEntry>> = []
  let pages: Array<import('@sawala/kontena-client').KontenaEntry<PageEntry>> = []
  if (q) {
    const k = getKontenaClient()
    const [p, pg] = await Promise.all([
      k.listCollection<PostEntry>('post', { locale, limit: 12, q }).catch(() => empty),
      k.listCollection<PageEntry>('page', { locale, limit: 12, q }).catch(() => empty),
    ])
    posts = p.items
    pages = pg.items
  }

  const total = posts.length + pages.length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        {q ? t('heading', { q }) : t('emptyHeading')}
      </h1>

      <form action={`/${locale}/search`} className="mb-10 mt-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="w-full max-w-md rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
        />
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          {t('button')}
        </button>
      </form>

      {q && total === 0 ? <p className="text-zinc-500">{t('noResults')}</p> : null}

      {posts.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('sectionPosts')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const slug = post._row.slug ?? ''
              const date = formatDate(post.publishedAt ?? post._row.publishedAt, locale)
              return (
                <PostCard
                  key={post._row.id ?? slug}
                  href={`/${locale}/${slug}`}
                  title={post.title ?? slug}
                  excerpt={post.excerpt}
                  coverUrl={post.cover?.url}
                  coverAlt={post.cover?.alt ?? post.title ?? ''}
                  meta={post.author && date ? `${post.author} · ${date}` : post.author || date || undefined}
                  readMoreLabel={t('readMore')}
                />
              )
            })}
          </div>
        </section>
      ) : null}

      {pages.length > 0 ? (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('sectionPages')}</h2>
          <ul className="space-y-3">
            {pages.map((pg) => {
              const slug = pg._row.slug ?? ''
              return (
                <li key={pg._row.id ?? slug}>
                  <a href={`/${locale}/${slug}`} className="text-base font-medium text-zinc-900 hover:underline">
                    {pg.title ?? slug}
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <p className="sr-only">{config.siteName}</p>
    </div>
  )
}
