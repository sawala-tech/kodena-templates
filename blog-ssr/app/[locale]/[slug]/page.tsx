import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { buildMetadata } from '@kodena-templates/seo'
import { JsonLd } from '@kodena-templates/ui'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import { RichText } from '@/components/RichText'
import { AdjacentNav } from '@/components/AdjacentNav'
import { formatDate } from '@/lib/format'
import type { Locale } from '@/lib/config'
import type { PageEntry, PostEntry, SeoFields, SiteSettingsEntry } from '@/lib/types'
import type { KontenaEntry } from '@sawala/kontena-client'

export const dynamic = 'force-dynamic'

type Params = { locale: string; slug: string }
type Props = { params: Promise<Params> }

function seoToMetadata(
  entry: (SeoFields & { title?: string }) | null,
  opts: { locale: Locale; path: string; siteName: string; siteOrigin: string; ogType: 'website' | 'article' },
): Metadata {
  return buildMetadata({
    path: opts.path,
    siteOrigin: opts.siteOrigin,
    siteName: opts.siteName,
    title: entry?.seoMetaTitle ?? entry?.title,
    description: entry?.seoMetaDescription,
    locale: opts.locale,
    ogType: opts.ogType,
    ogImage: entry?.seoOgImage?.url
      ? {
          url: entry.seoOgImage.url,
          width: entry.seoOgImage.width,
          height: entry.seoOgImage.height,
          alt: entry.seoOgImage.alt ?? undefined,
        }
      : undefined,
    noindex: entry?.seoNoindex,
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = raw as Locale
  const config = loadConfig()
  const k = getKontenaClient()
  const [settings, page, post] = await Promise.all([
    k.getSingle<SiteSettingsEntry>('site-settings', locale).catch(() => null),
    k.getCollectionEntry<PageEntry>('page', slug, locale).catch(() => null),
    k.getCollectionEntry<PostEntry>('post', slug, locale).catch(() => null),
  ])
  const siteName = settings?.siteName ?? config.siteName
  const entry = page ?? post
  return seoToMetadata(entry, {
    locale,
    path: `/${locale}/${slug}`,
    siteName,
    siteOrigin: config.siteOrigin,
    ogType: page ? 'website' : 'article',
  })
}

export default async function SlugPage({ params }: Props) {
  const { locale: raw, slug } = await params
  const locale = raw as Locale
  setRequestLocale(locale)

  const config = loadConfig()
  const k = getKontenaClient()

  // `page` collection first (editor-managed static pages), then `post`.
  const page = await k.getCollectionEntry<PageEntry>('page', slug, locale).catch(() => null)
  if (page) return <PageView entry={page} />

  const post = await k.getCollectionEntry<PostEntry>('post', slug, locale).catch(() => null)
  if (!post) notFound()

  // Pull recent posts to compute chronological neighbours for prev/next nav.
  const list = await k
    .listCollection<PostEntry>('post', { locale, limit: 100 })
    .catch(() => ({ items: [] as Array<KontenaEntry<PostEntry>>, pagination: { limit: 100, hasMore: false } }))
  const sorted = [...list.items].sort((a, b) => time(b) - time(a))
  const idx = sorted.findIndex((e) => e._row.slug === slug)
  const newer = idx > 0 ? sorted[idx - 1] : null
  const older = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null
  const t = await getTranslations('Blog')

  return (
    <PostView
      entry={post}
      locale={locale}
      siteOrigin={config.siteOrigin}
      adjacent={{
        prev: older
          ? { href: `/${locale}/${older._row.slug ?? ''}`, title: older.title ?? '—' }
          : null,
        next: newer
          ? { href: `/${locale}/${newer._row.slug ?? ''}`, title: newer.title ?? '—' }
          : null,
        prevLabel: t('prevPost'),
        nextLabel: t('nextPost'),
        ariaLabel: t('adjacentAria'),
      }}
    />
  )
}

function time(e: KontenaEntry<PostEntry>): number {
  return new Date(e.publishedAt ?? e._row.publishedAt ?? e._row.createdAt ?? 0).getTime()
}

function PageView({ entry }: { entry: PageEntry }) {
  const cover = entry.cover?.url
  return (
    <article className="pb-16">
      {cover ? (
        <section className="relative h-56 w-full overflow-hidden sm:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={entry.cover?.alt ?? ''} className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative z-10 flex h-full items-center justify-center px-4">
            <h1 className="text-center text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
              {entry.title ?? ''}
            </h1>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{entry.title ?? ''}</h1>
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RichText html={entry.body} />
      </div>
    </article>
  )
}

function PostView({
  entry,
  locale,
  siteOrigin,
  adjacent,
}: {
  entry: KontenaEntry<PostEntry>
  locale: Locale
  siteOrigin: string
  adjacent: {
    prev: { href: string; title: string } | null
    next: { href: string; title: string } | null
    prevLabel: string
    nextLabel: string
    ariaLabel: string
  }
}) {
  const cover = entry.cover?.url
  const dateIso = entry.publishedAt ?? entry._row.publishedAt
  const dateStr = formatDate(dateIso, locale)
  const url = `${siteOrigin}/${locale}/${entry._row.slug ?? ''}`
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd
        data={{
          '@type': 'Article',
          headline: entry.title,
          datePublished: dateIso,
          author: entry.author ? { '@type': 'Person', name: entry.author } : undefined,
          image: cover ? [cover] : undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        }}
      />
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        {entry.title ?? ''}
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        {entry.author ? <>{entry.author}</> : null}
        {entry.author && dateStr ? ' · ' : null}
        {dateStr ? <time dateTime={dateIso}>{dateStr}</time> : null}
      </p>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt={entry.cover?.alt ?? entry.title ?? ''}
          loading="lazy"
          decoding="async"
          className="mb-8 w-full rounded-lg object-cover"
        />
      ) : null}
      <RichText html={entry.body} />
      {entry.tags && entry.tags.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <li key={tag} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      <AdjacentNav {...adjacent} />
    </article>
  )
}
