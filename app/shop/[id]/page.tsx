import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Package } from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { BuyNowPanel } from '@/components/shop/buy-now-panel'
import { ShopProductCard } from '@/components/shop/shop-product-card'
import { getProductById, getPublishedProducts } from '@/lib/platform/queries'
import {
  formatProductAvailabilityLabel,
  formatProductUnitLabel,
  getProductAvailability,
  productAvailabilityClass,
} from '@/lib/platform/products'
import { cn } from '@/lib/utils'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const related = (await getPublishedProducts(product.category?.slug))
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  const finalPrice = product.discount ? product.price - product.discount : product.price
  const specs = Object.entries(product.specifications ?? {}).filter(
    ([key]) => key !== 'sale_unit' && key !== 'pack_quantity'
  )
  const images = product.images?.length ? product.images : []
  const availability = getProductAvailability(product.stock, product.low_stock_threshold)
  const availabilityLabel = formatProductAvailabilityLabel(availability)

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            {images[0] ? (
              <Image src={images[0]} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <Package className="h-12 w-12 opacity-60" />
                <span className="font-medium">No image available</span>
              </div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.slice(0, 4).map((img, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-slate-200">
                  <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 mb-2">
            {product.category?.name}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide mb-4',
              productAvailabilityClass(availability)
            )}
          >
            {availabilityLabel}
          </span>
          <p className="text-slate-700 mb-6 leading-relaxed">
            {product.description?.trim() || 'No description has been added for this product yet.'}
          </p>
          <div className="text-3xl font-bold text-[var(--brand-navy)] mb-2">
            {finalPrice.toLocaleString()} RWF
          </div>
          {product.discount ? (
            <p className="text-sm text-slate-500 line-through mb-2">{product.price.toLocaleString()} RWF</p>
          ) : null}
          <p className="text-sm text-slate-600 mb-6">
            {formatProductUnitLabel(product.sale_unit || 'piece', product.pack_quantity || 1)}
            {product.sku ? ` · SKU ${product.sku}` : ''}
          </p>
          <div className="flex flex-wrap gap-3">
            <BuyNowPanel
              productId={product.id}
              name={product.name}
              price={finalPrice}
              stock={product.stock}
              image={images[0]}
              saleUnit={product.sale_unit || 'piece'}
              packQuantity={product.pack_quantity || 1}
            />
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={finalPrice}
              stock={product.stock}
              image={images[0]}
              className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90"
            />
            <Link href="/shop">
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-800 hover:bg-slate-50">
                Back to shop
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Use <span className="font-medium text-slate-800">Order now</span> to buy this item alone, or add to
            cart to order several products together.
          </p>
          {specs.length > 0 && (
            <Card className="mt-8 border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">{key}</span>
                    <span className="text-slate-600">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Products</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((item) => (
              <ShopProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>
      )}
      <SiteFooter />
    </>
  )
}
