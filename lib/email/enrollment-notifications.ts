import {
  absolutePublicUrl,
  brandedEmailLayout,
  ctaButton,
  escapeHtml,
  getAppUrl,
  sendEmail,
} from '@/lib/email/core'
import { COMPANY } from '@/lib/company/constants'

export async function sendEnrollmentApprovedEmail(input: {
  to: string
  studentName: string
  programTitle: string
  amountPaid?: number
  accessStartsAt?: string | null
}) {
  const accessNote = input.accessStartsAt
    ? `<p>Course access opens on <strong>${escapeHtml(
        new Date(input.accessStartsAt).toLocaleString('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      )}</strong>.</p>`
    : '<p>Your course materials are available now in your student dashboard.</p>'

  return sendEmail({
    to: input.to,
    subject: `Enrollment confirmed — ${input.programTitle}`,
    html: await brandedEmailLayout({
      title: 'Payment approved — you are enrolled',
      subtitle: COMPANY.brandName,
      headerTone: 'success',
      bodyHtml: `
        <p>Dear ${escapeHtml(input.studentName)},</p>
        <p>Your MoMo payment for <strong>${escapeHtml(input.programTitle)}</strong> has been verified${
          input.amountPaid ? ` (${input.amountPaid.toLocaleString()} RWF)` : ''
        }.</p>
        ${accessNote}
        ${ctaButton('Open student dashboard', `${getAppUrl()}/student/dashboard`)}
      `,
    }),
  })
}

export async function sendEnrollmentRejectedEmail(input: {
  to: string
  studentName: string
  programTitle: string
  reason?: string | null
}) {
  const reasonBlock = input.reason?.trim()
    ? `<p><strong>Reason:</strong> ${escapeHtml(input.reason.trim())}</p>`
    : ''

  return sendEmail({
    to: input.to,
    subject: `Payment not verified — ${input.programTitle}`,
    html: await brandedEmailLayout({
      title: 'Enrollment payment could not be verified',
      subtitle: COMPANY.brandName,
      headerTone: 'warning',
      bodyHtml: `
        <p>Dear ${escapeHtml(input.studentName)},</p>
        <p>We could not verify your MoMo payment for <strong>${escapeHtml(input.programTitle)}</strong>.</p>
        ${reasonBlock}
        <p>You may resubmit your receipt from your student dashboard.</p>
        ${ctaButton('Browse programmes', `${getAppUrl()}/student/courses`)}
      `,
    }),
  })
}

export async function sendSupportSubscriptionApprovedEmail(input: {
  to: string
  name: string
  planName: string
}) {
  return sendEmail({
    to: input.to,
    subject: `Subscription active — ${input.planName}`,
    html: await brandedEmailLayout({
      title: 'Subscription payment verified',
      subtitle: COMPANY.brandName,
      headerTone: 'success',
      bodyHtml: `
        <p>Dear ${escapeHtml(input.name)},</p>
        <p>Your MoMo payment for <strong>${escapeHtml(input.planName)}</strong> has been verified. Your plan is now active.</p>
        ${ctaButton('Open portal', `${getAppUrl()}/engineering-support`)}
      `,
    }),
  })
}

export async function sendSupportSubscriptionRejectedEmail(input: {
  to: string
  name: string
  planName: string
  reason?: string | null
}) {
  const reasonBlock = input.reason?.trim()
    ? `<p><strong>Reason:</strong> ${escapeHtml(input.reason.trim())}</p>`
    : ''

  return sendEmail({
    to: input.to,
    subject: `Subscription payment not verified — ${input.planName}`,
    html: await brandedEmailLayout({
      title: 'Subscription payment could not be verified',
      subtitle: COMPANY.brandName,
      headerTone: 'warning',
      bodyHtml: `
        <p>Dear ${escapeHtml(input.name)},</p>
        <p>We could not verify your MoMo payment for <strong>${escapeHtml(input.planName)}</strong>.</p>
        ${reasonBlock}
        ${ctaButton('Try again', `${getAppUrl()}/engineering-support`)}
      `,
    }),
  })
}

export async function sendCertificateIssuedEmail(input: {
  to: string
  studentName: string
  programTitle: string
  certificateCode: string
}) {
  return sendEmail({
    to: input.to,
    subject: `Certificate issued — ${input.programTitle}`,
    html: await brandedEmailLayout({
      title: 'Congratulations — your certificate is ready',
      subtitle: COMPANY.brandName,
      headerTone: 'success',
      bodyHtml: `
        <p>Dear ${escapeHtml(input.studentName)},</p>
        <p>You have successfully completed <strong>${escapeHtml(input.programTitle)}</strong>.</p>
        <p>Certificate ID: <strong>${escapeHtml(input.certificateCode)}</strong></p>
        ${ctaButton('View certificate', `${getAppUrl()}/student/certificates`)}
      `,
    }),
  })
}

/** Kept for callers that imported absolutePublicUrl from this path historically. */
export { absolutePublicUrl }
