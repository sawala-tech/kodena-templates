import type { StorefrontConfig } from './config'

// Typed client for the Kiosna Display public API. One function per endpoint. This
// is deliberately the whole data layer — a fork (or a future @sawala/kiosna SDK)
// can reuse it wholesale. Defaults to the gateway publishable-key plane
// (/public/display/* + X-API-Key); the consumer-host plane is a documented
// alternative a forker enables with API_USE_HOST_PLANE=true.

// ── Types (the public contract) ──────────────────────────────────────────────
export interface PublicVariant {
  id: string
  title: string
  priceIdr: number
  available: number
}
export interface PublicProduct {
  slug: string
  title: string
  description: string | null
  category: string | null
  images: string[]
  variants: PublicVariant[]
}
export interface ProductList {
  items: PublicProduct[]
  hasMore: boolean
  nextCursor: string | null
}
export interface CartLine {
  itemId: string
  variantId: string
  title: string
  quantity: number
  unitPriceIdr: number
  lineSubtotalIdr: number
  availableStock: number
}
export interface CartView {
  cartId: string
  status: string
  currency: string
  items: CartLine[]
  subtotalIdr: number
  discountIdr?: number
  shippingAddress: Record<string, unknown> | null
  shippingOption: Record<string, unknown> | null
}
export interface ShippingOption {
  courierCode: string
  courierName: string
  serviceCode: string
  serviceName: string
  etd: string
  priceIdr: number
}
export interface CheckoutResult {
  orderId: string
  orderToken: string
  checkoutUrl: string
}
export interface OrderView {
  orderId: string
  status: string
  items: { title: string; quantity: number; unitPriceIdr: number }[]
  subtotalIdr: number
  shippingIdr: number
  totalIdr: number
  shippingOption: Record<string, unknown> | null
  trackingNumber: string | null
}
export interface Address {
  recipient?: string
  phone?: string
  street?: string
  city?: string
  province?: string
  postalCode?: string
}
export interface GuestBuyer {
  email: string
  name?: string
  phone?: string
}

export class StorefrontApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(`Storefront API ${status}: ${code}`)
  }
}

// ── Request plumbing ─────────────────────────────────────────────────────────
function base(config: StorefrontConfig): string {
  return config.useConsumerHostPlane ? config.apiBaseUrl : `${config.apiBaseUrl}/public/display`
}

function keyHeaders(config: StorefrontConfig): Record<string, string> {
  return config.useConsumerHostPlane ? {} : { 'X-API-Key': config.publishableKey }
}

async function request<T>(
  config: StorefrontConfig,
  path: string,
  init: RequestInit & { cartToken?: string; orderToken?: string } = {},
): Promise<T> {
  const { cartToken, orderToken, ...fetchInit } = init
  const res = await fetch(`${base(config)}${path}`, {
    ...fetchInit,
    headers: {
      'content-type': 'application/json',
      ...keyHeaders(config),
      ...(cartToken ? { 'x-cart-token': cartToken } : {}),
      ...(orderToken ? { 'x-order-token': orderToken } : {}),
      ...fetchInit.headers,
    },
    // Commerce reads must never be cached; browse can be revalidated by the caller.
    cache: fetchInit.cache ?? 'no-store',
  })
  if (!res.ok) {
    let code = String(res.status)
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) code = body.error
    } catch {
      /* ignore */
    }
    throw new StorefrontApiError(res.status, code)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// On the key plane the storefront slug is in the path; on the host plane the
// worker resolves the shop from the Host, so the slug segment is dropped.
function shopPath(config: StorefrontConfig, tail: string): string {
  return config.useConsumerHostPlane ? tail : `/storefronts/${config.storefrontSlug}${tail}`
}

// ── Browse ───────────────────────────────────────────────────────────────────
export function listProducts(config: StorefrontConfig, params?: { limit?: number; cursor?: string }): Promise<ProductList> {
  const q = new URLSearchParams()
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.cursor) q.set('cursor', params.cursor)
  const qs = q.toString() ? `?${q}` : ''
  return request<ProductList>(config, shopPath(config, `/products${qs}`), { cache: 'no-store' })
}

export function getProduct(config: StorefrontConfig, productSlug: string): Promise<PublicProduct> {
  return request<PublicProduct>(config, shopPath(config, `/products/${encodeURIComponent(productSlug)}`), { cache: 'no-store' })
}

// ── Cart ─────────────────────────────────────────────────────────────────────
export function createCart(config: StorefrontConfig): Promise<{ cartId: string; cartToken: string }> {
  return request(config, shopPath(config, '/carts'), { method: 'POST', body: '{}' })
}
export function getCart(config: StorefrontConfig, cartId: string, cartToken: string): Promise<CartView> {
  return request<CartView>(config, `/carts/${cartId}`, { cartToken })
}
export function addItem(config: StorefrontConfig, cartId: string, cartToken: string, variantId: string, quantity: number): Promise<CartView> {
  return request<CartView>(config, `/carts/${cartId}/items`, { method: 'POST', body: JSON.stringify({ variantId, quantity }), cartToken })
}
export function updateItem(config: StorefrontConfig, cartId: string, cartToken: string, itemId: string, quantity: number): Promise<CartView> {
  return request<CartView>(config, `/carts/${cartId}/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }), cartToken })
}
export function removeItem(config: StorefrontConfig, cartId: string, cartToken: string, itemId: string): Promise<CartView> {
  return request<CartView>(config, `/carts/${cartId}/items/${itemId}`, { method: 'DELETE', cartToken })
}

// ── Shipping ─────────────────────────────────────────────────────────────────
export function quoteShipping(config: StorefrontConfig, cartId: string, cartToken: string, destination: Address): Promise<{ options: ShippingOption[] }> {
  return request(config, `/carts/${cartId}/shipping/quote`, { method: 'POST', body: JSON.stringify({ destination }), cartToken })
}
export function selectShipping(
  config: StorefrontConfig,
  cartId: string,
  cartToken: string,
  destination: Address,
  option: { courierCode: string; serviceCode: string; priceIdr: number },
): Promise<CartView> {
  return request<CartView>(config, `/carts/${cartId}/shipping/select`, {
    method: 'POST',
    body: JSON.stringify({ destination, ...option }),
    cartToken,
  })
}

// ── Checkout + order ─────────────────────────────────────────────────────────
export function checkout(config: StorefrontConfig, cartId: string, cartToken: string, buyer: GuestBuyer): Promise<CheckoutResult> {
  return request<CheckoutResult>(config, `/carts/${cartId}/checkout`, { method: 'POST', body: JSON.stringify({ buyer }), cartToken })
}
export function getOrder(config: StorefrontConfig, orderId: string, orderToken: string): Promise<OrderView> {
  return request<OrderView>(config, `/orders/${orderId}`, { orderToken })
}
