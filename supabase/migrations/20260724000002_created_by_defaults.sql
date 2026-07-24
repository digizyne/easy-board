-- ============================================================
-- Robustness: default created_by to the caller.
-- ============================================================
-- The insert policies still require created_by = auth.uid(), but the client
-- should not have to assert its own identity. Defaulting the column to
-- auth.uid() means the app can omit created_by entirely and the check always
-- passes for the authenticated caller.

alter table public.boards alter column created_by set default auth.uid();
alter table public.cards  alter column created_by set default auth.uid();
