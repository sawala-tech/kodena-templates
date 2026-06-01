import Link from 'next/link'

interface PaginationProps {
  /** Path of the list page, locale-prefixed, e.g. `/id` or `/en`. */
  basePath: string
  /** The cursor that produced the current page (undefined on page 1). */
  currentCursor?: string
  /** CSV of cursors used to reach prior pages (excluding the current one). */
  stack?: string
  hasMore: boolean
  nextCursor?: string | null
  prevLabel: string
  nextLabel: string
}

/**
 * Cursor-based prev/next pager. Kontena pages collections with opaque cursors,
 * so we keep the trail of prior cursors in a `stack` query param to support a
 * working "previous" link without re-fetching from the start.
 */
export function Pagination({
  basePath,
  currentCursor,
  stack,
  hasMore,
  nextCursor,
  prevLabel,
  nextLabel,
}: PaginationProps) {
  const stackArr = stack ? stack.split(',').filter(Boolean) : []

  // Next: push the current cursor onto the stack, navigate with nextCursor.
  const nextStack = currentCursor ? [...stackArr, currentCursor] : stackArr
  const nextHref =
    hasMore && nextCursor
      ? `${basePath}?cursor=${encodeURIComponent(nextCursor)}${
          nextStack.length ? `&stack=${encodeURIComponent(nextStack.join(','))}` : ''
        }`
      : null

  // Prev: pop the last cursor off the stack and navigate to it (or page 1).
  const prevStack = stackArr.slice(0, -1)
  const prevCursor = stackArr[stackArr.length - 1]
  const hasPrev = Boolean(currentCursor)
  const prevHref = hasPrev
    ? prevCursor
      ? `${basePath}?cursor=${encodeURIComponent(prevCursor)}${
          prevStack.length ? `&stack=${encodeURIComponent(prevStack.join(','))}` : ''
        }`
      : basePath
    : null

  if (!prevHref && !nextHref) return null

  return (
    <nav className="mt-10 flex items-center justify-between" aria-label="Pagination">
      {prevHref ? (
        <Link href={prevHref} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          ← {prevLabel}
        </Link>
      ) : (
        <span />
      )}
      {nextHref ? (
        <Link href={nextHref} className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
          {nextLabel} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
