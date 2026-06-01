import Link from 'next/link'

interface AdjacentNavProps {
  prev: { href: string; title: string } | null
  next: { href: string; title: string } | null
  prevLabel: string
  nextLabel: string
  ariaLabel: string
}

/** Older/newer post navigation shown at the foot of a post. */
export function AdjacentNav({ prev, next, prevLabel, nextLabel, ariaLabel }: AdjacentNavProps) {
  if (!prev && !next) return null
  return (
    <nav aria-label={ariaLabel} className="mt-12 grid gap-4 border-t border-zinc-200 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className="group rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50">
          <span className="text-xs text-zinc-500">← {prevLabel}</span>
          <span className="mt-1 block text-sm font-medium text-zinc-900 group-hover:underline">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="group rounded-lg border border-zinc-200 p-4 text-right hover:bg-zinc-50 sm:col-start-2">
          <span className="text-xs text-zinc-500">{nextLabel} →</span>
          <span className="mt-1 block text-sm font-medium text-zinc-900 group-hover:underline">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
