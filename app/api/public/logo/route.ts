import { NextResponse } from 'next/server'
import { COMPANY } from '@/lib/company/constants'
import { loadPublicCompanyProfile } from '@/lib/platform/site-settings'

export async function GET() {
  try {
    const profile = await loadPublicCompanyProfile()
    return NextResponse.json({
      logoUrl: profile.logoUrl || COMPANY.logoUrl,
      brandName: profile.brandName || COMPANY.brandName,
      slogan: profile.slogan || COMPANY.slogan,
    })
  } catch {
    return NextResponse.json({
      logoUrl: COMPANY.logoUrl,
      brandName: COMPANY.brandName,
      slogan: COMPANY.slogan,
    })
  }
}
