'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy engineering tools route — redirect to instructor library. */
export default function LecturerToolsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/lecturer/library')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Opening studio library…</p>
    </div>
  )
}
