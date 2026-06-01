'use client'

import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/config'

const labelFor: Record<Locale, string> = { id: 'ID', en: 'EN' }

/**
 * Header language switcher. Unlike a static prefix-swap, each non-active locale
 * links to `/api/switch-locale`, which resolves the *translated* slug of the
 * current content entry via its Kontena `documentId` (so `/id/selamat-datang`
 * → `/en/welcome`, not `/en/selamat-datang`). Home and static routes swap the
 * prefix as before.
 */
export function LocaleSwitcher({
  current,
  locales,
}: {
  current: Locale
  locales: ReadonlyArray<Locale>
}) {
  const path = usePathname() || `/${current}`
  return (
    <nav aria-label="Language" className="flex items-center gap-2 text-sm font-medium">
      {locales.map((l, idx) => {
        const isActive = l === current
        return (
          <span key={l} className="flex items-center gap-2">
            {idx > 0 ? <span aria-hidden className="text-zinc-300">·</span> : null}
            {isActive ? (
              <span aria-current="true" className="font-bold text-zinc-900">
                {labelFor[l]}
              </span>
            ) : (
              <a
                href={`/api/switch-locale?to=${l}&path=${encodeURIComponent(path)}`}
                className="text-zinc-500 hover:text-zinc-900"
              >
                {labelFor[l]}
              </a>
            )}
          </span>
        )
      })}
    </nav>
  )
}
