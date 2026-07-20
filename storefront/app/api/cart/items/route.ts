import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { addItem, createCart, StorefrontApiError } from '@/lib/storefront-api'
import { getCartSession, setCartSession } from '@/lib/cart-session'

// POST /api/cart/items { variantId, quantity } — ensures a cart exists (creating
// one and setting the httpOnly cookie on first add), then adds the line.
export async function POST(req: Request) {
  const config = loadConfig()
  const body = (await req.json().catch(() => null)) as { variantId?: string; quantity?: number } | null
  if (!body?.variantId || !body.quantity || body.quantity < 1) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  let session = await getCartSession()
  if (!session) {
    const created = await createCart(config)
    await setCartSession(created.cartId, created.cartToken)
    session = { cartId: created.cartId, cartToken: created.cartToken }
  }

  try {
    const cart = await addItem(config, session.cartId, session.cartToken, body.variantId, body.quantity)
    return NextResponse.json(cart)
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}
