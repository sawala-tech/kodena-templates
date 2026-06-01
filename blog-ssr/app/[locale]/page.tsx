import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { buildMetadata } from '@kodena-templates/seo'
import { JsonLd } from '@kodena-templates/ui'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import { PostCard } from '@/components/PostCard'
import { Pagination } from '@/components/Pagination'
import { formatDate } from '@/lib/format'
import type { Locale } from '@/lib/config'
import type { PostEntry, SiteSettingsEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ cursor?: string; stack?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = raw as Locale
  const config = loadConfig()
  const settings = await getKontenaClient()
    .getSingle<SiteSettingsEntry>('site-settings', locale)
    .catch(() => null)
  const alternates: Partial<Record<Locale, string>> = {}
  for (const l of config.locales) alternates[l] = `/${l}`
  return buildMetadata({
    path: `/${locale}`,
    siteOrigin: config.siteOrigin,
    siteName: settings?.siteName ?? config.siteName,
    title: settings?.siteName ?? config.siteName,
    description: settings?.tagline,
    locale,
    alternates,
    ogImage: settings?.defaultOgImage?.url
      ? {
          url: settings.defaultOgImage.url,
          width: settings.defaultOgImage.width,
          height: settings.defaultOgImage.height,
          alt: settings.defaultOgImage.alt ?? undefined,
        }
      : undefined,
  })
}

export default async function HomePage({ params, searchParams }: Props) {
  const { locale: raw } = await params
  const { cursor, stack } = await searchParams
  const locale = raw as Locale
  setRequestLocale(locale)

  const config = loadConfig()
  const t = await getTranslations('Blog')
  const k = getKontenaClient()
  const settings = await k.getSingle<SiteSettingsEntry>('site-settings', locale).catch(() => null)
  const { items, pagination } = await k
    .listCollection<PostEntry>('post', { locale, limit: config.postsPerPage, cursor })
    .catch(() => ({ items: [], pagination: { limit: config.postsPerPage, hasMore: false, nextCursor: null } }))

  const siteName = settings?.siteName ?? config.siteName

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd
        data={{
          '@type': 'Blog',
          name: siteName,
          url: `${config.siteOrigin}/${locale}`,
          description: settings?.tagline,
        }}
      />
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
        {settings?.tagline ?? siteName}
      </h1>
      <p className="mb-8 text-sm text-zinc-500">{t('latest')}</p>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          {t('empty')}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => {
            const slug = post._row.slug ?? ''
            const date = formatDate(post.publishedAt ?? post._row.publishedAt, locale)
            const meta = post.author && date ? `${post.author} · ${date}` : post.author || date || undefined
            return (
              <PostCard
                key={post._row.id ?? slug}
                href={`/${locale}/${slug}`}
                title={post.title ?? slug}
                excerpt={post.excerpt}
                coverUrl={post.cover?.url}
                coverAlt={post.cover?.alt ?? post.title ?? ''}
                meta={meta}
                readMoreLabel={t('readMore')}
              />
            )
          })}
        </div>
      )}

      <Pagination
        basePath={`/${locale}`}
        currentCursor={cursor}
        stack={stack}
        hasMore={pagination.hasMore}
        nextCursor={pagination.nextCursor}
        prevLabel={t('previous')}
        nextLabel={t('next')}
      />
    </div>
  )
}
