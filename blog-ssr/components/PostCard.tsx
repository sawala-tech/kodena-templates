import Link from 'next/link'

interface PostCardProps {
  href: string
  title: string
  excerpt?: string
  coverUrl?: string
  coverAlt?: string
  meta?: string
  readMoreLabel: string
}

/** A single post summary card used in lists and search results. */
export function PostCard({ href, title, excerpt, coverUrl, coverAlt, meta, readMoreLabel }: PostCardProps) {
  return (
    <article className="section-post flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {coverUrl ? (
        <Link href={href} className="block aspect-[16/9] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={coverAlt ?? title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition hover:scale-105"
          />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        {meta ? <p className="mb-2 text-xs text-zinc-500">{meta}</p> : null}
        <h2 className="mb-2 text-lg font-semibold tracking-tight text-zinc-900">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h2>
        {excerpt ? <p className="mb-4 line-clamp-3 text-sm text-zinc-600">{excerpt}</p> : null}
        <div className="mt-auto">
          <Link href={href} className="text-sm font-medium text-zinc-900 hover:underline">
            {readMoreLabel} →
          </Link>
        </div>
      </div>
    </article>
  )
}
