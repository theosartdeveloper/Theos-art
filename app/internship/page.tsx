import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPublishedCourses, getPublishedInternships } from '@/lib/platform/queries'
import { getCurrentUser } from '@/app/actions/auth-service'
import { COMPANY } from '@/lib/company/constants'
import { isFreeProgram } from '@/lib/enrollment/program-types'
import { CATALOG_GRID_COMFORT, CATALOG_SHELL } from '@/lib/ui/catalog-layout'

export default async function InternshipPage() {
  const [internshipPrograms, legacyInternships] = await Promise.all([
    getPublishedCourses(undefined, { programType: 'internship' }),
    getPublishedInternships(),
  ])
  const user = await getCurrentUser()
  const isStudent = user?.role === 'student' || user?.role === 'registered'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="text-on-dark bg-[var(--brand-navy)] py-12">
        <div className={CATALOG_SHELL}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-3">
            E-learning
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-white">Internship</h1>
          <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
            Creative residency and studio internship programmes from {COMPANY.brandName} — learn beside
            practising artists in a professional studio environment.
          </p>
        </div>
      </section>

      <section className={`${CATALOG_SHELL} py-10 space-y-8`}>
        <nav className="text-sm text-slate-500">
          <Link href="/learning" className="hover:text-[var(--brand-navy)] transition-colors">
            E-learning
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Internship</span>
        </nav>

        {internshipPrograms.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center text-slate-600">
              Internship programmes will appear here when available.
            </CardContent>
          </Card>
        ) : (
          <div className={CATALOG_GRID_COMFORT}>
            {internshipPrograms.map((item) => {
              const enrollPath = `/student/courses/${item.id}/enroll`
              const enrollHref = isStudent
                ? enrollPath
                : `/auth/login?redirect=${encodeURIComponent(enrollPath)}`
              const free = isFreeProgram(item.pricing)
              return (
                <Card key={item.id} className="border-slate-200 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-slate-900">{item.title}</CardTitle>
                    {item.duration ? (
                      <p className="text-xs uppercase tracking-wide text-slate-500">{item.duration}</p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">{item.description}</p>
                    <p className="text-sm font-semibold text-[var(--brand-navy)]">
                      {free ? 'Free' : `${Number(item.pricing ?? 0).toLocaleString()} RWF`}
                    </p>
                    <Link href={enrollHref}>
                      <Button className="bg-[var(--brand-navy)] text-white">Enroll</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {legacyInternships.length > 0 ? (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-slate-900">More opportunities</h2>
            <div className={CATALOG_GRID_COMFORT}>
              {legacyInternships.map((item) => {
                const enrollHref = isStudent
                  ? '/student/courses?track=internship'
                  : `/auth/login?redirect=${encodeURIComponent('/student/courses?track=internship')}`
                return (
                  <Card key={item.id} className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-slate-900">{item.title}</CardTitle>
                      {item.deadline ? (
                        <p className="text-xs text-slate-500">
                          Deadline: {new Date(item.deadline).toLocaleDateString()}
                        </p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      <Link href={enrollHref}>
                        <Button variant="outline">Enroll</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  )
}
