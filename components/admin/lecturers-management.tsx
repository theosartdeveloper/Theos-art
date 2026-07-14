'use client'

import { AdminSectionHeader } from '@/components/admin/admin-section-header'
import { LecturersRegistryPanel } from '@/components/admin/lecturers-registry-panel'

export default function LecturersManagement() {
  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Instructors"
        description="Teaching staff who deliver programmes through the instructor portal. Approve new instructor accounts under Staff & accounts → Pending approval."
      />
      <LecturersRegistryPanel />
    </div>
  )
}
