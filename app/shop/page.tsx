import { SiteFooter } from '@/components/layout/site-footer'
import { ShopCatalog } from '@/components/shop/shop-catalog'
import { getCategories, getPublishedProducts } from '@/lib/platform/queries'
import { CATALOG_SHELL } from '@/lib/ui/catalog-layout'

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams
  const categories = await getCategories('shop')
  const products = await getPublishedProducts(params.category, params.q)

  return (
    <>
      <section className="text-on-dark bg-[var(--brand-navy)] py-10">
        <div className={CATALOG_SHELL}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Products</h1>
          <p className="text-white/90 max-w-2xl">
            Browse artworks and materials. Open a product to order it directly, or use the cart for several
            items — checkout with MTN MoMo.
          </p>
        </div>
      </section>
      <ShopCatalog
        categories={categories}
        products={products}
        activeCategory={params.category}
        searchQuery={params.q}
      />
      <SiteFooter />
    </>
  )
}
