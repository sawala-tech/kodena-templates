'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { CartView } from '@/lib/storefront-api'
import { formatMoney } from '@/lib/format'

export default function CartPage() {
  const [cart, setCart] = useState<CartView | null>(null)
  const [empty, setEmpty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/cart', { cache: 'no-store' })
    const data = (await res.json()) as CartView | { empty: true }
    if ('empty' in data) { setEmpty(true); setCart(null) } else { setEmpty(false); setCart(data) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function update(itemId: string, quantity: number) {
    setError(null)
    const res = await fetch(`/api/cart/items/${itemId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ quantity }) })
    const data = (await res.json()) as CartView | { error: string }
    if ('error' in data) setError(data.error === 'INSUFFICIENT_STOCK' ? 'Not enough stock.' : data.error)
    else setCart(data)
  }
  async function remove(itemId: string) {
    const res = await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' })
    const data = (await res.json()) as CartView | { error: string }
    if (!('error' in data)) { setCart(data); if (data.items.length === 0) setEmpty(true) }
  }

  const currency = cart?.currency ?? 'IDR'

  if (loading) return <p className="text-sm text-zinc-500">Loading cart…</p>
  if (empty || !cart || cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-500">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">Continue shopping</Link>
      </div>
    )
  }

  const discount = cart.discountIdr ?? 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="divide-y rounded-xl border border-zinc-200 bg-white">
        {cart.items.map((it) => (
          <div key={it.itemId} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{it.title}</p>
              <p className="text-xs text-zinc-500">{formatMoney(it.unitPriceIdr, currency)} · {it.availableStock} in stock</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-zinc-200">
                <button className="px-2.5 py-1.5 disabled:opacity-40" onClick={() => update(it.itemId, it.quantity - 1)} disabled={it.quantity <= 1}>−</button>
                <span className="w-8 text-center text-sm tabular-nums">{it.quantity}</span>
                <button className="px-2.5 py-1.5 disabled:opacity-40" onClick={() => update(it.itemId, it.quantity + 1)} disabled={it.quantity >= it.availableStock}>+</button>
              </div>
              <span className="w-24 text-right text-sm tabular-nums">{formatMoney(it.lineSubtotalIdr, currency)}</span>
              <button className="text-xs text-zinc-400 hover:text-red-600" onClick={() => remove(it.itemId)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>{formatMoney(cart.subtotalIdr, currency)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatMoney(discount, currency)}</span></div>}
        <div className="flex justify-between pt-1 font-semibold"><span>Total</span><span>{formatMoney(cart.subtotalIdr - discount, currency)}</span></div>
        <p className="pt-1 text-xs text-zinc-400">Shipping calculated at checkout.</p>
      </div>
      <Link href="/checkout" className="block rounded-lg bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800">
        Checkout
      </Link>
    </div>
  )
}
