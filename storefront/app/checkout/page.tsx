'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Address, CartView, ShippingOption } from '@/lib/storefront-api'
import { formatMoney } from '@/lib/format'

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartView | null>(null)
  const [address, setAddress] = useState<Address>({})
  const [options, setOptions] = useState<ShippingOption[] | null>(null)
  const [selected, setSelected] = useState<ShippingOption | null>(null)
  const [buyer, setBuyer] = useState({ email: '', name: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCart = useCallback(async () => {
    const res = await fetch('/api/cart', { cache: 'no-store' })
    const data = (await res.json()) as CartView | { empty: true }
    if (!('empty' in data)) setCart(data)
  }, [])
  useEffect(() => { loadCart() }, [loadCart])

  const setA = (k: keyof Address, v: string) => setAddress((p) => ({ ...p, [k]: v }))

  async function getQuotes() {
    setBusy(true); setError(null); setOptions(null); setSelected(null)
    try {
      const res = await fetch('/api/cart/shipping/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ destination: address }) })
      const data = (await res.json()) as { options: ShippingOption[] } | { error: string }
      if ('error' in data) throw new Error(data.error)
      setOptions(data.options)
      if (data.options.length === 0) setError('No courier options for that address.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not get shipping options') }
    finally { setBusy(false) }
  }

  async function pick(opt: ShippingOption) {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/cart/shipping/select', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ destination: address, courierCode: opt.courierCode, serviceCode: opt.serviceCode, priceIdr: opt.priceIdr }) })
      const data = (await res.json()) as CartView | { error: string }
      if ('error' in data) throw new Error(data.error === 'SHIPPING_PRICE_STALE' ? 'That option just changed price — please re-quote.' : data.error)
      setCart(data); setSelected(opt)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not select shipping') }
    finally { setBusy(false) }
  }

  async function pay() {
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/cart/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ buyer }) })
      const data = (await res.json()) as { checkoutUrl: string } | { error: string }
      if ('error' in data) throw new Error(data.error)
      window.location.href = data.checkoutUrl // full-page redirect to the hosted Xendit page
    } catch (e) { setError(e instanceof Error ? e.message : 'Checkout failed'); setBusy(false) }
  }

  const currency = cart?.currency ?? 'IDR'
  if (!cart) return <p className="text-sm text-zinc-500">Loading…</p>
  if (cart.items.length === 0) return <div className="py-16 text-center"><p className="text-sm text-zinc-500">Your cart is empty.</p><Link href="/" className="mt-4 inline-block text-sm underline">Shop</Link></div>

  const discount = cart.discountIdr ?? 0
  const shipping = selected?.priceIdr ?? (cart.shippingOption?.priceIdr as number | undefined) ?? 0
  const total = cart.subtotalIdr - discount + shipping
  const canPay = Boolean(selected || cart.shippingOption) && /.+@.+/.test(buyer.email)

  return (
    <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_20rem]">
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1 · Shipping address</h2>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Recipient" v={address.recipient} on={(x) => setA('recipient', x)} />
            <Input label="Phone" v={address.phone} on={(x) => setA('phone', x)} />
            <Input label="Street" v={address.street} on={(x) => setA('street', x)} full />
            <Input label="City" v={address.city} on={(x) => setA('city', x)} />
            <Input label="Province" v={address.province} on={(x) => setA('province', x)} />
            <Input label="Postal code" v={address.postalCode} on={(x) => setA('postalCode', x)} />
          </div>
          <button onClick={getQuotes} disabled={busy || !address.postalCode} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50">
            {busy ? 'Checking…' : 'Get shipping options'}
          </button>
        </section>

        {options && (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2 · Courier</h2>
            {options.map((o) => (
              <label key={`${o.courierCode}-${o.serviceCode}`} className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${selected === o ? 'border-zinc-900' : 'border-zinc-200'}`}>
                <span className="flex items-center gap-2 text-sm">
                  <input type="radio" name="ship" checked={selected === o} onChange={() => pick(o)} />
                  <span><span className="font-medium">{o.courierName}</span> {o.serviceName} · <span className="text-zinc-500">{o.etd}</span></span>
                </span>
                <span className="text-sm">{formatMoney(o.priceIdr, currency)}</span>
              </label>
            ))}
          </section>
        )}

        {(selected || cart.shippingOption) && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3 · Your details</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" v={buyer.email} on={(x) => setBuyer((b) => ({ ...b, email: x }))} full />
              <Input label="Name" v={buyer.name} on={(x) => setBuyer((b) => ({ ...b, name: x }))} />
              <Input label="Phone" v={buyer.phone} on={(x) => setBuyer((b) => ({ ...b, phone: x }))} />
            </div>
          </section>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <aside className="h-fit space-y-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm">
        {cart.items.map((it) => (
          <div key={it.itemId} className="flex justify-between text-zinc-600"><span className="truncate pr-2">{it.title} × {it.quantity}</span><span>{formatMoney(it.lineSubtotalIdr, currency)}</span></div>
        ))}
        <div className="border-t pt-2">
          <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>{formatMoney(cart.subtotalIdr, currency)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatMoney(discount, currency)}</span></div>}
          <div className="flex justify-between text-zinc-600"><span>Shipping</span><span>{shipping ? formatMoney(shipping, currency) : '—'}</span></div>
          <div className="mt-1 flex justify-between border-t pt-1 font-semibold"><span>Total</span><span>{formatMoney(total, currency)}</span></div>
        </div>
        <button onClick={pay} disabled={!canPay || busy} className="w-full rounded-lg bg-zinc-900 px-5 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
          {busy ? 'Redirecting…' : 'Pay'}
        </button>
        <p className="text-center text-xs text-zinc-400">You&apos;ll pay securely on the hosted Xendit page.</p>
      </aside>
    </div>
  )
}

function Input({ label, v, on, full }: { label: string; v?: string; on: (v: string) => void; full?: boolean }) {
  return (
    <div className={`space-y-1 ${full ? 'col-span-2' : ''}`}>
      <label className="text-xs text-zinc-500">{label}</label>
      <input value={v ?? ''} onChange={(e) => on(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
    </div>
  )
}
