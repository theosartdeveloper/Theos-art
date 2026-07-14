export type CertificateData = {
  fullName: string
  program: string
  completionDate: Date
  certificateId: string
  finalScore?: number | null
  /** Student portrait shown above the recipient name when set. */
  profilePhotoUrl?: string | null
  /** Free programmes render a diagonal "Theos Art" watermark. */
  freeCourse?: boolean
  /** Awaiting admin stamp — preview only, not publicly verifiable. */
  pendingApproval?: boolean
  /** Origin used to resolve image assets (print window has no base URL). */
  assetBaseUrl?: string
  verifyUrl?: string
  qrImageUrl?: string
  logoUrl?: string
  stampUrl?: string
  signatoryName?: string
  signatoryTitle?: string
}

export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CERT-${timestamp}-${random}`
}

function resolveAsset(assetBaseUrl: string, pathOrUrl: string): string {
  const value = (pathOrUrl || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value
  const base = assetBaseUrl.replace(/\/$/, '')
  return `${base}${value.startsWith('/') ? '' : '/'}${value}`
}

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Landscape A4 certificate with a fixed safe margin so logo, stamp, signatory,
 * and QR stay inside the printable frame.
 */
export function createCertificateHTML({
  fullName,
  program,
  completionDate,
  certificateId,
  finalScore,
  profilePhotoUrl,
  freeCourse = false,
  pendingApproval = false,
  assetBaseUrl = '',
  verifyUrl,
  qrImageUrl,
  logoUrl: logoOverride,
  stampUrl: stampOverride,
  signatoryName = 'Elie BISAMAZA',
  signatoryTitle = 'Managing Director · Theos Art Ltd',
}: CertificateData): string {
  const isOfficial = !pendingApproval
  const formattedDate = completionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const logoUrl = resolveAsset(assetBaseUrl, logoOverride || '')
  const stampUrl = resolveAsset(assetBaseUrl, stampOverride || '')
  const safeName = escapeHtml(signatoryName)
  // Role line under the name — keep short (e.g. "Managing Director")
  const roleLine = String(signatoryTitle).split('·')[0]?.trim() || 'Managing Director'
  const safeRole = escapeHtml(roleLine)
  const safeFullName = escapeHtml(fullName)
  const safeProgram = escapeHtml(program)
  const safeCertId = escapeHtml(certificateId)
  const safeVerify = verifyUrl ? escapeHtml(verifyUrl) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate — ${safeFullName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Great+Vibes&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Libre Baskerville', Georgia, serif;
      background: #e8ebf0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Fixed landscape canvas */
    .certificate {
      width: 297mm;
      height: 210mm;
      position: relative;
      background: #fff;
      margin: 0 auto;
      overflow: hidden;
    }

    .frame {
      position: absolute;
      inset: 7mm;
      border: 2.5px solid #3a3a3a;
      pointer-events: none;
      z-index: 1;
    }
    .frame::before {
      content: '';
      position: absolute;
      inset: 2.5mm;
      border: 1px solid #f08a28;
    }

    .watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.05;
      pointer-events: none;
      z-index: 0;
    }
    .watermark img { width: 110mm; max-width: 45%; height: auto; }

    .text-watermark {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
    }
    .text-watermark .wm-primary {
      position: absolute;
      top: 48%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-26deg);
      font-family: 'Cinzel', serif;
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #3a3a3a;
      opacity: 0.18;
      white-space: nowrap;
      text-transform: uppercase;
    }
    .text-watermark .wm-secondary {
      position: absolute;
      top: 58%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-26deg);
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 4px;
      color: #3a3a3a;
      opacity: 0.16;
      white-space: nowrap;
      text-transform: uppercase;
    }

    /* Safe content band — keep clear of the decorative frame */
    .shell {
      position: absolute;
      inset: 14mm 14mm 12mm;
      z-index: 3;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      min-height: 0;
    }

    .header {
      flex: 0 0 auto;
      text-align: center;
      padding-bottom: 2mm;
    }
    .logo {
      height: 22mm;
      width: auto;
      max-width: 70mm;
      object-fit: contain;
      display: inline-block;
    }
    .logo-text {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 700;
      color: #3a3a3a;
      letter-spacing: 2px;
    }
    .cert-title {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 700;
      color: #3a3a3a;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 3mm;
    }
    .cert-subtitle {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      color: #f08a28;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 1.5mm;
    }

    .body {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2mm 8mm;
      overflow: hidden;
    }
    .presented {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      color: #4a5568;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-weight: 500;
    }
    .recipient-photo {
      width: 22mm;
      height: 22mm;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #f08a28;
      margin: 2.5mm auto 0;
      display: block;
      background: #f1f5f9;
    }
    .recipient {
      font-family: 'Great Vibes', cursive;
      font-size: 40px;
      color: #3a3a3a;
      margin-top: 1.5mm;
      line-height: 1.1;
      max-width: 220mm;
      word-wrap: break-word;
    }
    .rule {
      width: 90mm;
      max-width: 60%;
      border-bottom: 1.5px solid #f08a28;
      margin: 1.5mm auto 0;
    }
    .achievement {
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: 11px;
      color: #2d3748;
      margin-top: 3mm;
      line-height: 1.55;
      max-width: 200mm;
    }
    .program-name {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 16px;
      font-weight: 600;
      color: #3a3a3a;
      margin-top: 1.5mm;
      letter-spacing: 0.5px;
      max-width: 200mm;
      word-wrap: break-word;
    }
    .score-line {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      color: #4a5568;
      margin-top: 1.5mm;
    }
    .score-line strong { color: #3a3a3a; }

    .notice {
      margin: 2.5mm auto 0;
      max-width: 180mm;
      padding: 2mm 3mm;
      border-radius: 1.5mm;
      font-family: 'Montserrat', sans-serif;
      font-size: 8.5px;
      font-weight: 600;
      line-height: 1.4;
      text-align: left;
    }
    .notice strong {
      display: block;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 0.8mm;
    }
    .notice.free {
      border: 1px solid #f08a28;
      background: rgba(240, 138, 40, 0.08);
      color: #3a3a3a;
    }
    .notice.free strong { color: #d97706; }
    .notice.pending {
      border: 1px solid #94a3b8;
      background: rgba(100, 116, 139, 0.1);
      color: #334155;
    }
    .notice.pending strong { color: #475569; }

    /* Bottom band — equal two columns (authority left, QR + date right) */
    .bottom {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 12mm;
      align-items: end;
      justify-items: center;
      padding-top: 3mm;
      border-top: 1px solid #e2e8f0;
      margin-top: 2mm;
      min-height: 54mm;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      text-align: center;
      width: 100%;
      max-width: 78mm;
      min-width: 0;
      overflow: visible;
    }

    .col-left { align-items: center; }
    .col-right { align-items: center; gap: 2.8mm; }

    .date-value {
      font-family: 'Libre Baskerville', Georgia, serif;
      font-size: 12px;
      font-weight: 700;
      color: #3a3a3a;
    }
    .col-rule {
      width: 70%;
      max-width: 48mm;
      border-top: 1.25px solid #2d3748;
      margin: 1.5mm 0;
    }
    .col-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 700;
      color: #3a3a3a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Stamp covers both the director name and "Managing Director" */
    .sig-block {
      position: relative;
      width: 100%;
      max-width: 72mm;
      min-height: 48mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding-top: 14mm;
      padding-bottom: 1mm;
    }
    .stamp {
      position: absolute;
      left: 50%;
      bottom: -1mm;
      width: 58mm;
      height: 58mm;
      object-fit: contain;
      opacity: 0.9;
      transform: translateX(-50%) rotate(-12deg);
      mix-blend-mode: multiply;
      filter: contrast(1.14) saturate(1.1);
      z-index: 1;
      pointer-events: none;
    }
    .sig-name {
      position: relative;
      z-index: 2;
      font-family: 'Cinzel', serif;
      font-size: 14px;
      font-weight: 700;
      color: #3a3a3a;
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1.2;
      max-width: 100%;
      word-wrap: break-word;
      text-shadow: 0 0 6px rgba(255, 255, 255, 0.85);
    }
    .sig-rule {
      position: relative;
      z-index: 2;
      width: 70%;
      max-width: 48mm;
      border-top: 1.5px solid #2d3748;
      margin: 2mm 0 1.5mm;
    }
    .sig-title {
      position: relative;
      z-index: 2;
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      line-height: 1.35;
      color: #5a6472;
      letter-spacing: 0.6px;
      max-width: 100%;
      word-wrap: break-word;
    }
    .sig-pending {
      position: relative;
      z-index: 2;
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      padding: 1.5mm 2mm;
      border: 1px dashed #cbd5e1;
      border-radius: 1mm;
      max-width: 100%;
    }

    .qr-box {
      background: #fff;
      padding: 1.5mm;
      border: 1px solid #d1d9e6;
      border-radius: 1.5mm;
      display: inline-block;
      max-width: 100%;
    }
    .qr-box img {
      width: 20mm;
      height: 20mm;
      display: block;
      margin: 0 auto;
    }
    .qr-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 6.5px;
      font-weight: 600;
      color: #3a3a3a;
      margin-top: 1mm;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .qr-hint {
      font-family: 'Montserrat', sans-serif;
      font-size: 5.5px;
      color: #718096;
      margin-top: 0.4mm;
    }

    .date-stack {
      width: 100%;
      max-width: 48mm;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .footer {
      flex: 0 0 auto;
      text-align: center;
      font-family: 'Montserrat', sans-serif;
      font-size: 7.5px;
      line-height: 1.4;
      color: #718096;
      padding-top: 2mm;
      margin-top: 2mm;
      border-top: 1px solid #e2e8f0;
    }
    .footer .cert-id {
      display: block;
      font-weight: 700;
      color: #3a3a3a;
      font-size: 9px;
      letter-spacing: 0.3px;
      margin-bottom: 0.4mm;
    }
    .footer code {
      font-family: 'Montserrat', monospace;
      font-size: 9.5px;
      background: #f1f5f9;
      padding: 0.3mm 1.2mm;
      border-radius: 0.8mm;
    }
    .footer .verify-line {
      display: block;
      font-size: 6.5px;
      color: #94a3b8;
      word-break: break-all;
      max-width: 100%;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="frame"></div>
    <div class="watermark">${logoUrl ? `<img src="${logoUrl}" alt="">` : ''}</div>
    ${
      freeCourse
        ? `<div class="text-watermark">
            <div class="wm-primary">Theos Art</div>
            <div class="wm-secondary">Complimentary Programme Certificate</div>
          </div>`
        : ''
    }
    ${
      pendingApproval
        ? `<div class="text-watermark">
            <div class="wm-primary">Pending Approval</div>
            <div class="wm-secondary">Awaiting Official Stamp &amp; Signature</div>
          </div>`
        : ''
    }

    <div class="shell">
      <div class="header">
        ${
          logoUrl
            ? `<img class="logo" src="${logoUrl}" alt="Theos Art">`
            : `<div class="logo-text">Theos Art</div>`
        }
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-subtitle">Creative Training &amp; Studio Development</div>
      </div>

      <div class="body">
        <div class="presented">This certificate is proudly presented to</div>
        ${
          profilePhotoUrl
            ? `<img class="recipient-photo" src="${escapeHtml(profilePhotoUrl)}" alt="">`
            : ''
        }
        <div class="recipient">${safeFullName}</div>
        <div class="rule"></div>
        <div class="achievement">
          for successfully completing the requirements of the programme
          <div class="program-name">${safeProgram}</div>
          ${
            finalScore != null
              ? `<div class="score-line">Final average score: <strong>${finalScore}%</strong></div>`
              : ''
          }
        </div>
        ${
          freeCourse
            ? `<div class="notice free">
                <strong>Complimentary certificate — watermark applied</strong>
                Upgrade to the paid programme to receive an official certificate without watermark.
              </div>`
            : ''
        }
        ${
          pendingApproval
            ? `<div class="notice pending">
                <strong>Preview — pending admin approval</strong>
                Official stamp, signature, and public verification are added after Theos Art Ltd approval.
              </div>`
            : ''
        }
      </div>

      <div class="bottom">
        <div class="col col-left">
          <div class="sig-block">
            ${isOfficial && stampUrl ? `<img class="stamp" src="${stampUrl}" alt="Company stamp">` : ''}
            ${
              isOfficial
                ? `<div class="sig-name">${safeName}</div>
                   <div class="sig-rule"></div>
                   <div class="sig-title">${safeRole}</div>`
                : `<div class="sig-rule"></div>
                   <div class="sig-pending">Awaiting stamp &amp; signature</div>`
            }
          </div>
        </div>

        <div class="col col-right">
          ${
            qrImageUrl && isOfficial
              ? `<div class="qr-box">
                  <img src="${escapeHtml(qrImageUrl)}" alt="Verify certificate">
                  <div class="qr-label">Scan to verify</div>
                  <div class="qr-hint">www.theosartltd.com</div>
                </div>`
              : `<div class="col-label" style="opacity:0.45">${
                  isOfficial ? 'Theos Art Ltd' : 'Pending verification'
                }</div>`
          }
          <div class="date-stack">
            <div class="date-value">${escapeHtml(formattedDate)}</div>
            <div class="col-rule"></div>
            <div class="col-label">${isOfficial ? 'Date of issue' : 'Completion date'}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <span class="cert-id">Certificate ID: <code>${safeCertId}</code></span>
        ${safeVerify && isOfficial ? `<span class="verify-line">Verify at ${safeVerify}</span>` : ''}
        ${pendingApproval ? `<span class="verify-line">Verification available after admin approval</span>` : ''}
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 900);
    });
  </script>
</body>
</html>`
}
