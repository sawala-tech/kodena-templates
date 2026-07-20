// All storefront configuration comes from environment variables so a fork can be
// re-pointed at any storefront with zero code changes. Unlike the CMS templates,
// loadConfig() does NOT throw when the shop isn't configured yet — an empty,
// unconfigured deploy is a feature (it renders a "not configured" placeholder),
// which also lets the Kodena deploy path be proven before any live API call.

export interface StorefrontConfig {
  /** Gateway base, e.g. https://api.sawala.cloud (server-side). */
  apiBaseUrl: string
  /** The shop's storefront slug. */
  storefrontSlug: string
  /** Publishable key (pk_…). Server-side by default. NEVER a secret sk_ key. */
  publishableKey: string
  /** When true, call the consumer-host plane (no X-API-Key, tenant by Host). */
  useConsumerHostPlane: boolean
  /** Shop name for chrome/branding. */
  siteName: string
  /** ISO currency, default IDR. */
  currency: string
}

function optional(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

let cached: StorefrontConfig | undefined

export function loadConfig(): StorefrontConfig {
  if (cached) return cached
  cached = {
    apiBaseUrl: optional('API_BASE_URL') ?? 'https://api.sawala.cloud',
    storefrontSlug: optional('NEXT_PUBLIC_STOREFRONT_SLUG') ?? '',
    publishableKey: optional('KIOSNA_PUBLISHABLE_KEY') ?? optional('NEXT_PUBLIC_PUBLISHABLE_KEY') ?? '',
    useConsumerHostPlane: optional('API_USE_HOST_PLANE') === 'true',
    siteName: optional('NEXT_PUBLIC_SITE_NAME') ?? 'Storefront',
    currency: optional('NEXT_PUBLIC_CURRENCY') ?? 'IDR',
  }
  return cached
}

// The shop is "configured" once it has a slug and — on the key plane — a key.
export function isConfigured(config: StorefrontConfig = loadConfig()): boolean {
  if (!config.storefrontSlug) return false
  if (config.useConsumerHostPlane) return true
  return Boolean(config.publishableKey)
}
