import { NextResponse } from 'next/server'
import { getAdminSession } from '@/app/actions/admin-context'
import { hasPermission, PERMISSIONS } from '@/lib/admin/permissions'
import { loadFinancialSummary } from '@/lib/admin/data/financial-analytics'

export async function GET(request: Request) {
  const session = await getAdminSession()
  if (!session || !hasPermission(session.user.permissions, PERMISSIONS.REPORTS_VIEW)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const summary = await loadFinancialSummary({ from, to })
  return NextResponse.json(summary)
}
