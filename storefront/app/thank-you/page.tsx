'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { OrderView } from '@/lib/storefront-api'
import { formatMoney } from '@/lib/format'

// Settlement is async (Xendit → backend webhook), so the order may read
// `pending_payment` immediately on return and flip to `paid` seconds later. Poll a
// few times, then fall back to a "we'll email you" message.
export default function ThankYouPage() {
  const [order, setOrder] = useState<OrderView | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'none'>('loading')
  const tries = useRef(0)

  useEffect(() => {
    let stop = false
    async function poll() {
      const res = await fetch('/api/order', { cache: 'no-store' })
      if (res.status === 404) { setState('none'); return }
      const data = (await res.json()) as OrderView
      if (stop) return
      setOrder(data); setState('ok')
      tries.current += 1
      if (data.status === 'pending_payment' && tries.current < 8) setTimeout(poll, 2500)
    }
    poll()
    return () => { stop = true }
  }, [])

  if (state === 'loading') return <p className="text-sm text-zinc-500">Loading your order…</p>
  if (state === 'none' || !order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-semibold">Thank you!</h1>
        <p className="mt-2 text-sm text-zinc-500">Your order is being processed. We&apos;ll email you a confirmation.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">Back to shop</Link>
      </div>
    )
  }

  const currency = 'IDR'
  const paid = order.status !== 'pending_payment'
  return (
    <div className="mx-auto max-w-lg space-y-5 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{paid ? 'Payment received 🎉' : 'Thank you!'}</h1>
        <p className="mt-1 text-sm text-zinc-500">Order <span className="font-mono">{order.orderId}</span> · <span className="capitalize">{order.status.replace('_', ' ')}</span></p>
        {!paid && <p className="mt-2 text-xs text-zinc-400">Waiting for payment confirmation…</p>}
      </div>
      <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        {order.items.map((it, i) => (
          <div key={i} className="flex justify-between text-zinc-600"><span>{it.title} × {it.quantity}</span><span>{formatMoney(it.unitPriceIdr * it.quantity, currency)}</span></div>
        ))}
        <div className="border-t pt-2">
          <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>{formatMoney(order.subtotalIdr, currency)}</span></div>
          <div className="flex justify-between text-zinc-600"><span>Shipping</span><span>{formatMoney(order.shippingIdr, currency)}</span></div>
          <div className="mt-1 flex justify-between border-t pt-1 font-semibold"><span>Total</span><span>{formatMoney(order.totalIdr, currency)}</span></div>
        </div>
        {order.trackingNumber && <p className="pt-1 text-xs text-zinc-500">Tracking: {order.trackingNumber}</p>}
      </div>
      <Link href="/" className="block text-center text-sm underline">Continue shopping</Link>
    </div>
  )
}
