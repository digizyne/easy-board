// Lead capture for the "Talk to us" funnel. Sends an email via Resend when
// configured; otherwise accepts the lead and logs it so the form works in dev.
interface LeadBody {
  name?: string
  email?: string
  company?: string
  teamSize?: string
  message?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadBody>(event)
  const name = (body?.name ?? '').trim()
  const email = (body?.email ?? '').trim()
  const message = (body?.message ?? '').trim()
  const company = (body?.company ?? '').trim()
  const teamSize = (body?.teamSize ?? '').trim()

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, and a message are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address.' })
  }

  const config = useRuntimeConfig(event)
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    company && `Company: ${company}`,
    teamSize && `Team size: ${teamSize}`,
    '',
    message
  ].filter(Boolean).join('\n')

  if (config.resendApiKey && config.leadEmail) {
    try {
      const res = await $fetch<{ id: string }>('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.resendApiKey}` },
        body: {
          from: config.leadFrom || 'EASY <onboarding@resend.dev>',
          to: [config.leadEmail],
          reply_to: email,
          subject: `New EASY lead: ${name}${company ? ` (${company})` : ''}`,
          text: lines
        }
      })
      return { ok: true, delivered: true, id: res.id }
    } catch (err) {
      console.error('[lead] Resend delivery failed', err)
      // Fall through — don't lose the lead or fail the user's submission.
    }
  }

  console.info('[lead] captured (email not configured or delivery failed):\n' + lines)
  return { ok: true, delivered: false }
})
