import { isConfigured, loadConfig } from '@/lib/config'
import { listProducts } from '@/lib/storefront-api'
import { ProductCard } from '@/components/ProductCard'

// SSR per request so runtime Kodena vars (and live catalog) are always current.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const config = loadConfig()

  if (!isConfigured(config)) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8">
        <h1 className="text-xl font-semibold">Storefront not configured</h1>
        <p className="mt-2 text-sm text-zinc-600">Set these environment variables and redeploy:</p>
        <ul className="mt-4 space-y-2 text-sm">
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5">NEXT_PUBLIC_STOREFRONT_SLUG</code> — your storefront slug</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5">KIOSNA_PUBLISHABLE_KEY</code> — a publishable <code>pk_…</code> key</li>
          <li><code className="rounded bg-zinc-100 px-1.5 py-0.5">API_BASE_URL</code> — e.g. <code>https://api.sawala.cloud</code></li>
        </ul>
      </div>
    )
  }

  let items: Awaited<ReturnType<typeof listProducts>>['items'] = []
  let error: string | null = null
  try {
    const page = await listProducts(config, { limit: 60 })
    items = page.items
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load products'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{config.siteName}</h1>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Couldn&apos;t load products: {error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500">
          No products published yet. Publish a product to this storefront from the Kiosna dashboard.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.slug} product={p} currency={config.currency} />)}
        </div>
      )}
    </div>
  )
}
