import Image from 'next/image'
import { Megaphone } from 'lucide-react'
import { getPublishedAnnouncements } from '@/lib/platform/queries'
import { COMPANY } from '@/lib/company/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HomeSectionHeader } from '@/components/home/home-section-header'

export async function StudioAnnouncementsSection() {
  const announcements = await getPublishedAnnouncements(6)

  return (
    <section id="announcements" className="home-section home-section--compact home-section--muted">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="bg-[var(--brand-navy)] text-on-dark px-5 py-6 sm:px-8">
            <HomeSectionHeader
              eyebrow={COMPANY.brandName}
              title="Announcements"
              description="News and studio updates from our team."
              align="left"
              className="mb-0 [&_.section-eyebrow]:text-[var(--brand-sky)] [&_.section-title]:text-white [&_p.text-slate-600]:text-white/80"
            />
          </div>

          {announcements.length === 0 ? (
            <div className="bg-slate-50 px-5 py-10 sm:px-8 text-center">
              <Megaphone className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                Studio announcements will appear here once published by an administrator.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 p-5 sm:p-6">
              {announcements.map((item) => (
                <Card key={item.id} className="overflow-hidden border-slate-200">
                  {item.image_url ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <CardHeader className="pb-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {item.type ?? 'news'}
                    </p>
                    <CardTitle className="text-slate-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{item.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
