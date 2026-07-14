import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  Award,
  BookOpen,
  CreditCard,
  ImageIcon,
  Megaphone,
  Palette,
  ShoppingBag,
  Sparkles,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import type { AdminStats } from '@/app/actions/admin-context'
import { AdminSectionHeader } from '@/components/admin/admin-section-header'
import { AdminNotificationBadge } from '@/components/admin/admin-notification-badge'
import { AdminProgrammeNotifications } from '@/components/admin/admin-programme-notifications'
import type { CourseNotificationRow } from '@/lib/admin/data/course-notification-counts'
import { PERMISSIONS, hasPermission } from '@/lib/admin/permissions'
import { COMPANY } from '@/lib/company/constants'

type ActionAlert = {
  id: string
  title: string
  description: string
  count: number
  href: string
  cta: string
}

type HubCard = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  href: string
  stat?: string
  alert?: number
}

type MetricCard = {
  label: string
  value: number | string
  icon: LucideIcon
  hint: string
}

function buildActionAlerts(stats: AdminStats, permissions: string[]): ActionAlert[] {
  const alerts: ActionAlert[] = []

  if (stats.pendingPayments > 0 && hasPermission(permissions, PERMISSIONS.PAYMENTS_VIEW)) {
    alerts.push({
      id: 'payments',
      title: 'Workshop payments to verify',
      description: 'MoMo receipts for programmes and workshops need approval.',
      count: stats.pendingPayments,
      href: '/admin/dashboard/payments',
      cta: 'Verify payments',
    })
  }

  if (stats.lowStockProducts > 0 && hasPermission(permissions, PERMISSIONS.SHOP_PRODUCTS)) {
    alerts.push({
      id: 'stock',
      title: 'Low stock materials',
      description: 'Art materials at or below reorder level need restocking.',
      count: stats.lowStockProducts,
      href: '/admin/dashboard/stock',
      cta: 'Review inventory',
    })
  }

  if (stats.pendingCertificates > 0 && hasPermission(permissions, PERMISSIONS.LEARNING_STUDENTS)) {
    alerts.push({
      id: 'certificates',
      title: 'Certificates awaiting approval',
      description: 'Workshop certificates ready for final admin approval.',
      count: stats.pendingCertificates,
      href: '/admin/dashboard/certificates',
      cta: 'Review certificates',
    })
  }

  return alerts
}

function buildStudioHubs(stats: AdminStats, permissions: string[]): HubCard[] {
  return [
    hasPermission(permissions, PERMISSIONS.SHOP_PRODUCTS)
      ? {
          id: 'shop',
          title: 'Shop',
          description: 'Artworks, materials, catalog, and product orders.',
          icon: ShoppingBag,
          href: '/admin/dashboard/products',
          stat: `${stats.products} products`,
          alert: stats.lowStockProducts > 0 ? stats.lowStockProducts : undefined,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.SHOP_ORDERS)
      ? {
          id: 'orders',
          title: 'Product orders',
          description: 'Customer orders and MoMo confirmation for shop sales.',
          icon: Warehouse,
          href: '/admin/dashboard/orders',
        }
      : null,
    hasPermission(permissions, PERMISSIONS.CONTENT_ANNOUNCEMENTS)
      ? {
          id: 'gallery',
          title: 'Art Gallery',
          description: 'Publish gallery pieces, photos, and studio culture stories.',
          icon: ImageIcon,
          href: '/admin/dashboard/energy-library',
        }
      : null,
    hasPermission(permissions, PERMISSIONS.CONTENT_ANNOUNCEMENTS)
      ? {
          id: 'announcements',
          title: 'Art Events & Announcements',
          description: 'Publish homepage art events and studio news visitors see first.',
          icon: Megaphone,
          href: '/admin/dashboard/announcements',
          stat: `${stats.announcements} published`,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.CONTENT_SERVICES)
      ? {
          id: 'services',
          title: 'Studio services',
          description: 'Workshops and offerings shown on the public home page.',
          icon: Sparkles,
          href: '/admin/dashboard/services',
        }
      : null,
    hasPermission(permissions, PERMISSIONS.LEARNING_PROGRAMS)
      ? {
          id: 'courses',
          title: 'Workshops & learning',
          description: 'Creative programmes students can enroll in.',
          icon: BookOpen,
          href: '/admin/dashboard/courses',
          stat: `${stats.publishedCourses} published`,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.LEARNING_STUDENTS)
      ? {
          id: 'enrollments',
          title: 'Admissions',
          description: 'Enrollments, payments, and learner progress.',
          icon: Award,
          href: '/admin/dashboard/enrollments',
          stat: `${stats.pendingEnrollments} pending`,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.SETTINGS_MANAGE)
      ? {
          id: 'branding',
          title: 'Site & branding',
          description: 'Logo, hero, contacts, and Theos Art profile.',
          icon: Palette,
          href: '/admin/dashboard/settings',
        }
      : null,
  ].filter(Boolean) as HubCard[]
}

