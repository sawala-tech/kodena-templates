import { cookies } from 'next/headers'

// The cart's bearer secret lives in an httpOnly cookie so page JavaScript (and
// thus XSS) cannot read it. Only the app's server-side Route Handlers touch it.
const CART_ID = 'sf_cart_id'
const CART_TOKEN = 'sf_cart_token'
const ORDER_ID = 'sf_order_id'
const ORDER_TOKEN = 'sf_order_token'

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export async function getCartSession(): Promise<{ cartId: string; cartToken: string } | null> {
  const c = await cookies()
  const cartId = c.get(CART_ID)?.value
  const cartToken = c.get(CART_TOKEN)?.value
  return cartId && cartToken ? { cartId, cartToken } : null
}

export async function setCartSession(cartId: string, cartToken: string): Promise<void> {
  const c = await cookies()
  c.set(CART_ID, cartId, cookieOpts)
  c.set(CART_TOKEN, cartToken, cookieOpts)
}

export async function clearCartSession(): Promise<void> {
  const c = await cookies()
  c.delete(CART_ID)
  c.delete(CART_TOKEN)
}

export async function setOrderSession(orderId: string, orderToken: string): Promise<void> {
  const c = await cookies()
  c.set(ORDER_ID, orderId, cookieOpts)
  c.set(ORDER_TOKEN, orderToken, cookieOpts)
}

export async function getOrderSession(): Promise<{ orderId: string; orderToken: string } | null> {
  const c = await cookies()
  const orderId = c.get(ORDER_ID)?.value
  const orderToken = c.get(ORDER_TOKEN)?.value
  return orderId && orderToken ? { orderId, orderToken } : null
}
