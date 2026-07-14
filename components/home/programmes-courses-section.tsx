import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPublishedCourses } from '@/lib/platform/queries'
import { COMPANY } from '@/lib/company/constants'
import { HomeSectionHeader } from '@/components/home/home-section-header'
import { pickRandomSample } from '@/lib/utils/sample'
import { isFreeProgram, PROGRAM_TYPE_LABELS, type ProgramType } from '@/lib/enrollment/program-types'

/** Home teaser — up to 3 shuffled training / learning programmes from the database. */
export async function ProgrammesCoursesSection() {
  const courses = pickRandomSample(await getPublishedCourses(), 3)

  if (courses.length === 0) {
    return (
      <section id="programmes" className="home-section home-section--compact">
        <div className="max-w-6xl mx-auto text-center">
          <HomeSectionHeader
            eyebrow="Programmes"
            title="Creative learning"
            description={`Creative training and studio programmes from ${COMPANY.brandName} will appear here once published.`}
            className="mb-6"
          />
          <Link href="/learning">
            <Button className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90">
              Explore E-learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section id="programmes" className="home-section home-section--compact">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <HomeSectionHeader
            eyebrow="Programmes"
            title="Creative learning"
            description={`Workshops and learning programmes to build creative skill with ${COMPANY.brandName}.`}
            align="left"
            className="mb-0"
          />
          <Link href="/learning">
            <Button variant="outline" className="border-slate-300 text-slate-800">
              All programmes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const free = isFreeProgram(course.pricing)
            const type = (course.program_type ?? 'training') as ProgramType
            return (
              <Card key={course.id} className="overflow-hidden border-slate-200 bg-white flex flex-col">
                {course.thumbnail ? (
                  <div className="relative h-36 bg-slate-100">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-slate-100 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit text-slate-700 border-slate-300 text-xs mb-1">
                    {PROGRAM_TYPE_LABELS[type]}
                  </Badge>
                  <CardTitle className="text-base text-slate-900 leading-snug">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-3 pt-0">
                  <p className="text-sm text-slate-600 line-clamp-3 flex-1">{course.description}</p>
                  <p className="text-sm font-semibold text-[var(--brand-navy)]">
                    {free ? 'Free' : `${Number(course.pricing ?? 0).toLocaleString()} RWF`}
                  </p>
                  <Link href={`/learning/${course.id}`}>
                    <Button
                      size="sm"
                      className="bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90"
                    >
                      View details
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
