interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data })
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
