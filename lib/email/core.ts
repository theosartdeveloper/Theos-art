import { promises as fs } from 'fs'
import path from 'path'
import { Resend } from 'resend'
import { COMPANY } from '@/lib/company/constants'
import { getCompanyLogoUrl } from '@/lib/platform/branding'
import { isAbsoluteMediaUrl, isLegacyLocalImagePath, pickUsableMediaUrl } from '@/lib/media/usable-url'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || `${COMPANY.brandName} <info@theosartltd.com>`

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || COMPANY.email

/** Content-ID for the company logo embedded in every branded email. */
export const EMAIL_LOGO_CID = 'theos-art-logo'

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
  if (isLegacyLocalImagePath(value)) return ''
  const base = getAppUrl()
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}

export type SendEmailResult = { success: boolean; error?: unknown; skipped?: boolean }

type LogoAttachment = {
  filename: string
  contentId: string
  contentType: string
  content?: Buffer
  path?: string
}

function extensionForContentType(contentType: string): string {
  const type = contentType.toLowerCase()
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  if (type.includes('svg')) return 'svg'
  return 'png'
}

function sniffImageContentType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif'
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }
  if (buffer.toString('utf8', 0, 5).includes('<?xml') || buffer.toString('utf8', 0, 4) === '<svg') {
    return 'image/svg+xml'
  }
  return null
}

async function fetchLogoBytes(
  url: string
): Promise<{ buffer: Buffer; contentType: string; filename: string } | null> {
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'image/*,*/*;q=0.8' },
      redirect: 'follow',
    })
    if (!res.ok) {
      console.warn('[email] Logo fetch failed:', res.status, url)
      return null
    }
    const ab = await res.arrayBuffer()
    const buffer = Buffer.from(ab)
    if (buffer.byteLength < 64 || buffer.byteLength > 4_500_000) {
      console.warn('[email] Logo buffer size rejected:', buffer.byteLength, url)
      return null
    }

    const headerType = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    const sniffed = sniffImageContentType(buffer)
    if (headerType.startsWith('image/')) {
      const contentType = sniffed || headerType
      const ext = extensionForContentType(contentType)
      return { buffer, contentType, filename: `theos-art-logo.${ext}` }
    }
    if (sniffed) {
      const ext = extensionForContentType(sniffed)
      return { buffer, contentType: sniffed, filename: `theos-art-logo.${ext}` }
    }

    console.warn('[email] Logo response was not an image:', headerType || 'unknown', url)
    return null
  } catch (error) {
    console.warn('[email] Logo fetch error:', url, error)
    return null
  }
}

async function resolveLogoAttachment(preferredUrl?: string): Promise<LogoAttachment | null> {
  let logoUrl = pickUsableMediaUrl(preferredUrl)
  if (!logoUrl) {
    try {
      logoUrl = await getCompanyLogoUrl()
    } catch {
      logoUrl = ''
    }
  }

  const absolute = absolutePublicUrl(logoUrl)
  if (absolute && isAbsoluteMediaUrl(absolute)) {
    const downloaded = await fetchLogoBytes(absolute)
    if (downloaded) {
      return {
        filename: downloaded.filename,
        contentId: EMAIL_LOGO_CID,
        contentType: downloaded.contentType,
        content: downloaded.buffer,
      }
    }
    // Resend can pull a public HTTPS URL when our runtime cannot reach R2
    const ext = absolute.match(/\.(jpe?g|png|webp|gif|svg)(?:\?|$)/i)?.[1]?.toLowerCase() || 'png'
    return {
      filename: `theos-art-logo.${ext === 'jpeg' ? 'jpg' : ext}`,
      contentId: EMAIL_LOGO_CID,
      contentType: `image/${ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : ext}`,
      path: absolute,
    }
  }

  // Last resort: local file (often missing after R2 migration)
  try {
    const localFile = path.join(process.cwd(), 'public', 'images', 'theos-art-logo-v2.png')
    const content = await fs.readFile(localFile)
    if (content.length > 0) {
      return {
        filename: 'theos-art-logo.png',
        contentId: EMAIL_LOGO_CID,
        contentType: 'image/png',
        content,
      }
    }
  } catch {
    // no local logo
  }

  return null
}

export async function sendEmail(input: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  /** When true (default), embed company logo as CID if the HTML references it. */
  embedLogo?: boolean
  logoUrl?: string
}): Promise<SendEmailResult> {
  const recipients = (Array.isArray(input.to) ? input.to : [input.to]).filter(Boolean)
  if (!recipients.length) {
    return { success: false, error: 'No recipient' }
  }

  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipped:', input.subject)
    return { success: false, skipped: true, error: 'RESEND_API_KEY not configured' }
  }

  const needsLogo = input.embedLogo !== false && input.html.includes(`cid:${EMAIL_LOGO_CID}`)
  const logoAttachment = needsLogo ? await resolveLogoAttachment(input.logoUrl) : null

  let html = input.html
  const attachments =
    logoAttachment?.content
      ? [
          {
            filename: logoAttachment.filename,
            contentId: logoAttachment.contentId,
            contentType: logoAttachment.contentType,
            content: logoAttachment.content,
          },
        ]
      : logoAttachment?.path
        ? [
            {
              filename: logoAttachment.filename,
              contentId: logoAttachment.contentId,
              contentType: logoAttachment.contentType,
              path: logoAttachment.path,
            },
          ]
        : undefined

  // If CID attach failed, fall back to the live public logo URL so the header is not blank
  if (needsLogo && !attachments) {
    let fallback = pickUsableMediaUrl(input.logoUrl)
    if (!fallback) {
      try {
        fallback = await getCompanyLogoUrl()
      } catch {
        fallback = ''
      }
    }
    const absoluteFallback = absolutePublicUrl(fallback)
    if (absoluteFallback) {
      html = html.split(`cid:${EMAIL_LOGO_CID}`).join(absoluteFallback)
      console.warn('[email] Logo CID unavailable — using public URL fallback')
    }
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipients,
      subject: input.subject,
      html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      ...(attachments ? { attachments } : {}),
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
  /**
   * Optional absolute/relative logo URL used only as a downloadable attachment source.
   * The visible `<img>` always uses the CID so clients do not hot-link the website.
   */
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

  const logoBlock = `
        <div style="margin:0 auto 16px;display:inline-block;background:#ffffff;padding:10px 16px;border-radius:10px;line-height:0;">
          <img src="cid:${EMAIL_LOGO_CID}" alt="${escapeHtml(COMPANY.brandName)}" width="140" height="44" style="display:block;max-width:140px;max-height:44px;width:auto;height:auto;border:0;outline:none;">
        </div>`

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; background: #f1f5f9; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: ${headerBg}; color: white; padding: 28px 24px; text-align: center; border-radius: 8px 8px 0 0; }
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
        ${logoBlock}
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

/** Resolves live company logo then builds HTML (CID attachment resolved again in sendEmail). */
export async function brandedEmailLayout(
  options: Omit<Parameters<typeof emailLayout>[0], 'logoUrl'> & { logoUrl?: string }
): Promise<{ html: string; logoUrl: string }> {
  let logoUrl = pickUsableMediaUrl(options.logoUrl)
  if (!logoUrl) {
    try {
      logoUrl = await getCompanyLogoUrl()
    } catch {
      logoUrl = ''
    }
  }
  return {
    html: emailLayout({ ...options, logoUrl }),
    logoUrl,
  }
}

export function ctaButton(label: string, href: string): string {
  return `<p><a class="button" href="${escapeHtml(href)}">${escapeHtml(label)}</a></p>`
}
