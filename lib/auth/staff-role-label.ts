import { ROLE_LABELS } from '@/types/platform'

/** Human-facing label for staff/self-register roles (Instructor, Artist, …). */
export function staffRoleLabel(role: string | null | undefined): string {
  if (!role) return 'Staff'
  return ROLE_LABELS[role] ?? role
}
