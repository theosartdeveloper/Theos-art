import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { StudioToolsPlaceholder } from '@/components/tools/studio-tools-placeholder'

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <StudioToolsPlaceholder />
      </div>
      <SiteFooter />
    </main>
  )
}
