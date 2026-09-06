'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/platform'
import {
  formatProductAvailabilityLabel,
  formatProductUnitLabel,
  getProductAvailability,
  productAvailabilityClass,
} from '@/lib/platform/products'

function sellingPrice(product: Product): { current: number; original: number | null } {
  const current = product.discount ? product.price - product.discount : product.price
  return {
    current,
    original: product.discount ? product.price : null,
  }
}

export function ShopProductCard({
  product,
  compact = false,
}: {
  product: Product
  compact?: boolean
}) {
  const image = product.images?.[0]
  const { current, original } = sellingPrice(product)
  const availability = getProductAvailability(product.stock, product.low_stock_threshold)
  const availabilityLabel = formatProductAvailabilityLabel(availability)
  const description = String(product.description || '').trim()
  const href = `/shop/${product.id}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={href} className="relative block no-underline hover:no-underline">
        <div className={cn('relative w-full overflow-hidden bg-slate-100', compact ? 'aspect-[4/3]' : 'aspect-[4/3]')}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
              <Package className="h-8 w-8 opacity-60" />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
          <span
            className={cn(
              'absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
              productAvailabilityClass(availability)
            )}
          >
            {availabilityLabel}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {product.category?.name ?? 'Shop'}
        </p>
        <Link href={href} className="mt-1 no-underline hover:no-underline">
          <h3 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-[var(--brand-navy)]">
            {product.name}
          </h3>
        </Link>
        {description ? (
          <p className={cn('mt-2 text-sm leading-relaxed text-slate-600', compact ? 'line-clamp-2' : 'line-clamp-3')}>
            {description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">No description yet.</p>
        )}

        <div className="mt-auto pt-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-[var(--brand-navy)]">{current.toLocaleString()} RWF</p>
              {original != null ? (
                <p className="text-xs text-slate-400 line-through">{original.toLocaleString()} RWF</p>
              ) : null}
              <p className="text-xs text-slate-500">
                {formatProductUnitLabel(product.sale_unit || 'piece', product.pack_quantity || 1)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href={href}>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                Details
              </Button>
            </Link>
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={current}
              stock={product.stock}
              image={image}
              size="sm"
              className="w-full bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
