-- ============================================================
-- AI card-assist usage metering.
-- ============================================================
-- Implements the "limited on Free" promise from PRICING.md and, more
-- immediately, caps per-user daily AI calls so the (currently all-Free) user
-- base can't run up an unbounded Anthropic bill. When billing lands, the limit
-- passed to bump_ai_usage() can vary by the caller's org plan.

create table public.ai_assist_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);

alter table public.ai_assist_usage enable row level security;

-- Users may read their own usage (e.g. to show "X left today"); writes go
-- through the SECURITY DEFINER RPC only.
create policy "ai_usage_select_own" on public.ai_assist_usage
  for select to authenticated using (user_id = auth.uid());

-- Atomically record one AI call for the caller today and report whether it is
-- within the daily limit. Returns true if allowed, false if over.
create or replace function public.bump_ai_usage(_limit int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  new_count int;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  insert into ai_assist_usage (user_id, day, count)
  values (uid, current_date, 1)
  on conflict (user_id, day) do update set count = ai_assist_usage.count + 1
  returning count into new_count;
  return new_count <= _limit;
end;
$$;
