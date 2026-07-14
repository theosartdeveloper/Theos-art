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

      <section className="text-on-dark bg-[var(--brand-navy)] py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-2">
            E-learning · Trainings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight text-white">
            Visual Art Training for Beginners
          </h1>
          <p className="text-[var(--brand-sky)] font-medium mb-2">Learn. Create. Inspire.</p>
          <p className="text-white/85 max-w-xl text-sm sm:text-base leading-relaxed">
            Quality training and professional art materials for the next generation of creative artists.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <nav className="text-sm text-slate-500">
          <Link href="/learning" className="hover:text-[var(--brand-navy)] transition-colors">
            E-learning
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Trainings</span>
        </nav>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-8 items-start">
          <div className="space-y-5 min-w-0">
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
              <div className="grid sm:grid-cols-2 gap-5">
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
                        <p className="text-sm text-slate-600 line-clamp-2 flex-1">
                          {course.description}
                        </p>
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

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed">
                Beginner visual art training for students, hobbyists, and first-time creators —
                foundations in drawing and painting, with materials from {COMPANY.brandName}.
              </p>

              <details className="group mt-4 border-t border-slate-100 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  About the programme
                  <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    No prior experience needed. Lessons cover line, form, shading, perspective, colour
                    theory, composition, and basic painting through guided projects.
                  </p>
                  <p>
                    Trainees practise with quality materials and leave with completed artworks plus
                    confidence to continue or advance.
                  </p>
                </div>
              </details>

              <details className="group mt-2 border-t border-slate-100 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  Course highlights
                  <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 space-y-2">
                  {HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="h-3.5 w-3.5 text-[var(--brand-orange)] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </details>

              <details className="group mt-2 border-t border-slate-100 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-[var(--brand-orange)]" />
                    Skills practised
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {SKILLS.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-700"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </aside>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
