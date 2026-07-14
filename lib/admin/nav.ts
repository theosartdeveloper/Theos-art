import { PERMISSIONS, type Permission, hasPermission } from '@/lib/admin/permissions'

export type AdminNavIconName =
  | 'layout-dashboard'
  | 'users'
  | 'graduation-cap'
  | 'user-cog'
  | 'hard-hat'
  | 'shield'
  | 'clipboard-list'
  | 'receipt'
  | 'award'
  | 'shopping-bag'
  | 'package'
  | 'warehouse'
  | 'folder-tree'
  | 'book-open'
  | 'video'
  | 'monitor'
  | 'megaphone'
  | 'globe'
  | 'zap'
  | 'headphones'
  | 'bar-chart'
  | 'settings'
  | 'mail'
  | 'star'

export type AdminNavItem = {
  id: string
  label: string
  href: string
  icon: AdminNavIconName
  permission: Permission
  description?: string
  /** When false, item stays in nav config (wired) but is hidden from admin UI. */
  uiVisible?: boolean
}

export type AdminNavGroup = {
  id: string
  label: string
  items: AdminNavItem[]
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: 'overview',
    label: 'Art Studio',
    items: [
      {
        id: 'overview',
        label: 'Studio dashboard',
        href: '/admin/dashboard',
        icon: 'layout-dashboard',
        permission: PERMISSIONS.REPORTS_VIEW,
        description: 'Shop, gallery, and workshop snapshot',
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        id: 'students',
        label: 'Students',
        href: '/admin/dashboard/students',
        icon: 'graduation-cap',
        permission: PERMISSIONS.LEARNING_STUDENTS,
        description: 'Student accounts, enrollments, and contact details',
      },
      {
        id: 'lecturers',
        label: 'Instructors',
        href: '/admin/dashboard/lecturers',
        icon: 'user-cog',
        permission: PERMISSIONS.USERS_VIEW,
        description: 'Teaching staff and assigned programmes',
      },
      {
        id: 'engineers',
        label: 'Artists',
        href: '/admin/dashboard/engineers',
        icon: 'hard-hat',
        permission: PERMISSIONS.USERS_VIEW,
        description: 'Artist accounts and studio support',
      },
      {
        id: 'users',
        label: 'Staff & accounts',
        href: '/admin/dashboard/users',
        icon: 'users',
        permission: PERMISSIONS.USERS_VIEW,
        description: 'All platform users, roles, and approvals',
      },
      {
        id: 'roles',
        label: 'Roles & permissions',
        href: '/admin/dashboard/roles',
        icon: 'shield',
        permission: PERMISSIONS.USERS_ASSIGN_ROLE,
      },
    ],
  },
  {
    id: 'admissions',
    label: 'Learning admissions',
    items: [
      {
        id: 'applications',
        label: 'Applications',
        href: '/admin/dashboard/applications',
        icon: 'clipboard-list',
        permission: PERMISSIONS.APPLICATIONS_VIEW,
      },
      {
        id: 'mentor-requests',
        label: 'Mentor matching',
        href: '/admin/dashboard/mentor-requests',
        icon: 'users',
        permission: PERMISSIONS.APPLICATIONS_VIEW,
      },
      {
        id: 'enrollments',
        label: 'Enrollments',
        href: '/admin/dashboard/enrollments',
        icon: 'graduation-cap',
        permission: PERMISSIONS.LEARNING_STUDENTS,
      },
      {
        id: 'payments',
        label: 'E-learning payments',
        href: '/admin/dashboard/payments',
        icon: 'receipt',
        permission: PERMISSIONS.PAYMENTS_VIEW,
        description: 'Programme enrollment MoMo receipts — separate from product orders',
      },
      {
        id: 'certificates',
        label: 'Certificates',
        href: '/admin/dashboard/certificates',
        icon: 'award',
        permission: PERMISSIONS.LEARNING_STUDENTS,
      },
    ],
  },
  {
    id: 'commerce',
    label: 'Shop',
    items: [
      {
        id: 'products',
        label: 'Products catalog',
        href: '/admin/dashboard/products',
        icon: 'shopping-bag',
        permission: PERMISSIONS.SHOP_PRODUCTS,
      },
      {
        id: 'stock',
        label: 'Stock & inventory',
        href: '/admin/dashboard/stock',
        icon: 'warehouse',
        permission: PERMISSIONS.SHOP_PRODUCTS,
      },
      {
        id: 'orders',
        label: 'Product orders',
        href: '/admin/dashboard/orders',
        icon: 'package',
        permission: PERMISSIONS.SHOP_ORDERS,
        description: 'Orders with MoMo receipts — approve payment to confirm',
      },
      {
        id: 'pos',
        label: 'Point of Sale',
        href: '/admin/dashboard/pos',
        icon: 'shopping-bag',
        permission: PERMISSIONS.SHOP_ORDERS,
        description: 'In-store sales terminal with instant stock updates',
      },
      {
        id: 'financial',
        label: 'Sales & money traffic',
        href: '/admin/dashboard/financial',
        icon: 'bar-chart',
        permission: PERMISSIONS.REPORTS_VIEW,
        description: 'Revenue, shop profit/loss, stock value — Excel & PDF download',
      },
      {
        id: 'categories',
        label: 'Categories',
        href: '/admin/dashboard/categories',
        icon: 'folder-tree',
        permission: PERMISSIONS.SHOP_CATEGORIES,
      },
    ],
  },
  {
    id: 'learning',
    label: 'Learning',
    items: [
      {
        id: 'courses',
        label: 'Programs / courses',
        href: '/admin/dashboard/courses',
        icon: 'book-open',
        permission: PERMISSIONS.LEARNING_PROGRAMS,
      },
      {
        id: 'webinars',
        label: 'Webinars',
        href: '/admin/dashboard/webinars',
        icon: 'video',
        permission: PERMISSIONS.LEARNING_PROGRAMS,
      },
      {
        id: 'learning-analytics',
        label: 'Learning analytics',
        href: '/admin/dashboard/learning-analytics',
        icon: 'bar-chart',
        permission: PERMISSIONS.LEARNING_PROGRAMS,
        description: 'Enrollments, progress, and delivery health by programme',
      },
      {
        id: 'classroom',
        label: 'Classroom monitor',
        href: '/admin/dashboard/classroom',
        icon: 'monitor',
        permission: PERMISSIONS.LEARNING_PROGRAMS,
        description: 'Live sessions across all programmes',
      },
    ],
  },
  {
    id: 'public',
    label: 'Home & Art Gallery',
    items: [
      {
        id: 'announcements',
        label: 'Art Events & news',
        href: '/admin/dashboard/announcements',
        icon: 'megaphone',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Homepage Art Events and Announcements',
      },
      {
        id: 'engineering-articles',
        label: 'Field Notes',
        href: '/admin/dashboard/engineering-articles',
        icon: 'book-open',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Engineering blog articles on /engineering',
      },
      {
        id: 'engineering-series',
        label: 'Field Notes series',
        href: '/admin/dashboard/engineering-series',
        icon: 'folder-tree',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Multi-part article collections',
      },
      {
        id: 'engineering-lead-magnets',
        label: 'Field Notes PDFs',
        href: '/admin/dashboard/engineering-lead-magnets',
        icon: 'mail',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Free PDF guides with email capture',
      },
      {
        id: 'energy-library',
        label: 'Art Gallery',
        href: '/admin/dashboard/energy-library',
        icon: 'book-open',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Public gallery, books, and culture on /art-gallery',
      },
      {
        id: 'engineering-analytics',
        label: 'Field Notes analytics',
        href: '/admin/dashboard/engineering-analytics',
        icon: 'bar-chart',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Article view counts',
      },
      {
        id: 'engineering-editorial',
        label: 'Field Notes editorial',
        href: '/admin/dashboard/engineering-editorial',
        icon: 'clipboard-list',
        permission: PERMISSIONS.CONTENT_ANNOUNCEMENTS,
        description: 'Draft queue, scheduled posts, digest reach',
      },
      {
        id: 'services',
        label: 'Services',
        href: '/admin/dashboard/services',
        icon: 'zap',
        permission: PERMISSIONS.CONTENT_SERVICES,
      },
      {
        id: 'reviews',
        label: 'Reviews & ratings',
        href: '/admin/dashboard/reviews',
        icon: 'star',
        permission: PERMISSIONS.CONTENT_SERVICES,
      },
      {
        id: 'settings',
        label: 'Site & branding',
        href: '/admin/dashboard/settings',
        icon: 'globe',
        permission: PERMISSIONS.SETTINGS_MANAGE,
        description: 'Hero, about, SEO, and company details',
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    items: [
      {
        id: 'support',
        label: 'Tickets',
        href: '/admin/dashboard/support',
        icon: 'headphones',
        permission: PERMISSIONS.SUPPORT_TICKETS,
      },
      {
        id: 'engineer-subscriptions',
        label: 'Engineer subscriptions',
        href: '/admin/dashboard/engineer-subscriptions',
        icon: 'receipt',
        permission: PERMISSIONS.SUPPORT_TICKETS,
      },
      {
        id: 'support-plans',
        label: 'Support plans',
        href: '/admin/dashboard/support-plans',
        icon: 'zap',
        permission: PERMISSIONS.SUPPORT_TICKETS,
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        href: '/admin/dashboard/reports',
        icon: 'bar-chart',
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        id: 'communications',
        label: 'Send email',
        href: '/admin/dashboard/communications',
        icon: 'mail',
        permission: PERMISSIONS.SETTINGS_MANAGE,
        description: 'Compose and send customized emails via Resend',
      },
      {
        id: 'audit-log',
        label: 'Audit log',
        href: '/admin/dashboard/audit-log',
        icon: 'shield',
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
      {
        id: 'security',
        label: 'Security',
        href: '/admin/dashboard/security',
        icon: 'shield',
        permission: PERMISSIONS.SETTINGS_MANAGE,
      },
    ],
  },
]

export type AdminMobileHub = {
  id: string
  label: string
  href: string
  icon: AdminNavIconName
  groupIds: string[]
}

/** Bottom navigation hubs for mobile admin (maps to nav groups). */
export const ADMIN_MOBILE_HUBS: AdminMobileHub[] = [
  {
    id: 'overview',
    label: 'Studio',
    href: '/admin/dashboard',
    icon: 'layout-dashboard',
    groupIds: ['overview'],
  },
  {
    id: 'commerce',
    label: 'Shop',
    href: '/admin/dashboard/products',
    icon: 'shopping-bag',
    groupIds: ['commerce'],
  },
  {
    id: 'public',
    label: 'Gallery',
    href: '/admin/dashboard/energy-library',
    icon: 'globe',
    groupIds: ['public'],
  },
  {
    id: 'learning',
    label: 'Learning',
    href: '/admin/dashboard/courses',
    icon: 'book-open',
    groupIds: ['admissions', 'learning', 'people'],
  },
]

/** Sidebar group order for Theos Art admin (hidden groups stay wired but unused). */
const THEOS_ART_NAV_GROUP_ORDER = [
  'overview',
  'commerce',
  'public',
  'admissions',
  'learning',
  'people',
  'support',
  'system',
] as const

/**
 * Theos Art admin sidebar: only Learning / Shop / Art Gallery / Home-related items.
 * All other ADMIN_NAV entries stay defined for future use (findNavItem, deep links).
 */
const THEOS_ART_ADMIN_VISIBLE_IDS = new Set([
  'overview',
  'students',
  'lecturers',
  'engineers',
  'users',
  'enrollments',
  'payments',
  'certificates',
  'products',
  'stock',
  'orders',
  'pos',
  'financial',
  'categories',
  'courses',
  'announcements',
  'energy-library',
  'services',
  'reviews',
  'settings',
  'communications',
  'reports',
  'security',
])

export function filterAdminNav(permissions: string[] | undefined): AdminNavGroup[] {
  const filtered = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        THEOS_ART_ADMIN_VISIBLE_IDS.has(item.id) &&
        item.uiVisible !== false &&
        hasPermission(permissions, item.permission)
    ),
  })).filter((group) => group.items.length > 0)

  return filtered.sort((a, b) => {
    const ai = THEOS_ART_NAV_GROUP_ORDER.indexOf(a.id as (typeof THEOS_ART_NAV_GROUP_ORDER)[number])
    const bi = THEOS_ART_NAV_GROUP_ORDER.indexOf(b.id as (typeof THEOS_ART_NAV_GROUP_ORDER)[number])
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
}

export function findNavItem(section: string): AdminNavItem | undefined {
  for (const group of ADMIN_NAV) {
    const item = group.items.find((entry) => entry.id === section)
    if (item) return item
  }
  return undefined
}

export function resolveSectionFromPathname(pathname: string): string | null {
  if (pathname === '/admin/dashboard') return 'overview'
  const match = pathname.match(/^\/admin\/dashboard\/([^/]+)/)
  return match?.[1] ?? null
}

export function findNavGroupForSection(section: string): AdminNavGroup | undefined {
  return ADMIN_NAV.find((group) => group.items.some((item) => item.id === section))
}

export function filterMobileHubs(
  permissions: string[] | undefined
): AdminMobileHub[] {
  const filteredNav = filterAdminNav(permissions)
  const visibleGroupIds = new Set(filteredNav.map((g) => g.id))

  return ADMIN_MOBILE_HUBS.filter((hub) =>
    hub.groupIds.some((groupId) => visibleGroupIds.has(groupId))
  ).map((hub) => {
    const firstVisibleGroup = hub.groupIds.find((id) => visibleGroupIds.has(id))
    if (!firstVisibleGroup) return hub
    const group = filteredNav.find((g) => g.id === firstVisibleGroup)
    const firstItem = group?.items[0]
    if (!firstItem) return hub
    return { ...hub, href: firstItem.href }
  })
}
