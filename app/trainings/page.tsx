import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Check, Clock, Palette, Users } from 'lucide-react'
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
    'Beginner visual art training at Theos Art — drawing, painting, colour theory, and portfolio projects with quality materials. Learn. Create. Inspire.',
}

const HIGHLIGHTS = [
  'No previous experience required',
  'Hands-on practical training',
  'Professional guidance from experienced artists',
  'Quality art materials available',
  'Portfolio-building projects',
  'Certificate of completion (where applicable)',
]

const DURATION_OPTIONS = [
  {
    title: '3-Month Foundation Program',
    detail: 'Core drawing and painting foundations for new artists.',
  },
  {
    title: '6-Month Comprehensive Beginner Program',
    detail: 'Extended practice with deeper technique and more portfolio work.',
  },
  {
    title: 'Weekend and Evening Sessions',
    detail: 'Flexible schedules for students and working professionals.',
  },
  {
    title: 'Private One-on-One Coaching',
    detail: 'Personalised studio coaching tailored to your goals.',
  },
]

const SKILLS = [
  'Line drawing',
  'Shapes and forms',
  'Shading',
  'Perspective',
  'Colour theory',
  'Composition',
  'Basic painting techniques',
]

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
            E-learning · Trainings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white max-w-3xl">
            Visual Art Training for Beginners
          </h1>
          <p className="text-[var(--brand-sky)] text-lg font-medium mb-4">Learn. Create. Inspire.</p>
          <p className="text-white/85 max-w-2xl text-base sm:text-lg leading-relaxed">
            Building the next generation of creative artists through quality training and professional
            art materials.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 space-y-14">
        <nav className="text-sm text-slate-500">
          <Link href="/learning" className="hover:text-[var(--brand-navy)] transition-colors">
            E-learning
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">Trainings</span>
        </nav>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-900">About the programme</h2>
            <p className="text-slate-600 leading-relaxed">
              Start your artistic journey with confidence. Our Beginner Visual Art Training Program is
              designed for anyone who has a passion for art, regardless of prior experience. Whether
              you are a student, a hobbyist, or someone exploring creativity for the first time, this
              course provides the essential skills needed to build a strong foundation in drawing and
              painting.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Throughout the programme, participants learn the fundamentals of visual arts, including
              line drawing, shapes and forms, shading, perspective, colour theory, composition, and
              basic painting techniques. Lessons combine practical exercises with guided projects to
              help students develop creativity, observation skills, and artistic confidence.
            </p>
            <p className="text-slate-600 leading-relaxed">
              As part of the learning experience, trainees have access to quality art materials supplied
              by {COMPANY.legalName}, making it easy to practice with the right tools. By the end of the
              course, participants will have completed several artworks and gained the confidence to
              continue their artistic journey or advance to higher-level training.
            </p>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Palette className="h-5 w-5 text-[var(--brand-orange)]" />
              Skills you will practise
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {SKILLS.map((skill) => (
                <li key={skill} className="text-sm text-slate-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-navy)] shrink-0" />
                  {skill}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-slate-900">Course highlights</h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <Check className="h-4 w-4 text-[var(--brand-orange)] mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--brand-navy)]" />
            <h2 className="text-2xl font-bold text-slate-900">Duration options</h2>
          </div>
          <p className="text-slate-600 max-w-2xl">
            Choose the schedule that fits your life. Programme length and session times are confirmed when
            you enroll; published courses below show the specific duration offered online.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {DURATION_OPTIONS.map((option) => (
              <Card key={option.title} className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-900">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{option.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-[var(--brand-navy)]" />
                <h2 className="text-2xl font-bold text-slate-900">Open programmes</h2>
              </div>
              <p className="text-slate-600 text-sm">
                Enroll in a published training below. Sign-in is required only when you choose Enroll.
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" size="sm">
                Browse art materials
              </Button>
            </Link>
          </div>

          {courses.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="py-12 text-center space-y-2">
                <p className="text-slate-800 font-medium">Programmes opening soon</p>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Contact {COMPANY.email} or call {COMPANY.phoneDisplay} to register interest in beginner
                  visual art training.
                </p>
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
                  <Card key={course.id} className="overflow-hidden border-slate-200 flex flex-col">
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
                        <p className="text-xs uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </p>
                      ) : null}
                      <CardTitle className="text-slate-900">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-slate-600 line-clamp-3 flex-1">{course.description}</p>
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
