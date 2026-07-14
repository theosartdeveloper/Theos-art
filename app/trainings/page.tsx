import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPublishedCourses } from '@/lib/platform/queries'
import { getCurrentUser } from '@/app/actions/auth-service'
import { COMPANY } from '@/lib/company/constants'
import { isFreeProgram } from '@/lib/enrollment/program-types'

export default async function TrainingsPage() {
  const courses = await getPublishedCourses(undefined, { programType: 'training' })
  const user = await getCurrentUser()
  const isStudent = user?.role === 'student' || user?.role === 'registered'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="text-on-dark bg-[var(--brand-navy)] py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-3">
            E-learning
          </p>
          <h1 className="text-4xl font-bold mb-3 tracking-tight text-white">Trainings</h1>
          <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
            Studio workshops and creative training programmes from {COMPANY.brandName} — build skill,
            technique, and confidence through guided practice.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <nav className="text-sm text-slate-500">
          <Link href="/learning" className="hover:text-[var(--brand-navy)] transition-colors">
            E-learning
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Trainings</span>
        </nav>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center text-slate-600">
              Training programmes will appear here when available.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrollPath = `/student/courses/${course.id}/enroll`
              const enrollHref = isStudent
                ? enrollPath
                : `/auth/login?redirect=${encodeURIComponent(enrollPath)}`
              const free = isFreeProgram(course.pricing)
              return (
                <Card key={course.id} className="overflow-hidden border-slate-200">
                  {course.thumbnail ? (
                    <div className="relative h-44">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-slate-100" />
                  )}
                  <CardHeader>
                    {course.duration ? (
                      <p className="text-xs uppercase tracking-wide text-slate-500">{course.duration}</p>
                    ) : null}
                    <CardTitle className="text-slate-900">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-3">{course.description}</p>
                    <p className="text-sm font-semibold text-[var(--brand-navy)]">
                      {free ? 'Free' : `${Number(course.pricing ?? 0).toLocaleString()} RWF`}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/learning/${course.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Details
                        </Button>
                      </Link>
                      <Link href={enrollHref}>
                        <Button size="sm" className="w-full bg-[var(--brand-navy)] text-white">
                          Enroll
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}
