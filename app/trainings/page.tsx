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
  const isLecturer = user?.role === 'lecturer' || user?.role === 'mentor'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="text-on-dark bg-[var(--brand-navy)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-2">
            E-learning
          </p>
          <h1 className="text-4xl font-bold mb-2 text-white">Trainings</h1>
          <p className="text-white/85 max-w-2xl">
            Studio workshops and creative training programmes from {COMPANY.brandName}. Students enroll
            and learn in the student portal; instructors deliver through the lecturer portal after admin
            publishes each programme.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/learning" className="text-[var(--brand-navy)] underline font-medium">
            E-learning hub
          </Link>
          <span className="text-slate-400">·</span>
          {isStudent ? (
            <Link href="/student/courses?track=training" className="text-[var(--brand-navy)] underline font-medium">
              My student trainings
            </Link>
          ) : (
            <Link
              href="/auth/login?role=student&redirect=%2Fstudent%2Fcourses%3Ftrack%3Dtraining"
              className="text-[var(--brand-navy)] underline font-medium"
            >
              Student login
            </Link>
          )}
          <span className="text-slate-400">·</span>
          {isLecturer ? (
            <Link href="/lecturer/dashboard" className="text-[var(--brand-navy)] underline font-medium">
              Lecturer portal
            </Link>
          ) : (
            <Link
              href="/auth/login?role=lecturer&redirect=%2Flecturer%2Fdashboard"
              className="text-[var(--brand-navy)] underline font-medium"
            >
              Instructor login
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-600 space-y-2">
              <p>No training programmes published yet.</p>
              <p className="text-sm">
                Admin creates them under Programs (type Training / Studio programme / Workshop), assigns
                an instructor, then publishes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const enrollPath = `/student/courses/${course.id}/enroll`
              const enrollHref = isStudent
                ? enrollPath
                : `/auth/login?role=student&redirect=${encodeURIComponent(enrollPath)}`
              const free = isFreeProgram(course.pricing)
              return (
                <Card key={course.id} className="overflow-hidden border-slate-200">
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
                  ) : null}
                  <CardHeader>
                    <CardTitle className="text-slate-900">{course.title}</CardTitle>
                    {course.duration ? (
                      <p className="text-xs text-slate-600">{course.duration}</p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                          {isStudent ? 'Enroll' : 'Student login'}
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
