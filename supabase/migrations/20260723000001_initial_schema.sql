-- ============================================================
-- EASY Board — initial schema
-- ============================================================
-- Tenancy model: organization-centric.
--   * Every user gets a personal org on signup (the "Solo" experience).
--   * Boards belong to an org; members belong to an org with a role.
--   * Plan/billing and seat/board limits live on the org.
-- The card stays pure: description + done. No assignee, due date, points,
-- priority, labels, or status columns exist anywhere, by design.
-- ============================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid(), gen_random_bytes()

-- ---------- Enums ----------
create type public.plan_tier as enum ('free', 'team', 'business', 'enterprise');
create type public.member_role as enum ('owner', 'admin', 'member');

-- ============================================================
-- Tables
-- ============================================================

-- Mirror of auth.users for public profile data.
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- The tenancy + billing boundary.
create table public.organizations (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  slug                   text unique,
  plan                   public.plan_tier not null default 'free',
  personal               boolean not null default false,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_by             uuid references auth.users(id) on delete set null,
  created_at             timestamptz not null default now()
);

-- Membership + role within an org (this is the "seat").
create table public.organization_members (
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index organization_members_user_id_idx on public.organization_members(user_id);

-- A board. Just a named container of cards; its structure is fixed at two
-- columns (Not Done / Done), so no column config is stored.
create table public.boards (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  name        text not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);
create index boards_org_id_idx on public.boards(org_id);

-- The card. The entire data model of EASY.
create table public.cards (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  description text not null,
  done        boolean not null default false,
  done_at     timestamptz,
  done_by     uuid references auth.users(id) on delete set null,
  position    double precision not null default 0,  -- optional manual ordering
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index cards_board_id_idx on public.cards(board_id);
create index cards_board_done_idx on public.cards(board_id, done);

-- Pending invitations (consume a seat until expired/declined).
create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  email       text not null,
  role        public.member_role not null default 'member',
  token       text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz
);
create index invitations_org_id_idx on public.invitations(org_id);
create index invitations_token_idx on public.invitations(token);

-- ============================================================
-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
-- ============================================================

create or replace function public.is_org_member(_org uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from organization_members
    where org_id = _org and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(_org uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from organization_members
    where org_id = _org and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

create or replace function public.can_access_board(_board uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from boards b
    join organization_members m on m.org_id = b.org_id
    where b.id = _board and m.user_id = auth.uid()
  );
$$;

-- Plan limits. NULL means unlimited. Implements PRICING.md.
create or replace function public.plan_board_limit(_plan public.plan_tier)
returns int language sql immutable as $$
  select case _plan when 'free' then 3 else null end;
$$;

create or replace function public.plan_seat_limit(_plan public.plan_tier)
returns int language sql immutable as $$
  select case _plan when 'free' then 3 else null end;
$$;

-- ============================================================
-- Trigger functions
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Keep the Done binary honest: stamp who/when on the transition, clear on undo.
create or replace function public.stamp_card_done()
returns trigger language plpgsql as $$
begin
  if new.done and not coalesce(old.done, false) then
    new.done_at = now();
    new.done_by = auth.uid();
  elsif not new.done and coalesce(old.done, false) then
    new.done_at = null;
    new.done_by = null;
  end if;
  return new;
end;
$$;

-- Enforce the Free-plan board cap in the database (client cannot bypass).
create or replace function public.enforce_board_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  lim int;
  cnt int;
  pl  public.plan_tier;
begin
  select plan into pl from organizations where id = new.org_id;
  lim := plan_board_limit(pl);
  if lim is null then
    return new;
  end if;
  select count(*) into cnt
    from boards where org_id = new.org_id and archived_at is null;
  if cnt >= lim then
    raise exception 'Board limit reached for the % plan (max %). Upgrade to add more.', pl, lim
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- Enforce the Free-plan seat cap: members + pending invites.
create or replace function public.enforce_seat_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  lim  int;
  used int;
  pl   public.plan_tier;
begin
  select plan into pl from organizations where id = new.org_id;
  lim := plan_seat_limit(pl);
  if lim is null then
    return new;
  end if;
  select (select count(*) from organization_members where org_id = new.org_id)
       + (select count(*) from invitations
            where org_id = new.org_id and accepted_at is null and expires_at > now())
    into used;
  if used >= lim then
    raise exception 'Seat limit reached for the % plan (max %). Upgrade to add collaborators.', pl, lim
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- On signup: create profile + personal org + owner membership.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_org_id uuid;
  display    text;
begin
  display := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, display, new.raw_user_meta_data->>'avatar_url');

  insert into public.organizations (name, personal, plan, created_by)
  values (display || '''s workspace', true, 'free', new.id)
  returning id into new_org_id;

  insert into public.organization_members (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

-- ============================================================
-- Triggers
-- ============================================================

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

create trigger cards_stamp_done
  before insert or update on public.cards
  for each row execute function public.stamp_card_done();

create trigger boards_enforce_limit
  before insert on public.boards
  for each row execute function public.enforce_board_limit();

create trigger members_enforce_seat_limit
  before insert on public.organization_members
  for each row execute function public.enforce_seat_limit();

create trigger invitations_enforce_seat_limit
  before insert on public.invitations
  for each row execute function public.enforce_seat_limit();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RPCs (SECURITY DEFINER, called from the app)
-- ============================================================

-- Create a non-personal org and make the caller its owner (atomic).
create or replace function public.create_organization(_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  uid        uuid := auth.uid();
  new_org_id uuid;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  insert into organizations (name, personal, plan, created_by)
  values (_name, false, 'free', uid)
  returning id into new_org_id;
  insert into organization_members (org_id, user_id, role)
  values (new_org_id, uid, 'owner');
  return new_org_id;
end;
$$;

-- Accept an invitation by token; returns the org joined.
create or replace function public.accept_invitation(_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  inv record;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  select * into inv from invitations where token = _token;
  if inv is null then
    raise exception 'Invitation not found';
  end if;
  if inv.accepted_at is not null then
    raise exception 'Invitation already used';
  end if;
  if inv.expires_at < now() then
    raise exception 'Invitation expired';
  end if;

  -- Mark accepted first so it no longer counts as a pending seat.
  update invitations set accepted_at = now() where id = inv.id;

  insert into organization_members (org_id, user_id, role)
  values (inv.org_id, uid, inv.role)
  on conflict (org_id, user_id) do nothing;

  return inv.org_id;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles              enable row level security;
alter table public.organizations         enable row level security;
alter table public.organization_members  enable row level security;
alter table public.boards                enable row level security;
alter table public.cards                 enable row level security;
alter table public.invitations           enable row level security;

-- profiles: readable by any authenticated user (name/avatar only); own write.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- organizations: members read; admins update; owners delete.
-- (Inserts happen via SECURITY DEFINER functions, which bypass RLS.)
create policy "orgs_select_member" on public.organizations
  for select to authenticated using (is_org_member(id));
create policy "orgs_update_admin" on public.organizations
  for update to authenticated using (is_org_admin(id)) with check (is_org_admin(id));
create policy "orgs_delete_admin" on public.organizations
  for delete to authenticated using (is_org_admin(id));

-- organization_members: read within own orgs; admins manage; self can leave.
create policy "members_select_same_org" on public.organization_members
  for select to authenticated using (is_org_member(org_id));
create policy "members_insert_admin" on public.organization_members
  for insert to authenticated with check (is_org_admin(org_id));
create policy "members_update_admin" on public.organization_members
  for update to authenticated using (is_org_admin(org_id)) with check (is_org_admin(org_id));
create policy "members_delete_admin_or_self" on public.organization_members
  for delete to authenticated using (is_org_admin(org_id) or user_id = auth.uid());

-- boards: any member can read/create/update; admins or the creator can delete.
create policy "boards_select_member" on public.boards
  for select to authenticated using (is_org_member(org_id));
create policy "boards_insert_member" on public.boards
  for insert to authenticated with check (is_org_member(org_id) and created_by = auth.uid());
create policy "boards_update_member" on public.boards
  for update to authenticated using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy "boards_delete_admin_or_creator" on public.boards
  for delete to authenticated using (is_org_admin(org_id) or created_by = auth.uid());

-- cards: any member of the board's org can do everything.
create policy "cards_select" on public.cards
  for select to authenticated using (can_access_board(board_id));
create policy "cards_insert" on public.cards
  for insert to authenticated with check (can_access_board(board_id) and created_by = auth.uid());
create policy "cards_update" on public.cards
  for update to authenticated using (can_access_board(board_id)) with check (can_access_board(board_id));
create policy "cards_delete" on public.cards
  for delete to authenticated using (can_access_board(board_id));

-- invitations: managed by org admins. (Acceptance is via accept_invitation RPC.)
create policy "invites_select_admin" on public.invitations
  for select to authenticated using (is_org_admin(org_id));
create policy "invites_insert_admin" on public.invitations
  for insert to authenticated with check (is_org_admin(org_id) and invited_by = auth.uid());
create policy "invites_delete_admin" on public.invitations
  for delete to authenticated using (is_org_admin(org_id));

-- ============================================================
-- Realtime
-- ============================================================
-- Full row images so RLS-filtered UPDATE/DELETE broadcasts carry old values.
alter table public.cards replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.cards;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.boards;
  exception when duplicate_object then null;
  end;
end $$;
