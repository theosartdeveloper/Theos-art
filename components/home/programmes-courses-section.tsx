import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPublishedServices } from '@/lib/platform/queries'
import { COMPANY } from '@/lib/company/constants'
import { HomeSectionHeader } from '@/components/home/home-section-header'

export async function ProgrammesCoursesSection() {
  const services = (await getPublishedServices()).slice(0, 6)

  if (services.length === 0) {
    return (
      <section id="programmes" className="home-section home-section--compact home-section--muted">
        <div className="max-w-6xl mx-auto text-center">
          <HomeSectionHeader
            eyebrow="Programmes"
            title="Workshops & creative learning"
            description={`${COMPANY.brandName} services and workshops will appear here once published by an administrator.`}
            className="mb-6"
          />
          <Link href="/about">
            <Button className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90">
              About {COMPANY.brandName}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section id="programmes" className="home-section home-section--compact home-section--muted">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <HomeSectionHeader
            eyebrow="Programmes"
            title="Workshops & creative learning"
            description={`Services and creative offerings from ${COMPANY.brandName} — curated by our studio team.`}
            align="left"
            className="mb-0"
          />
          <Link
            href="/about"
            className="shrink-0 text-sm font-medium text-[var(--brand-navy)] underline underline-offset-2"
          >
            Learn more
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const href =
              service.portal && service.portal.trim()
                ? service.portal.startsWith('/')
                  ? service.portal
                  : `/${service.portal}`
                : '/shop'
            return (
              <Card key={service.id} className="overflow-hidden border-slate-200 bg-white flex flex-col">
                {service.image_url ? (
                  <div className="relative h-36 bg-slate-100">
                    <Image
                      src={service.image_url}
                      alt={service.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-slate-100 flex items-center justify-center">
                    <Palette className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  {service.category ? (
                    <Badge variant="outline" className="w-fit text-slate-700 border-slate-300 text-xs mb-1">
                      {service.category}
                    </Badge>
                  ) : null}
                  <CardTitle className="text-base text-slate-900 leading-snug">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-3 pt-0">
                  <p className="text-sm text-slate-600 line-clamp-3 flex-1">{service.description}</p>
                  <Link href={href}>
                    <Button
                      size="sm"
                      className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90"
                    >
                      Learn more
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
