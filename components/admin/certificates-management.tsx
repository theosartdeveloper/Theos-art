'use client'

import { AdminSectionHeader } from '@/components/admin/admin-section-header'
import { AdminAssessmentsPanel } from '@/components/admin/admin-assessments-panel'

export default function CertificatesManagement() {
  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Certificates"
        description="Final approval queue after lecturers confirm passing scores. Approved certificates are emailed to students with verification links."
      />
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Upload or change the official stamp, certificate logo, and signatory under{' '}
        <a href="/admin/dashboard/settings" className="font-medium text-[var(--brand-navy)] underline">
          Site &amp; branding → Branding
        </a>
        .
      </div>
      <AdminAssessmentsPanel standalone />
    </div>
  )
}
