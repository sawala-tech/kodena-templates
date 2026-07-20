import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { quoteShipping, StorefrontApiError, type Address } from '@/lib/storefront-api'
import { getCartSession } from '@/lib/cart-session'

// POST /api/cart/shipping/quote { destination } → live courier options.
export async function POST(req: Request) {
  const config = loadConfig()
  const session = await getCartSession()
  if (!session) return NextResponse.json({ error: 'NO_CART' }, { status: 404 })
  const body = (await req.json().catch(() => null)) as { destination?: Address } | null
  if (!body?.destination) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  try {
    const options = await quoteShipping(config, session.cartId, session.cartToken, body.destination)
    return NextResponse.json(options)
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}
