'use client'

import { useLocale } from 'next-intl'
import { FormulirProvider, FormulirForm } from '@sawala/formulir-react'
import '@sawala/formulir-react/styles.css'

interface ContactFormProps {
  apiKey: string | undefined
  formSlug: string | undefined
}

export function ContactForm({ apiKey, formSlug }: ContactFormProps) {
  const locale = useLocale()

  if (!apiKey || !formSlug) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        Contact form is not configured. Set <code>NEXT_PUBLIC_FORMULIR_API_KEY</code>{' '}
        and <code>NEXT_PUBLIC_FORMULIR_CONTACT_FORM_SLUG</code> at build time.
      </div>
    )
  }

  return (
    <FormulirProvider apiKey={apiKey} locale={locale}>
      <FormulirForm slug={formSlug} />
    </FormulirProvider>
  )
}
