import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { getCart, StorefrontApiError } from '@/lib/storefront-api'
import { clearCartSession, getCartSession } from '@/lib/cart-session'

// GET /api/cart — the current cart (or an empty shape when none). The publishable
// key and cart_token stay server-side; the browser only sees the cart view.
export async function GET() {
  const config = loadConfig()
  const session = await getCartSession()
  if (!session) return NextResponse.json({ empty: true })
  try {
    const cart = await getCart(config, session.cartId, session.cartToken)
    return NextResponse.json(cart)
  } catch (e) {
    // A stale/tampered cookie → clear it and report empty, never another cart.
    if (e instanceof StorefrontApiError && (e.status === 401 || e.status === 404)) {
      await clearCartSession()
      return NextResponse.json({ empty: true })
    }
    throw e
  }
}
