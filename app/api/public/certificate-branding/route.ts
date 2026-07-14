import { NextResponse } from 'next/server'
import { loadCertificateBranding } from '@/lib/certificate/branding'
import { absolutePublicUrl } from '@/lib/email/core'

export const dynamic = 'force-dynamic'

export async function GET() {
  const branding = await loadCertificateBranding()
  return NextResponse.json({
    logoUrl: absolutePublicUrl(branding.logoUrl) || branding.logoUrl,
    stampUrl: absolutePublicUrl(branding.stampUrl) || branding.stampUrl,
    signatoryName: branding.signatoryName,
    signatoryTitle: branding.signatoryTitle,
  })
}
