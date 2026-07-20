import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { selectShipping, StorefrontApiError, type Address } from '@/lib/storefront-api'
import { getCartSession } from '@/lib/cart-session'

// POST /api/cart/shipping/select { destination, courierCode, serviceCode, priceIdr }
// The API re-quotes server-side and rejects a forged cheaper price (SHIPPING_PRICE_STALE).
export async function POST(req: Request) {
  const config = loadConfig()
  const session = await getCartSession()
  if (!session) return NextResponse.json({ error: 'NO_CART' }, { status: 404 })
  const body = (await req.json().catch(() => null)) as
    | { destination?: Address; courierCode?: string; serviceCode?: string; priceIdr?: number }
    | null
  if (!body?.destination || !body.courierCode || body.priceIdr == null) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }
  try {
    const cart = await selectShipping(config, session.cartId, session.cartToken, body.destination, {
      courierCode: body.courierCode,
      serviceCode: body.serviceCode ?? '',
      priceIdr: body.priceIdr,
    })
    return NextResponse.json(cart)
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}
