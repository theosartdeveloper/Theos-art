'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ShopProductCard } from '@/components/shop/shop-product-card'
import { CATALOG_GRID, CATALOG_SHELL } from '@/lib/ui/catalog-layout'
import { cn } from '@/lib/utils'
import type { Category, Product } from '@/types/platform'

function CategoryButton({
  active,
  href,
  children,
}: {
  active: boolean
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href}>
      <Button
        size="sm"
        variant="outline"
        className={cn(
          'font-medium shadow-sm',
          active ? 'shop-category-active' : 'shop-category-inactive'
        )}
      >
        {children}
      </Button>
    </Link>
  )
}

export function ShopCatalog({
  categories,
  products,
  activeCategory,
  searchQuery,
}: {
  categories: Category[]
  products: Product[]
  activeCategory?: string
  searchQuery?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(searchQuery ?? '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (query) params.set('q', query)
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <section className={cn(CATALOG_SHELL, 'py-8')}>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9 border-slate-300 text-slate-900 placeholder:text-slate-500"
          />
        </div>
        <Button type="submit" className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90">
          Search
        </Button>
      </form>

      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Categories</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        <CategoryButton active={!activeCategory} href="/shop">
          All
        </CategoryButton>
        {categories.map((cat) => (
          <CategoryButton
            key={cat.id}
            active={activeCategory === cat.slug}
            href={`/shop?category=${cat.slug}`}
          >
            {cat.name}
          </CategoryButton>
        ))}
      </div>

      {products.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-10 text-center text-slate-600">
            No products found. Administrators can add products and categories from the Admin Portal.
          </CardContent>
        </Card>
      ) : (
        <div className={CATALOG_GRID}>
          {products.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
