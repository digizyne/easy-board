# Supabase — schema & migrations

Schema for the EASY Board app. See the data-model notes in
[`../docs/PAGE-MAP.md`](../docs/PAGE-MAP.md) and tier rules in
[`../docs/PRICING.md`](../docs/PRICING.md).

## Model at a glance

```
auth.users ─┬─ profiles                (public profile)
            └─ organization_members ── organizations   (tenancy + billing + plan)
                                          └─ boards ── cards   (the product)
                                          └─ invitations       (pending seats)
```

- **organizations** are the tenancy boundary. Each user gets a personal org on
  signup (Free "Solo"). Team/Business are just orgs with more members.
- **cards** are pure: `description` + `done` (+ `done_at`/`done_by`/`position`).
  No assignee, due date, points, priority, labels, or status exist anywhere.
- **Tier limits are enforced in the DB** via triggers (`enforce_board_limit`,
  `enforce_seat_limit`) reading `organizations.plan`, so the client can't bypass
  Free's 3-board / 3-seat caps.
- **RLS** is on for every table; access flows through org membership. Helper
  functions (`is_org_member`, `is_org_admin`, `can_access_board`) are
  `SECURITY DEFINER` to avoid policy recursion.
- **Realtime** is enabled for `cards` and `boards` (live two-column sync).

## Applying the migration

### Option A — Supabase Dashboard (no CLI)
1. Create a project at https://supabase.com.
2. SQL Editor → paste the contents of
   `migrations/20260723000001_initial_schema.sql` → Run.
3. Copy the project URL and anon key into `webapp/.env`
   (`SUPABASE_URL`, `SUPABASE_KEY`).

### Option B — Supabase CLI
```bash
npm i -g supabase          # or: brew install supabase/tap/supabase
supabase link --project-ref <your-ref>
supabase db push           # applies everything in migrations/
```

## After applying: regenerate types

`app/types/database.types.ts` is generated from the live DB. Regenerate it
whenever the schema changes. This project's DB is in **us-east-2**, and the
direct host is IPv6-only, so use the **session pooler** (IPv4):

```bash
# password from .env (SUPABASE_DB_PASSWORD); ref from SUPABASE_URL
supabase gen types typescript \
  --db-url "postgresql://postgres.<ref>:<db-password>@aws-0-us-east-2.pooler.supabase.com:5432/postgres" \
  > app/types/database.types.ts
```

Convenience aliases (`Card`, `Board`, `Organization`, …) live in
`app/types/db.ts` — import those in app code.

## Auth settings to check in the dashboard
- Enable Email auth (and any OAuth/SSO providers you want).
- Set the Site URL and redirect URLs to include `/confirm` for your
  local (`http://localhost:3000`) and production origins.
