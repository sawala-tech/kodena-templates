import Link from 'next/link'
import type { Locale } from '@/lib/config'
import type { MenuItem } from '@/lib/types'
import { resolveHref, isExternal } from '@/lib/format'

/**
 * Header navigation rendered server-side from the `menu` Kontena entry.
 * Top-level items with `children` render as a CSS hover/focus dropdown
 * (no client JS); items without children render as plain links. Each `href`
 * is resolved per the content-model convention (internal paths get the locale
 * prefix; external/anchor pass through).
 */
export function MenuNav({ items, locale }: { items: MenuItem[]; locale: Locale }) {
  if (!items || items.length === 0) return null
  return (
    <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
      {items.map((item, idx) => {
        const children = item.children?.filter((c) => c.label) ?? []
        const label = item.label ?? ''
        if (children.length > 0) {
          return (
            <div key={`${label}-${idx}`} className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
                aria-haspopup="true"
              >
                {label}
                <span aria-hidden className="text-xs">▾</span>
              </button>
              <div className="invisible absolute left-0 top-full z-20 min-w-44 rounded-md border border-zinc-200 bg-white py-1 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                {children.map((child, cIdx) => (
                  <MenuLink
                    key={`${child.label}-${cIdx}`}
                    href={child.href}
                    label={child.label ?? ''}
                    locale={locale}
                    className="block px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  />
                ))}
              </div>
            </div>
          )
        }
        return (
          <MenuLink
            key={`${label}-${idx}`}
            href={item.href}
            label={label}
            locale={locale}
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
          />
        )
      })}
    </nav>
  )
}

function MenuLink({
  href,
  label,
  locale,
  className,
}: {
  href?: string
  label: string
  locale: Locale
  className?: string
}) {
  const resolved = resolveHref(href, locale)
  if (isExternal(href)) {
    return (
      <a href={resolved} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    )
  }
  return (
    <Link href={resolved} className={className}>
      {label}
    </Link>
  )
}
