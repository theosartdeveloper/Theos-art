import { Resend } from 'resend'
import { COMPANY } from '@/lib/company/constants'
import { getCompanyLogoUrl } from '@/lib/platform/branding'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || `${COMPANY.brandName} <info@theosartltd.com>`

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || COMPANY.email

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() || COMPANY.publicSiteUrl
  return url.replace(/\/$/, '')
}

/** Turn a relative path or absolute URL into an absolute URL suitable for email clients. */
export function absolutePublicUrl(pathOrUrl: string): string {
  const value = pathOrUrl.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const base = getAppUrl()
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}

export type SendEmailResult = { success: boolean; error?: unknown; skipped?: boolean }

export async function sendEmail(input: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<SendEmailResult> {
  const recipients = (Array.isArray(input.to) ? input.to : [input.to]).filter(Boolean)
  if (!recipients.length) {
    return { success: false, error: 'No recipient' }
  }

  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipped:', input.subject)
    return { success: false, skipped: true, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipients,
      subject: input.subject,
      html: input.html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    })
    if (error) {
      console.error('[email] Send failed:', input.subject, error)
      return { success: false, error }
    }
    return { success: true }
  } catch (error) {
    console.error('[email] Send failed:', input.subject, error)
    return { success: false, error }
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function emailLayout(options: {
  title: string
  subtitle?: string
  bodyHtml: string
  headerTone?: 'primary' | 'neutral' | 'success' | 'warning'
  /** Absolute or site-relative logo URL shown in the email header. */
  logoUrl?: string
}): string {
  const headerColors = {
    primary: 'linear-gradient(135deg, #3a3a3a 0%, #2c2c2c 100%)',
    neutral: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    success: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    warning: 'linear-gradient(135deg, #f08a28 0%, #d97706 100%)',
  }
  const headerBg = headerColors[options.headerTone ?? 'primary']
  const year = new Date().getFullYear()
  const logoSrc = absolutePublicUrl(options.logoUrl || COMPANY.logoUrl)

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; background: #f1f5f9; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: ${headerBg}; color: white; padding: 28px 24px; text-align: center; border-radius: 8px 8px 0 0; }
      .logo { max-height: 52px; max-width: 180px; margin: 0 auto 14px; display: block; object-fit: contain; }
      .content { background: #ffffff; padding: 28px 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; }
      .button { background: #f08a28; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: 600; }
      h1 { margin: 0 0 8px 0; font-size: 22px; }
      .subtitle { margin: 0; opacity: 0.95; font-size: 14px; }
      .highlight { color: #3a3a3a; font-weight: 600; }
      .muted { color: #64748b; font-size: 14px; }
      ul { padding-left: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${
          logoSrc
            ? `<img class="logo" src="${escapeHtml(logoSrc)}" alt="${escapeHtml(COMPANY.brandName)}" width="160" height="52">`
            : ''
        }
        <h1>${escapeHtml(options.title)}</h1>
        ${options.subtitle ? `<p class="subtitle">${escapeHtml(options.subtitle)}</p>` : ''}
      </div>
      <div class="content">
        ${options.bodyHtml}
      </div>
      <div class="footer">
        <p>&copy; ${year} ${escapeHtml(COMPANY.legalName)}. All rights reserved.</p>
        <p class="muted">${escapeHtml(COMPANY.email)} · ${escapeHtml(COMPANY.phoneDisplay)}</p>
        <p class="muted">${escapeHtml(COMPANY.address)}</p>
      </div>
    </div>
  </body>
</html>`
}

/** Same as emailLayout but injects the live company logo from site settings when available. */
export async function brandedEmailLayout(
  options: Omit<Parameters<typeof emailLayout>[0], 'logoUrl'> & { logoUrl?: string }
): Promise<string> {
  let logoUrl = options.logoUrl
  if (!logoUrl) {
    try {
      logoUrl = await getCompanyLogoUrl()
    } catch {
      logoUrl = COMPANY.logoUrl
    }
  }
  return emailLayout({ ...options, logoUrl })
}

export function ctaButton(label: string, href: string): string {
  return `<p><a class="button" href="${escapeHtml(href)}">${escapeHtml(label)}</a></p>`
}
