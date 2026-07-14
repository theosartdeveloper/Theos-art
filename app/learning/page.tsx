import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCategories, getPublishedCourses } from '@/lib/platform/queries'
import { getCurrentUser } from '@/app/actions/auth-service'
import { COMPANY } from '@/lib/company/constants'
import { isFreeProgram, type ProgramType } from '@/lib/enrollment/program-types'
import { GraduationCap, Briefcase } from 'lucide-react'

function enrollHref(courseId: string, isStudent: boolean) {
  const path = `/student/courses/${courseId}/enroll`
  if (isStudent) return path
  return `/auth/login?redirect=${encodeURIComponent(path)}`
}

export default async function LearningHubPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; category?: string }>
}) {
  const params = await searchParams
  const moduleParam = params.module
  const user = await getCurrentUser()
  const isStudent = user?.role === 'student' || user?.role === 'registered'

  if (!moduleParam) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <section className="text-on-dark bg-[var(--brand-navy)] py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-3">
              {COMPANY.brandName}
            </p>
            <h1 className="text-4xl font-bold mb-3 tracking-tight">E-learning</h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              Structured creative programmes from our studio — workshops, trainings, and internship
              pathways designed for aspiring and practising artists.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-navy)]/5 mb-5">
                <GraduationCap className="h-5 w-5 text-[var(--brand-navy)]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Trainings</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Hands-on workshops and studio programmes covering technique, materials, and creative
                practice — from foundations to advanced projects.
              </p>
              <Link href="/trainings">
                <Button className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-deep)]">
                  View trainings
                </Button>
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-navy)]/5 mb-5">
                <Briefcase className="h-5 w-5 text-[var(--brand-navy)]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Internship</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Immersive studio programmes for emerging artists — practical experience, mentorship,
                and real creative projects in a professional setting.
              </p>
              <Link href="/internship">
                <Button className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-deep)]">
                  View internships
                </Button>
              </Link>
            </article>
          </div>
        </section>
        <SiteFooter />
      </main>
    )
  }

  const programType: ProgramType = moduleParam === 'internship' ? 'internship' : 'training'
  const categories = await getCategories('learning')
  const courses = await getPublishedCourses(params.category, { programType })
  const catalogHref = programType === 'internship' ? '/internship' : '/trainings'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="text-on-dark bg-[var(--brand-navy)] py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-3">
            E-learning
          </p>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            {programType === 'internship' ? 'Internship' : 'Trainings'}
          </h1>
          <p className="text-white/85 max-w-2xl leading-relaxed">
            {programType === 'internship'
              ? 'Studio internship programmes for emerging artists.'
              : 'Workshops and creative training programmes from our studio.'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-wrap gap-2">
          <Link href="/learning">
            <Button variant="outline" size="sm">
              All programmes
            </Button>
          </Link>
          <Link href="/trainings">
            <Button variant={programType === 'training' ? 'default' : 'outline'} size="sm">
              Trainings
            </Button>
          </Link>
          <Link href="/internship">
            <Button variant={programType === 'internship' ? 'default' : 'outline'} size="sm">
              Internship
            </Button>
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link href={catalogHref}>
              <Button size="sm" variant={!params.category ? 'secondary' : 'outline'}>
                All
              </Button>
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/learning?module=${programType}&category=${cat.slug}`}
              >
                <Button size="sm" variant={params.category === cat.slug ? 'secondary' : 'outline'}>
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        ) : null}

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-600">
              New programmes will appear here when published.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
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
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {course.category?.name ??
                        (programType === 'internship' ? 'Internship' : 'Training')}
                    </p>
                    <CardTitle className="text-slate-900">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">{course.description}</p>
                    <p className="text-sm font-semibold text-[var(--brand-navy)] mb-4">
                      {free ? 'Free' : `${Number(course.pricing ?? 0).toLocaleString()} RWF`}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/learning/${course.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Details
                        </Button>
                      </Link>
                      <Link href={enrollHref(course.id, isStudent)}>
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
