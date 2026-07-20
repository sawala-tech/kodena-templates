import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { checkout, StorefrontApiError, type GuestBuyer } from '@/lib/storefront-api'
import { clearCartSession, getCartSession, setOrderSession } from '@/lib/cart-session'

// POST /api/cart/checkout { buyer } → { orderId, checkoutUrl }. Stores the order
// id + token in cookies for the thank-you read, and clears the cart session (the
// cart is now converted). The browser then redirects to the hosted Xendit page.
export async function POST(req: Request) {
  const config = loadConfig()
  const session = await getCartSession()
  if (!session) return NextResponse.json({ error: 'NO_CART' }, { status: 404 })
  const body = (await req.json().catch(() => null)) as { buyer?: GuestBuyer } | null
  if (!body?.buyer?.email) return NextResponse.json({ error: 'EMAIL_REQUIRED' }, { status: 400 })
  try {
    // Absolute thank-you URL derived from this request's own origin, so Xendit
    // sends the shopper straight back to this shop after a successful payment.
    const returnUrl = `${new URL(req.url).origin}/thank-you`
    const result = await checkout(config, session.cartId, session.cartToken, body.buyer, returnUrl)
    await setOrderSession(result.orderId, result.orderToken)
    await clearCartSession()
    return NextResponse.json({ orderId: result.orderId, checkoutUrl: result.checkoutUrl })
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}
