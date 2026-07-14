import Link from 'next/link'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { COMPANY } from '@/lib/company/constants'
import { cn } from '@/lib/utils'

/** Placeholder until Theos Art studio tools are published (electrical calculators removed). */
export function StudioToolsPlaceholder({
  className,
  showBrowseCta = true,
}: {
  className?: string
  showBrowseCta?: boolean
}) {
  return (
    <Card className={cn('border-slate-200 bg-white', className)}>
      <CardContent className="py-12 px-6 text-center space-y-4 max-w-xl mx-auto">
        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--brand-navy)]/10 flex items-center justify-center">
          <Palette className="h-6 w-6 text-[var(--brand-navy)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Studio tools</h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Creative helpers for artists and learners from {COMPANY.brandName} will appear here soon.
            Engineering calculators have been removed from this space.
          </p>
        </div>
        {showBrowseCta ? (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/shop">
              <Button className="bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90">
                Visit shop
              </Button>
            </Link>
            <Link href="/learning">
              <Button variant="outline" className="text-slate-800 border-slate-300">
                Browse programmes
              </Button>
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
