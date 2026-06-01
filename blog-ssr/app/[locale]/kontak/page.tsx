import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { buildMetadata } from '@kodena-templates/seo'
import { ContactForm } from '@kodena-templates/ui'
import { loadConfig } from '@/lib/config'
import type { Locale } from '@/lib/config'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = raw as Locale
  const config = loadConfig()
  const t = await getTranslations({ locale, namespace: 'Contact' })
  return buildMetadata({
    path: `/${locale}/kontak`,
    siteOrigin: config.siteOrigin,
    siteName: config.siteName,
    title: t('title'),
    locale,
  })
}

export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params
  const locale = raw as Locale
  setRequestLocale(locale)

  const config = loadConfig()
  const t = await getTranslations('Contact')

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">{t('title')}</h1>
      <p className="mb-8 text-base leading-relaxed text-zinc-600">{t('body')}</p>
      <ContactForm apiKey={config.formulirApiKey} formSlug={config.formulirContactFormSlug} />
    </div>
  )
}
