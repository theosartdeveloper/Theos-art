import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Check, ChevronDown, Clock, Palette } from 'lucide-react'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPublishedCourses } from '@/lib/platform/queries'
import { getCurrentUser } from '@/app/actions/auth-service'
import { COMPANY } from '@/lib/company/constants'
import { isFreeProgram } from '@/lib/enrollment/program-types'
import { CATALOG_GRID_COMFORT, CATALOG_SHELL } from '@/lib/ui/catalog-layout'

export const metadata: Metadata = {
  title: `Trainings | ${COMPANY.brandName}`,
  description:
    'Beginner visual art training at Theos Art — drawing, painting, and colour foundations. Learn. Create. Inspire.',
}

const HIGHLIGHTS = [
  'No previous experience required',
  'Hands-on practical training',
  'Guidance from experienced artists',
  'Quality art materials available',
  'Portfolio-building projects',
  'Certificate of completion (where applicable)',
]

const SKILLS = [
  'Line drawing',
  'Shapes & forms',
  'Shading',
  'Perspective',
  'Colour theory',
  'Composition',
  'Painting basics',
]

export default async function TrainingsPage() {
  const courses = await getPublishedCourses(undefined, { programType: 'training' })
  const user = await getCurrentUser()
  const isStudent = user?.role === 'student' || user?.role === 'registered'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <section className="text-on-dark bg-[var(--brand-navy)] py-10">
        <div className={CATALOG_SHELL}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-2">
            E-learning · Trainings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight text-white">
            Visual Art Training for Beginners
          </h1>
          <p className="text-[var(--brand-sky)] font-medium mb-2">Learn. Create. Inspire.</p>
          <p className="text-white/85 max-w-2xl text-sm sm:text-base leading-relaxed">
            Quality training and professional art materials for the next generation of creative artists.
          </p>
        </div>
      </section>

      <section className={`${CATALOG_SHELL} py-8 space-y-8`}>
        <nav className="text-sm text-slate-500">
          <Link href="/learning" className="hover:text-[var(--brand-navy)] transition-colors">
            E-learning
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Trainings</span>
        </nav>

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
            About this programme · highlights & skills
            <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
          </summary>
          <div className="grid gap-6 border-t border-slate-100 px-5 py-5 md:grid-cols-3">
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                Beginner visual art training for students, hobbyists, and first-time creators —
                foundations in drawing and painting, with materials from {COMPANY.brandName}.
              </p>
              <p>
                No prior experience needed. Lessons cover line, form, shading, perspective, colour
                theory, composition, and basic painting through guided projects.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Highlights
              </p>
              <ul className="space-y-2">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="h-3.5 w-3.5 text-[var(--brand-orange)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 inline-flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
                Skills practised
              </p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {SKILLS.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-700"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>

        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Open programmes</h2>
              <p className="text-sm text-slate-600 mt-1">
                Duration is set per course by our studio. Sign in only when you enroll.
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="sm">
                Art materials
              </Button>
            </Link>
          </div>

          {courses.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center space-y-2">
                <p className="text-slate-800 font-medium">Programmes opening soon</p>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Contact {COMPANY.email} or {COMPANY.phoneDisplay} to register interest.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={CATALOG_GRID_COMFORT}>
              {courses.map((course) => {
                const enrollPath = `/student/courses/${course.id}/enroll`
                const enrollHref = isStudent
                  ? enrollPath
                  : `/auth/login?redirect=${encodeURIComponent(enrollPath)}`
                const free = isFreeProgram(course.pricing)
                return (
                  <Card key={course.id} className="overflow-hidden border-slate-200 flex flex-col">
                    {course.thumbnail ? (
                      <div className="relative h-40">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-slate-100" />
                    )}
                    <CardHeader className="pb-2">
                      {course.duration ? (
                        <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </p>
                      ) : null}
                      <CardTitle className="text-lg text-slate-900 leading-snug">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <p className="text-sm text-slate-600 line-clamp-2 flex-1">{course.description}</p>
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
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
