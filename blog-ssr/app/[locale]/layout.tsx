import { notFound } from 'next/navigation'
import Link from 'next/link'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { LocaleSwitcher, SiteFooter, type Locale as UiLocale, type SocialLink } from '@kodena-templates/ui'
import { routing } from '@/i18n/routing'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import { MenuNav } from '@/components/MenuNav'
import type { Locale } from '@/lib/config'
import type { MenuEntry, SiteSettingsEntry } from '@/lib/types'
import '../globals.css'

// Force per-request SSR so Kontena edits propagate without a redeploy
// (mirrors the landing-ssr template's cache-mode decision).
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!hasLocale(routing.locales, raw)) notFound()
  const locale = raw as Locale
  setRequestLocale(locale)

  const config = loadConfig()
  const t = await getTranslations('Nav')
  const k = getKontenaClient()
  const [settings, menu] = await Promise.all([
    k.getSingle<SiteSettingsEntry>('site-settings', locale).catch(() => null),
    k.getSingle<MenuEntry>('menu', locale).catch(() => null),
  ])

  const siteName = settings?.siteName ?? config.siteName
  const socialLinks: ReadonlyArray<SocialLink> = settings?.socialLinks ?? []
  const items = menu?.items ?? []

  const hrefFor: Partial<Record<UiLocale, string>> = {}
  for (const l of config.locales) hrefFor[l] = `/${l}`

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link href={`/${locale}`} className="text-lg font-bold tracking-tight text-zinc-900">
                {siteName}
              </Link>
              <div className="flex items-center gap-6">
                <MenuNav items={items} locale={locale} />
                <form action={`/${locale}/search`} className="hidden sm:block">
                  <input
                    type="search"
                    name="q"
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('search')}
                    className="w-40 rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:w-56 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </form>
                <LocaleSwitcher current={locale} locales={config.locales} hrefFor={hrefFor} />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <SiteFooter siteName={siteName} footerText={settings?.footerText} socialLinks={socialLinks} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
