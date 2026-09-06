import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShopProductCard } from '@/components/shop/shop-product-card'
import { getPublishedProducts } from '@/lib/platform/queries'
import { COMPANY } from '@/lib/company/constants'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { pickRandomSample } from '@/lib/utils/sample'

/** Primary public offering — shop always visible on the home page. */
export async function ShopTeaserSection() {
  const products = pickRandomSample(await getPublishedProducts(), 3)

  return (
    <section id="shop" className="home-section home-section--compact home-section--muted">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <HomeSectionHeader
            eyebrow="Shop"
            title="Art materials & works"
            description={`Original artworks and studio materials from ${COMPANY.brandName}, ready to order.`}
            align="left"
            className="mb-0"
          />
          <Link href="/shop">
            <Button className="bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90">
              Visit shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-8 text-center space-y-3">
              <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Products will appear here once published in the admin shop catalogue.
              </p>
              <Link href="/shop">
                <Button variant="outline" className="text-slate-800 border-slate-300">
                  Open shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ShopProductCard key={product.id} product={product} compact />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
