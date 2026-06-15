'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard button for the hero install chip. The surrounding page is
 * a static-exported Server Component; only this leaf is a client component so
 * it can reach `navigator.clipboard` in the browser. Shows "COPIED" for ~1.6s
 * after a successful copy, then reverts to its label.
 */
export function CopyButton({ value, label = 'COPY' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = () => {
    try {
      void navigator.clipboard?.writeText(value)
    } catch {
      /* clipboard unavailable (e.g. insecure context) — fail silently */
    }
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button type="button" className="copy-btn" onClick={onClick}>
      {copied ? 'COPIED' : label}
    </button>
  )
}
