import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPublishedCourses, getPublishedInternships } from '@/lib/platform/queries'
import { getCurrentUser } from '@/app/actions/auth-service'
import { COMPANY } from '@/lib/company/constants'
import { isFreeProgram } from '@/lib/enrollment/program-types'

export default async function InternshipPage() {
  const [internshipPrograms, legacyInternships] = await Promise.all([
    getPublishedCourses(undefined, { programType: 'internship' }),
    getPublishedInternships(),
  ])
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
          <h1 className="text-4xl font-bold mb-2 text-white">Internship</h1>
          <p className="text-white/85 max-w-2xl">
            Creative residency and studio internship programmes from {COMPANY.brandName}. Students enroll
            with a student account; instructors mentor admitted interns from the lecturer portal.
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
            <Link
              href="/student/courses?track=internship"
              className="text-[var(--brand-navy)] underline font-medium"
            >
              My internship portal
            </Link>
          ) : (
            <Link
              href="/auth/login?role=student&redirect=%2Fstudent%2Fcourses%3Ftrack%3Dinternship"
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

        {internshipPrograms.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-600 space-y-2">
              <p>No internship programmes published yet.</p>
              <p className="text-sm">
                Admin creates them under Programs with type Internship / Creative residency, assigns an
                instructor, then publishes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {internshipPrograms.map((item) => {
              const enrollPath = `/student/courses/${item.id}/enroll`
              const enrollHref = isStudent
                ? enrollPath
                : `/auth/login?role=student&redirect=${encodeURIComponent(enrollPath)}`
              const free = isFreeProgram(item.pricing)
              return (
                <Card key={item.id} className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-900">{item.title}</CardTitle>
                    {item.duration ? <p className="text-xs text-slate-600">{item.duration}</p> : null}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600">{item.description}</p>
                    <p className="text-sm font-semibold text-[var(--brand-navy)]">
                      {free ? 'Free' : `${Number(item.pricing ?? 0).toLocaleString()} RWF`}
                    </p>
                    <Link href={enrollHref}>
                      <Button className="bg-[var(--brand-navy)] text-white">
                        {isStudent ? (free ? 'Enroll free' : 'Enroll') : 'Student login to enroll'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {legacyInternships.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Additional listings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {legacyInternships.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-slate-900">{item.title}</CardTitle>
                    {item.deadline ? (
                      <p className="text-xs text-slate-600">
                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                    <Link
                      href={`/auth/login?role=student&redirect=${encodeURIComponent('/student/courses?track=internship')}`}
                    >
                      <Button variant="outline" className="text-slate-800 border-slate-300">
                        Student login to apply
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  )
}
