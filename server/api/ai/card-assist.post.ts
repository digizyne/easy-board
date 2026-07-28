import Anthropic from '@anthropic-ai/sdk'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Free-tier daily cap per user. When billing lands, derive this from the
// caller's org plan (unlimited for paid).
const FREE_DAILY_LIMIT = 25

const SYSTEM = `You help write cards for the EASY methodology (Enumerative Agile subSYstem).

An EASY card describes ONE unit of work as an OUTCOME — the state of the world when the work is done — not a task or a list of steps. It is concise, specific enough that anyone can tell when it is complete, and small enough to finish in a single focused work session.

Given a rough card description, do two things:
1. Rewrite it as a single outcome-phrased card. Prefer "X is live / works / exists" over "build X" or "write code for X". Keep it to one or two sentences. Do not invent scope the user didn't imply.
2. Judge whether it is too big for one session. If it clearly bundles multiple independent outcomes or would span multiple days, set too_big=true and propose 2–4 smaller outcome-phrased cards that together cover it. Otherwise too_big=false, split=[].

Never add assignees, due dates, estimates, priorities, or statuses — EASY cards never have those. Respond only via the required JSON schema.`

const SCHEMA = {
  type: 'object',
  properties: {
    outcome: { type: 'string', description: 'The card rewritten as one outcome.' },
    too_big: { type: 'boolean' },
    reason: { type: 'string', description: 'One short sentence on why it is/ isn\'t too big.' },
    split: {
      type: 'array',
      description: 'Smaller outcome cards if too_big, else empty.',
      items: { type: 'string' }
    }
  },
  required: ['outcome', 'too_big', 'reason', 'split'],
  additionalProperties: false
} as const

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const config = useRuntimeConfig(event)
  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 501,
      statusMessage: 'AI assist is not configured. Set NUXT_ANTHROPIC_API_KEY.'
    })
  }

  const body = await readBody<{ description?: string }>(event)
  const description = (body?.description ?? '').trim()
  if (!description) {
    throw createError({ statusCode: 400, statusMessage: 'A card description is required.' })
  }
  if (description.length > 2000) {
    throw createError({ statusCode: 400, statusMessage: 'Description is too long.' })
  }

  // Meter usage (Free-tier daily cap).
  const supabase = await serverSupabaseClient<Database>(event)
  const { data: allowed, error: usageError } = await supabase.rpc('bump_ai_usage', {
    _limit: FREE_DAILY_LIMIT
  })
  if (usageError) {
    throw createError({ statusCode: 500, statusMessage: 'Usage metering failed.' })
  }
  if (allowed === false) {
    throw createError({
      statusCode: 429,
      statusMessage: `You've used all ${FREE_DAILY_LIMIT} AI assists for today. Upgrade for more.`
    })
  }

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: description }]
    })
  } catch (err) {
    console.error('[card-assist] Anthropic error', err)
    throw createError({ statusCode: 502, statusMessage: 'The AI service is unavailable right now.' })
  }

  const textBlock = message.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw createError({ statusCode: 502, statusMessage: 'Unexpected AI response.' })
  }

  let parsed: { outcome: string, too_big: boolean, reason: string, split: string[] }
  try {
    parsed = JSON.parse(textBlock.text)
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not parse AI response.' })
  }

  return {
    outcome: parsed.outcome,
    tooBig: parsed.too_big,
    reason: parsed.reason,
    split: Array.isArray(parsed.split) ? parsed.split.slice(0, 4) : []
  }
})
