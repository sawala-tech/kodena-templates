import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'
import { LocaleSwitcher, SiteFooter, type Locale, type SocialLink } from '@kodena-templates/ui'
import { routing } from '@/i18n/routing'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import type { SiteSettingsEntry } from '@/lib/types'
import '../globals.css'

// Force per-request SSR so Kontena edits propagate without redeploy.
// Without this, Next.js prerenders at build time and serves cached HTML
// with `cache-control: s-maxage=31536000` (1y edge cache, 300s stale-time).
// See PLAN-kodena-landing-ssr.md M4 cache-mode decision.
export const dynamic = 'force-dynamic'

export async function generateStaticParams(): Promise<Array<{ locale: string }>> {
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
  const k = getKontenaClient()
  const settings = (await k.getSingle<SiteSettingsEntry>('site-settings', locale).catch(() => null)) ?? null

  const siteName = settings?.siteName ?? config.siteName
  const footerText = settings?.footerText
  const socialLinks: ReadonlyArray<SocialLink> = settings?.socialLinks ?? []

  const hrefFor: Partial<Record<Locale, string>> = {}
  for (const l of config.locales) {
    hrefFor[l] = `/${l}`
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <header className="border-b border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <span className="text-lg font-bold tracking-tight text-zinc-900">{siteName}</span>
              <LocaleSwitcher current={locale} locales={config.locales} hrefFor={hrefFor} />
            </div>
          </header>
          {children}
          <SiteFooter siteName={siteName} footerText={footerText} socialLinks={socialLinks} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
