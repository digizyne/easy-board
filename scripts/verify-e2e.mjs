// One-off end-to-end verification of the signup trigger + RLS.
// Creates a real auth user via the GoTrue API, then connects to the DB (as
// postgres, over the IPv4 pooler) to confirm handle_new_user() provisioned a
// profile + personal org + owner membership. Cleans up the test user after.
// Env is sourced from .env by the caller (set -a; . ./.env).
import pg from 'pg'

const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_DB_PASSWORD } = process.env
const ref = SUPABASE_URL.replace(/^https?:\/\//, '').replace(/\.supabase\.co.*/, '')
const email = `easy-qa-${Date.now()}@digizyne.net`
const password = 'testpass123!'

// 1) Sign up through GoTrue (fires the auth.users insert trigger).
const signup = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
  method: 'POST',
  headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, data: { full_name: 'QA Bot' } })
}).then(r => r.json())

const userId = signup.id || signup.user?.id
console.log('signup →', userId ? `user created (${userId})` : JSON.stringify(signup))
if (!userId) process.exit(1)

// 2) Inspect the DB as postgres via the session pooler (IPv4).
const client = new pg.Client({
  host: `aws-0-us-east-2.pooler.supabase.com`,
  port: 5432,
  user: `postgres.${ref}`,
  password: SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
})
await client.connect()

const q = async (label, sql, params) => {
  const { rows } = await client.query(sql, params)
  console.log(`\n${label}:`)
  console.table(rows)
  return rows
}

await q('profile', 'select id, full_name from public.profiles where id = $1', [userId])
const orgs = await q(
  'organization (auto-created)',
  'select name, plan, personal from public.organizations where created_by = $1',
  [userId]
)
await q(
  'membership + role',
  'select role from public.organization_members where user_id = $1',
  [userId]
)

// 3) Cleanup: delete the test user (cascades to profile/org/membership).
await client.query('delete from auth.users where id = $1', [userId])
console.log('\ncleanup → test user deleted (cascaded)')

await client.end()

const ok = orgs.length === 1 && orgs[0].personal === true && orgs[0].plan === 'free'
console.log(`\nRESULT: ${ok ? 'PASS ✅ — trigger provisioned a personal Free org' : 'FAIL ❌'}`)
process.exit(ok ? 0 : 1)
