/**
 * Renders a Kontena `richtext` field (HTML string) inside a Tailwind `prose`
 * wrapper. The content originates from trusted project editors via Kontena, so
 * we inject it as HTML; if `html` is empty we render nothing.
 */
export function RichText({ html, className }: { html?: string; className?: string }) {
  if (!html) return null
  return (
    <div
      className={className ?? 'prose prose-zinc max-w-none'}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
