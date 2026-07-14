import Image from 'next/image'
import { CalendarDays } from 'lucide-react'
import { getPublishedEvents } from '@/lib/platform/queries'
import { COMPANY } from '@/lib/company/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HomeSectionHeader } from '@/components/home/home-section-header'

export async function ArtEventsSection() {
  const events = (await getPublishedEvents()).slice(0, 6)

  return (
    <section id="art-events" className="home-section home-section--compact home-section--white">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="bg-[var(--brand-navy)] text-on-dark px-5 py-6 sm:px-8">
            <HomeSectionHeader
              eyebrow={COMPANY.brandName}
              title="Art Events"
              description="Studio sessions, exhibitions, and creative gatherings published by our team."
              align="left"
              className="mb-0 [&_.section-eyebrow]:text-[var(--brand-sky)] [&_.section-title]:text-white [&_p.text-slate-600]:text-white/80"
            />
          </div>

          {events.length === 0 ? (
            <div className="bg-slate-50 px-5 py-10 sm:px-8 text-center">
              <CalendarDays className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                Upcoming art events will appear here once an administrator publishes them under{' '}
                <span className="font-medium text-slate-800">Admin → Art Events & news</span>.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 sm:p-6 bg-white">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden border-slate-200">
                  {event.image_url ? (
                    <div className="relative h-40">
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <CardHeader className="pb-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {event.event_type || 'Art event'}
                    </p>
                    <CardTitle className="text-lg text-slate-900">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.description ? (
                      <p className="text-sm text-slate-600 line-clamp-3">{event.description}</p>
                    ) : null}
                    {event.start_date ? (
                      <p className="text-xs mt-3 text-slate-500">
                        {new Date(event.start_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {event.location ? ` · ${event.location}` : ''}
                      </p>
                    ) : null}
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
