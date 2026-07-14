import { SiteHeader } from '@/components/layout/site-header'
import { ShopCartProvider } from '@/lib/shop/cart-context'
import { ShopCartPanel } from '@/components/shop/shop-cart-panel'
import { CATALOG_SHELL } from '@/lib/ui/catalog-layout'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopCartProvider>
      <div className="min-h-screen bg-background shop-portal">
        <SiteHeader />
        <div className="border-b border-slate-200 bg-slate-50">
          <div className={`${CATALOG_SHELL} py-3 flex items-center justify-between gap-3`}>
            <p className="text-sm text-slate-700 font-medium">
              Order one item from product details, or add several to the cart for delivery or pickup in
              Kigali.
            </p>
            <ShopCartPanel />
          </div>
        </div>
        {children}
      </div>
    </ShopCartProvider>
  )
}
