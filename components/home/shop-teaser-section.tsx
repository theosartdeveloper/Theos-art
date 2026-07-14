import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
            {products.map((product) => {
              const image = product.images?.[0]
              const finalPrice =
                product.discount != null ? product.price - product.discount : product.price
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="home-tile-link no-underline hover:no-underline"
                >
                  <Card className="h-full border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="relative h-40 bg-slate-100">
                      {image ? (
                        <Image src={image} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="font-semibold text-slate-900 text-sm line-clamp-2">{product.name}</p>
                      <p className="text-sm text-[var(--brand-navy)] font-medium mt-1">
                        {Number(finalPrice).toLocaleString()} RWF
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
