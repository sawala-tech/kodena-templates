import { notFound } from 'next/navigation'
import { loadConfig } from '@/lib/config'
import { getProduct, StorefrontApiError } from '@/lib/storefront-api'
import { formatMoney } from '@/lib/format'
import { AddToCart } from '@/components/AddToCart'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params
  const config = loadConfig()

  let product
  try {
    product = await getProduct(config, productSlug)
  } catch (e) {
    // A draft or another org's product returns 404 — render a clean not-found and
    // never leak the difference between "draft" and "does not exist".
    if (e instanceof StorefrontApiError && e.status === 404) notFound()
    throw e
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">No image</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img} src={img} alt="" className="aspect-square w-full rounded-lg border border-zinc-200 object-cover" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          {product.category && <p className="mt-1 text-sm text-zinc-500">{product.category}</p>}
        </div>
        {product.description && <p className="whitespace-pre-wrap text-sm text-zinc-600">{product.description}</p>}
        <AddToCart product={product} currency={config.currency} />
      </div>
    </div>
  )
}
