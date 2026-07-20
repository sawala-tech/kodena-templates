'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PublicProduct } from '@/lib/storefront-api'
import { formatMoney } from '@/lib/format'

// Client control: pick a variant + quantity, add to cart via the app's own Route
// Handler (which holds the cart_token cookie server-side), then go to the cart.
export function AddToCart({ product, currency }: { product: PublicProduct; currency: string }) {
  const router = useRouter()
  const buyable = product.variants.filter((v) => v.available > 0)
  const [variantId, setVariantId] = useState(buyable[0]?.id ?? product.variants[0]?.id ?? '')
  const [qty, setQty] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variant = product.variants.find((v) => v.id === variantId)
  const outOfStock = !variant || variant.available <= 0

  async function add() {
    if (!variant) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: qty }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error === 'INSUFFICIENT_STOCK' ? 'Not enough stock for that quantity.' : (body.error ?? 'Could not add to cart'))
      }
      router.push('/cart')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add to cart')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {product.variants.map((v) => {
          const disabled = v.available <= 0
          return (
            <label key={v.id} className={`flex items-center justify-between rounded-lg border p-3 ${variantId === v.id ? 'border-zinc-900' : 'border-zinc-200'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
              <span className="flex items-center gap-2">
                <input type="radio" name="variant" value={v.id} checked={variantId === v.id} onChange={() => setVariantId(v.id)} disabled={disabled} />
                <span className="text-sm font-medium">{v.title}</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-sm">{formatMoney(v.priceIdr, currency)}</span>
                <span className="text-xs text-zinc-500">{disabled ? 'Out of stock' : `${v.available} in stock`}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-zinc-200">
          <button type="button" className="px-3 py-2 text-lg leading-none disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
          <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
          <button type="button" className="px-3 py-2 text-lg leading-none disabled:opacity-40" onClick={() => setQty((q) => Math.min(variant?.available ?? 1, q + 1))} disabled={!variant || qty >= variant.available}>+</button>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={busy || outOfStock}
          className="flex-1 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? 'Adding…' : outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
