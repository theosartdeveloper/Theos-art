import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCategories, getPublishedCourses } from '@/lib/platform/queries'
import { getCurrentUser } from '@/app/actions/auth-service'
import { COMPANY } from '@/lib/company/constants'

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; category?: string }>
}) {
  const params = await searchParams
  const module = params.module ?? 'training'
  const categories = await getCategories('learning')
  const courses = await getPublishedCourses(params.category, { programType: 'training' })
  const user = await getCurrentUser()
  const isStudent = user?.role === 'student' || user?.role === 'registered'

  const moduleTitles: Record<string, string> = {
    training: 'Workshops & creative programmes',
    internship: 'Studio learning path',
  }

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <section className="text-on-dark bg-[var(--brand-navy)] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand-sky)] mb-2">
            {COMPANY.brandName}
          </p>
          <h1 className="text-4xl font-bold mb-2">Learning</h1>
          <p className="text-white/85 max-w-2xl">
            Workshops and creative programmes from {COMPANY.brandName} — practice, materials knowledge,
            and studio skills in Kigali.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/learning?module=training">
            <Button variant={module === 'training' ? 'default' : 'outline'}>Workshops</Button>
          </Link>
          {/* Internship route stays wired for future use; not promoted on the public bar */}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/learning">
            <Button size="sm" variant={!params.category ? 'secondary' : 'outline'}>
              All categories
            </Button>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/learning?module=${module}&category=${cat.slug}`}>
              <Button size="sm" variant={params.category === cat.slug ? 'secondary' : 'outline'}>
                {cat.name}
              </Button>
            </Link>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {moduleTitles[module] ?? 'Programmes'}
        </h2>
        <p className="text-sm text-slate-600 mb-6 -mt-4">
          {isStudent ? (
            <>
              You are signed in — enroll from your{' '}
              <Link
                href="/student/courses?track=training"
                className="text-[var(--brand-navy)] font-medium underline"
              >
                student portal
              </Link>
              .
            </>
          ) : (
            <>Sign in to enroll in workshops published by {COMPANY.brandName}.</>
          )}
        </p>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <p className="text-muted-foreground">
                New workshops and creative programmes will appear here once published by an
                administrator.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-[var(--brand-navy)] underline">
                  {COMPANY.email}
                </a>{' '}
                or call {COMPANY.phoneDisplay}.
              </p>
              <Link href="/shop">
                <Button variant="outline" size="sm">
                  Browse the shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const studentEnroll = `/student/courses/${course.id}/enroll`
              const enrollHref = isStudent
                ? studentEnroll
                : `/auth/login?redirect=${encodeURIComponent(studentEnroll)}`
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
                      {course.category?.name ?? 'Workshop'}
                    </p>
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>{course.difficulty ?? 'All levels'}</span>
                      <span>{course.duration ?? 'Flexible'}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--brand-navy)] mb-4">
                      {Number(course.pricing ?? 0) > 0
                        ? `${Number(course.pricing).toLocaleString()} RWF`
                        : 'Pricing on request'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/learning/${course.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          Details
                        </Button>
                      </Link>
                      <Link href={enrollHref}>
                        <Button size="sm" className="w-full bg-[var(--brand-navy)] text-white">
                          {isStudent ? 'Enroll' : 'Log in to enroll'}
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
