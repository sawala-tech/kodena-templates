import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { getOrder, StorefrontApiError } from '@/lib/storefront-api'
import { getOrderSession } from '@/lib/cart-session'

// GET /api/order — the last order for this browser (thank-you page). Authorised by
// the order_token cookie; the API scopes the read to that token.
export async function GET() {
  const config = loadConfig()
  const session = await getOrderSession()
  if (!session) return NextResponse.json({ error: 'NO_ORDER' }, { status: 404 })
  try {
    const order = await getOrder(config, session.orderId, session.orderToken)
    return NextResponse.json(order)
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}
