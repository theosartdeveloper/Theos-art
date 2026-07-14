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
import { BookOpen, GraduationCap, Briefcase } from 'lucide-react'

export default async function LearningHubPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; category?: string }>
}) {
  const params = await searchParams
  const moduleParam = params.module
  const user = await getCurrentUser()
  const isStudent = user?.role === 'student' || user?.role === 'registered'
  const isLecturer = user?.role === 'lecturer' || user?.role === 'mentor'

  // Hub view when no module filter — catalogues live on /trainings and /internship
  if (!moduleParam) {
    return (
      <main className="min-h-screen bg-background">
        <SiteHeader />
        <section className="text-on-dark bg-[var(--brand-navy)] py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-2">
              {COMPANY.brandName}
            </p>
            <h1 className="text-4xl font-bold mb-2">E-learning</h1>
            <p className="text-white/85 max-w-2xl">
              Trainings and internship programmes delivered online and in-studio. Students enroll and
              learn in their portal; instructors manage lessons from the lecturer portal. Admin
              publishes programmes under Programs.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10 space-y-10">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <GraduationCap className="h-5 w-5 text-[var(--brand-orange)]" />
                  Trainings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Workshops and studio programmes. Students enroll; lecturers deliver lessons after
                  admin publishes the programme.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/trainings">
                    <Button className="bg-[var(--brand-navy)] text-white">Browse trainings</Button>
                  </Link>
                  <Link
                    href={
                      isStudent
                        ? '/student/courses?track=training'
                        : '/auth/login?role=student&redirect=%2Fstudent%2Fcourses%3Ftrack%3Dtraining'
                    }
                  >
                    <Button variant="outline">Student portal</Button>
                  </Link>
                  <Link
                    href={
                      isLecturer
                        ? '/lecturer/dashboard'
                        : '/auth/login?role=lecturer&redirect=%2Flecturer%2Fdashboard'
                    }
                  >
                    <Button variant="outline">Instructor login</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Briefcase className="h-5 w-5 text-[var(--brand-orange)]" />
                  Internship
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Studio internship paths. Students apply and enroll; instructors track admitted
                  interns from the lecturer portal.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href="/internship">
                    <Button className="bg-[var(--brand-navy)] text-white">Browse internships</Button>
                  </Link>
                  <Link
                    href={
                      isStudent
                        ? '/student/courses?track=internship'
                        : '/auth/login?role=student&redirect=%2Fstudent%2Fcourses%3Ftrack%3Dinternship'
                    }
                  >
                    <Button variant="outline">Student portal</Button>
                  </Link>
                  <Link
                    href={
                      isLecturer
                        ? '/lecturer/dashboard'
                        : '/auth/login?role=lecturer&redirect=%2Flecturer%2Fdashboard'
                    }
                  >
                    <Button variant="outline">Instructor login</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex gap-3 items-start">
                <BookOpen className="h-5 w-5 text-[var(--brand-navy)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Admin publishes; accounts deliver</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Create programmes in Admin → Programs (type Training or Internship), assign an
                    instructor, add lessons, then publish. Students use student accounts; lecturers use
                    approved instructor accounts.
                  </p>
                </div>
              </div>
              <Link href="/auth/login?role=admin&redirect=%2Fadmin%2Fdashboard%2Fcourses">
                <Button variant="outline" className="shrink-0">
                  Admin login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
        <SiteFooter />
      </main>
    )
  }

  const programType: ProgramType =
    moduleParam === 'internship' ? 'internship' : 'training'
  const categories = await getCategories('learning')
  const courses = await getPublishedCourses(params.category, { programType })
  const catalogHref = programType === 'internship' ? '/internship' : '/trainings'
  const studentTrack = programType === 'internship' ? 'internship' : 'training'

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="text-on-dark bg-[var(--brand-navy)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-2">
            E-learning
          </p>
          <h1 className="text-4xl font-bold mb-2">
            {programType === 'internship' ? 'Internship programmes' : 'Trainings'}
          </h1>
          <p className="text-white/85 max-w-2xl">
            {programType === 'internship'
              ? 'Studio internship programmes published by admin for student enrollment.'
              : 'Training programmes and workshops published by admin for student enrollment.'}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Link href="/learning">
            <Button variant="outline" size="sm">
              E-learning hub
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

        <div className="flex flex-wrap gap-2">
          <Link href={catalogHref}>
            <Button size="sm" variant={!params.category ? 'secondary' : 'outline'}>
              All categories
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

        <p className="text-sm text-slate-600">
          {isStudent ? (
            <>
              Signed in as student — continue in your{' '}
              <Link
                href={`/student/courses?track=${studentTrack}`}
                className="text-[var(--brand-navy)] font-medium underline"
              >
                portal
              </Link>
              .
            </>
          ) : isLecturer ? (
            <>
              Signed in as instructor — manage delivery in the{' '}
              <Link href="/lecturer/dashboard" className="text-[var(--brand-navy)] font-medium underline">
                lecturer portal
              </Link>
              .
            </>
          ) : (
            <>
              <Link
                href={`/auth/login?role=student&redirect=${encodeURIComponent(`/student/courses?track=${studentTrack}`)}`}
                className="text-[var(--brand-navy)] font-medium underline"
              >
                Student login
              </Link>
              {' · '}
              <Link
                href="/auth/login?role=lecturer&redirect=%2Flecturer%2Fdashboard"
                className="text-[var(--brand-navy)] font-medium underline"
              >
                Instructor login
              </Link>
            </>
          )}
        </p>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <p className="text-muted-foreground">
                No {programType === 'internship' ? 'internship' : 'training'} programmes published yet.
                Admin can create them under Programs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const studentEnroll = `/student/courses/${course.id}/enroll`
              const enrollHref = isStudent
                ? studentEnroll
                : `/auth/login?role=student&redirect=${encodeURIComponent(studentEnroll)}`
              const free = isFreeProgram(course.pricing)
              return (
                <Card key={course.id} className="overflow-hidden">
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
                    <div className="h-44 bg-[var(--brand-navy)]/5 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
                      {course.title}
                    </div>
                  )}
                  <CardHeader>
                    <p className="text-xs text-muted-foreground">
                      {course.category?.name ?? (programType === 'internship' ? 'Internship' : 'Training')}
                    </p>
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {course.description}
                    </p>
                    <p className="text-sm font-semibold text-[var(--brand-navy)] mb-4">
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
