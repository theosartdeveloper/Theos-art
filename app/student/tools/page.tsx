'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getStudentPortalData } from '@/app/actions/student-learning'
import { StudentPortalShell } from '@/components/student/student-portal-shell'
import { StudioToolsPlaceholder } from '@/components/tools/studio-tools-placeholder'

export default function StudentToolsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudentPortalData().then((result) => {
      if (!result.success) {
        router.push('/auth/login?redirect=/student/tools')
        return
      }
      setUserName(
        [result.data.user.firstName, result.data.user.lastName].filter(Boolean).join(' ') ||
          result.data.user.email
      )
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading tools…</p>
      </div>
    )
  }

  return (
    <StudentPortalShell userName={userName}>
      <StudioToolsPlaceholder showBrowseCta />
    </StudentPortalShell>
  )
}
