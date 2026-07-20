import Link from 'next/link'
import type { PublicProduct } from '@/lib/storefront-api'
import { formatMoney } from '@/lib/format'

// A product card for the grid. Price shown is the cheapest variant; stock is the
// sum across variants (0 → out of stock badge).
export function ProductCard({ product, currency }: { product: PublicProduct; currency: string }) {
  const prices = product.variants.map((v) => v.priceIdr)
  const from = prices.length ? Math.min(...prices) : 0
  const inStock = product.variants.some((v) => v.available > 0)
  const image = product.images[0]

  return (
    <Link href={`/products/${product.slug}`} className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-zinc-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.title} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate font-medium">{product.title}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm text-zinc-900">{formatMoney(from, currency)}</span>
          {!inStock && <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">Out of stock</span>}
        </div>
      </div>
    </Link>
  )
}
