import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { buildMetadata } from '@kodena-templates/seo'
import { ContactForm, FeatureCard, HeroSection, JsonLd } from '@kodena-templates/ui'
import type { Locale } from '@/i18n/routing'
import { loadConfig } from '@/lib/config'
import { getKontenaClient } from '@/lib/kontena-server'
import type { LandingEntry, SiteSettingsEntry } from '@/lib/types'

// Force per-request SSR (see app/[locale]/layout.tsx for the full rationale).
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = raw as Locale
  const config = loadConfig()
  const k = getKontenaClient()
  const settings = await k.getSingle<SiteSettingsEntry>('site-settings', locale).catch(() => null)
  const landing = await k.getSingle<LandingEntry>('landing', locale).catch(() => null)

  const path = `/${locale}`
  const alternates: Partial<Record<Locale, string>> = {}
  for (const l of config.locales) {
    alternates[l] = `/${l}`
  }

  const ogImage =
    settings?.defaultOgImage?.url
      ? {
          url: settings.defaultOgImage.url,
          width: settings.defaultOgImage.width,
          height: settings.defaultOgImage.height,
          alt: settings.defaultOgImage.alt ?? undefined,
        }
      : undefined

  return buildMetadata({
    path,
    siteOrigin: config.siteOrigin,
    siteName: settings?.siteName ?? config.siteName,
    title: landing?.heroTitle ?? settings?.siteName ?? config.siteName,
    description: settings?.tagline ?? landing?.heroSubtitle,
    locale,
    alternates,
    ogImage,
  })
}

export default async function LandingPage({ params }: Props) {
  const { locale: raw } = await params
  const locale = raw as Locale
  setRequestLocale(locale)

  const config = loadConfig()
  const t = await getTranslations('Contact')
  const k = getKontenaClient()
  const [settings, landing] = await Promise.all([
    k.getSingle<SiteSettingsEntry>('site-settings', locale).catch(() => null),
    k.getSingle<LandingEntry>('landing', locale).catch(() => null),
  ])

  const heroTitle = landing?.heroTitle ?? settings?.siteName ?? config.siteName
  const heroSubtitle = landing?.heroSubtitle ?? settings?.tagline
  const heroImage = landing?.heroImage?.url
  const features = landing?.features ?? []
  const contactTitle = landing?.contactSectionTitle ?? t('sectionDefault')
  const contactBody = landing?.contactSectionBody
  const siteName = settings?.siteName ?? config.siteName

  return (
    <main className="min-h-screen">
      <JsonLd
        data={{
          '@type': 'Organization',
          name: siteName,
          url: config.siteOrigin,
          description: settings?.tagline,
        }}
      />

      <HeroSection
        title={heroTitle}
        subtitle={heroSubtitle}
        imageUrl={heroImage}
        imageAlt={landing?.heroImage?.alt ?? heroTitle}
        ctaLabel={landing?.heroCtaLabel}
        ctaHref={landing?.heroCtaHref}
      />

      {features.length > 0 ? (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {features.map((f, idx) => (
              <FeatureCard
                key={(f.title ?? '') + idx}
                iconEmoji={f.iconEmoji}
                title={f.title ?? ''}
                body={f.body}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {contactTitle}
          </h2>
          {contactBody ? (
            <p className="mb-8 text-base leading-relaxed text-zinc-600">{contactBody}</p>
          ) : null}
          <ContactForm
            apiKey={config.formulirApiKey}
            formSlug={config.formulirContactFormSlug}
          />
        </div>
      </section>
    </main>
  )
}
