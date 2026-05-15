'use client'

import Link from 'next/link'

export type Locale = 'id' | 'en'

interface LocaleSwitcherProps {
  current: Locale
  locales: ReadonlyArray<Locale>
  /** Map of locale → URL path to navigate to for that locale. */
  hrefFor: Partial<Record<Locale, string>>
}

const labelFor: Record<Locale, string> = {
  id: 'ID',
  en: 'EN',
}

/**
 * Minimal locale switcher: renders a horizontal pair of language links.
 * The active locale is bolded; the others are dimmed. No dropdown,
 * because for a one-page landing template there are at most two locales
 * and a flat link strip is clearer.
 */
export function LocaleSwitcher({ current, locales, hrefFor }: LocaleSwitcherProps) {
  return (
    <nav aria-label="Language" className="flex items-center gap-2 text-sm font-medium">
      {locales.map((l, idx) => {
        const isActive = l === current
        const href = hrefFor[l] ?? '/'
        return (
          <span key={l} className="flex items-center gap-2">
            {idx > 0 ? <span aria-hidden className="text-zinc-300">·</span> : null}
            {isActive ? (
              <span aria-current="true" className="font-bold text-zinc-900">
                {labelFor[l]}
              </span>
            ) : (
              <Link href={href} className="text-zinc-500 hover:text-zinc-900">
                {labelFor[l]}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
