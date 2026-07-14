import Link from 'next/link'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COMPANY } from '@/lib/company/constants'
import { HomeSectionHeader } from '@/components/home/home-section-header'

/** Home teaser — studio tools placeholder (engineering calculators removed). */
export function ToolsSection() {
  return (
    <section id="tools" className="home-section home-section--compact home-section--muted">
      <div className="max-w-6xl mx-auto text-center">
        <HomeSectionHeader
          eyebrow="Tools"
          title="Studio tools"
          description={`Creative helpers for artists and learners from ${COMPANY.brandName} are coming soon.`}
          className="mb-6"
        />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--brand-navy)]/10 mb-4">
          <Palette className="h-6 w-6 text-[var(--brand-navy)]" />
        </div>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          New studio utilities will be published here. In the meantime, explore the shop and programmes.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/shop">
            <Button className="bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90">
              Visit shop
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="outline" className="text-slate-800 border-slate-300">
              Open tools
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
