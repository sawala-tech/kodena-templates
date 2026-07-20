import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { removeItem, updateItem, StorefrontApiError } from '@/lib/storefront-api'
import { getCartSession } from '@/lib/cart-session'

type Ctx = { params: Promise<{ itemId: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  const config = loadConfig()
  const session = await getCartSession()
  if (!session) return NextResponse.json({ error: 'NO_CART' }, { status: 404 })
  const { itemId } = await params
  const body = (await req.json().catch(() => null)) as { quantity?: number } | null
  if (!body?.quantity || body.quantity < 1) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  try {
    const cart = await updateItem(config, session.cartId, session.cartToken, itemId, body.quantity)
    return NextResponse.json(cart)
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const config = loadConfig()
  const session = await getCartSession()
  if (!session) return NextResponse.json({ error: 'NO_CART' }, { status: 404 })
  const { itemId } = await params
  try {
    const cart = await removeItem(config, session.cartId, session.cartToken, itemId)
    return NextResponse.json(cart)
  } catch (e) {
    if (e instanceof StorefrontApiError) return NextResponse.json({ error: e.code }, { status: e.status })
    throw e
  }
}
