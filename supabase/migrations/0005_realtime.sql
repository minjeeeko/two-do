-- ============================================================================
-- DOMO — Realtime
-- Add the collaborative tables to the supabase_realtime publication so the
-- client can subscribe to live INSERT/UPDATE/DELETE. Optional but recommended
-- (the two partners see each other's changes without a refresh).
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'chores', 'chore_reactions', 'chore_comments',
    'house_messages', 'letters', 'notifications', 'couples'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;   -- already added
    end;
  end loop;
end $$;