export function AdminOverview({
  stats,
  permissions = [],
  courseNotifications = [],
}: {
  stats: AdminStats
  permissions?: string[]
  courseNotifications?: CourseNotificationRow[]
}) {
  const actionAlerts = buildActionAlerts(stats, permissions)
  const hubs = buildStudioHubs(stats, permissions)

  const metrics: MetricCard[] = [
    hasPermission(permissions, PERMISSIONS.SHOP_PRODUCTS)
      ? {
          label: 'Shop catalog',
          value: stats.products,
          icon: ShoppingBag,
          hint:
            stats.lowStockProducts > 0
              ? `${stats.lowStockProducts} low-stock alert${stats.lowStockProducts === 1 ? '' : 's'}`
              : 'Inventory looking healthy',
        }
      : null,
    hasPermission(permissions, PERMISSIONS.LEARNING_PROGRAMS)
      ? {
          label: 'Published workshops',
          value: stats.publishedCourses,
          icon: BookOpen,
          hint: `${stats.courses} total programmes`,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.LEARNING_STUDENTS)
      ? {
          label: 'Enrollments',
          value: stats.courseEnrollments,
          icon: Award,
          hint: `${stats.admittedEnrollments} admitted · ${stats.pendingEnrollments} pending`,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.PAYMENTS_VIEW)
      ? {
          label: 'Pending MoMo',
          value: stats.pendingPayments,
          icon: CreditCard,
          hint: `${stats.approvedPaymentsTotal.toLocaleString()} RWF verified`,
        }
      : null,
    hasPermission(permissions, PERMISSIONS.CONTENT_ANNOUNCEMENTS)
      ? {
          label: 'Announcements',
          value: stats.announcements,
          icon: Megaphone,
          hint: 'Live on the public site',
        }
      : null,
  ].filter(Boolean) as MetricCard[]

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-[var(--brand-navy)] text-white overflow-hidden shadow-sm">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-sky)] mb-2">
            {COMPANY.brandName} · Art Studio
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Studio dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-white/85 max-w-2xl">
            {COMPANY.slogan}. Manage the shop, Art Gallery, homepage stories, and creative workshops
            from one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {hasPermission(permissions, PERMISSIONS.SHOP_PRODUCTS) ? (
              <Link href="/admin/dashboard/products">
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25">
                  Open shop
                </span>
              </Link>
            ) : null}
            {hasPermission(permissions, PERMISSIONS.CONTENT_ANNOUNCEMENTS) ? (
              <Link href="/admin/dashboard/energy-library">
                <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25">
                  Art Gallery
                </span>
              </Link>
            ) : null}
            {hasPermission(permissions, PERMISSIONS.LEARNING_PROGRAMS) ? (
              <Link href="/admin/dashboard/courses">
                <span className="inline-flex items-center rounded-full bg-[var(--brand-orange)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                  Workshops
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {actionAlerts.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Needs attention
          </h2>
          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-0 divide-y divide-slate-100">
              {actionAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors no-underline"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{alert.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{alert.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AdminNotificationBadge count={alert.count} size="sm" />
                    <span className="hidden sm:inline text-xs font-medium text-[var(--brand-navy)]">
                      {alert.cta}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card className="border-emerald-200/80 bg-emerald-50/70 shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <Sparkles className="h-5 w-5 text-emerald-700 shrink-0" />
            <p className="text-sm text-slate-800">
              Studio is clear — no pending MoMo receipts, low-stock alerts, or certificate approvals.
            </p>
          </CardContent>
        </Card>
      )}

      {courseNotifications.length > 0 ? (
        <AdminProgrammeNotifications rows={courseNotifications} />
      ) : null}

      {metrics.length > 0 ? (
        <section className="space-y-3">
          <AdminSectionHeader
            title="Studio pulse"
            description="Live counts for shop, gallery content, and learning — focused on what Theos Art runs day to day."
            className="mb-0"
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-800">{card.label}</CardTitle>
                    <Icon className="h-4 w-4 text-[var(--brand-orange)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                    <p className="text-xs text-slate-600 mt-1">{card.hint}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      ) : null}

      {hubs.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Studio workspace
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {hubs.map((hub) => {
              const Icon = hub.icon
              return (
                <Link key={hub.id} href={hub.href} className="group block no-underline">
                  <Card className="h-full border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md hover:border-[var(--brand-navy)]/25">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-navy)]/10">
                          <Icon className="h-5 w-5 text-[var(--brand-navy)]" />
                        </div>
                        {hub.alert ? <AdminNotificationBadge count={hub.alert} size="sm" /> : null}
                      </div>
                      <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-[var(--brand-navy)]">
                        {hub.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-slate-600">{hub.description}</p>
                      {hub.stat ? (
                        <p className="text-xs font-medium text-slate-500">{hub.stat}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
