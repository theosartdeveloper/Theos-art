import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPublishedServices } from '@/lib/platform/queries'
import { COMPANY, DEFAULT_STUDIO_SERVICES } from '@/lib/company/constants'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { pickRandomSample } from '@/lib/utils/sample'

type TeaserService = {
  id: string
  title: string
  description: string
  category?: string | null
  image_url?: string | null
  portal?: string | null
}

/** Home teaser — up to 3 shuffled studio services from the database (with defaults if empty). */
export async function StudioServicesSection() {
  const fromDb = await getPublishedServices()
  const services: TeaserService[] =
    fromDb.length > 0
      ? pickRandomSample(fromDb, 3)
      : pickRandomSample(
          DEFAULT_STUDIO_SERVICES.map((s, i) => ({
            id: `default-service-${i}`,
            title: s.title,
            description: s.description,
            category: s.category,
            image_url: null,
            portal: '/about',
          })),
          3
        )

  return (
    <section id="services" className="home-section home-section--compact home-section--muted">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <HomeSectionHeader
            eyebrow="Services"
            title="Studio services"
            description={`Commission work, private sessions, and studio services from ${COMPANY.brandName}.`}
            align="left"
            className="mb-0"
          />
          <Link href="/about">
            <Button variant="outline" className="border-slate-300 text-slate-800">
              About the studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const href =
              service.portal && service.portal.trim()
                ? service.portal.startsWith('/')
                  ? service.portal
                  : `/${service.portal}`
                : '/about'
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
