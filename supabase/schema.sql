-- Run this once in the Supabase dashboard's SQL editor (Project > SQL Editor).
-- Not applied automatically — this project has no Supabase CLI/service-role access,
-- only the browser anon/publishable key (see lib/supabase-client.ts).

create table tracker_entries (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  date timestamptz not null,
  topic text not null,
  score int not null,
  total int not null,
  missed_question_ids jsonb not null default '[]'
);

alter table tracker_entries enable row level security;
revoke all on table tracker_entries from anon, authenticated;
grant select, insert on table tracker_entries to authenticated;

create policy "select own tracker entries"
on tracker_entries for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "insert own tracker entries"
on tracker_entries for insert
to authenticated
with check ( (select auth.uid()) = user_id );

-- One row per (user, quiz) holding the in-flight answer state, upserted on every answer change.
create table quiz_progress (
  user_id uuid not null references auth.users on delete cascade,
  quiz_id text not null,
  index int not null,
  answers jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, quiz_id)
);

alter table quiz_progress enable row level security;
revoke all on table quiz_progress from anon, authenticated;
grant select, insert, update, delete on table quiz_progress to authenticated;

create policy "select own quiz progress"
on quiz_progress for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "upsert own quiz progress"
on quiz_progress for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "update own quiz progress"
on quiz_progress for update
to authenticated
using ( (select auth.uid()) = user_id );

create policy "delete own quiz progress"
on quiz_progress for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- One row per user-created text highlight, anywhere RichText renders content in the app.
-- `anchor_id` identifies the exact text field (see lib/highlight-context.tsx's scope/anchor
-- scheme); start/end are character offsets into that field's plain (markdown-stripped) text.
-- No update policy: a changed or overlapping highlight is a delete + insert, never a partial
-- edit in place (see addHighlight in lib/highlight-context.tsx).
create table highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  anchor_id text not null,
  start_offset int not null,
  end_offset int not null,
  color text not null,
  snippet text not null,
  created_at timestamptz not null default now()
);

alter table highlights enable row level security;
revoke all on table highlights from anon, authenticated;
grant select, insert, delete on table highlights to authenticated;

create policy "select own highlights"
on highlights for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "insert own highlights"
on highlights for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "delete own highlights"
on highlights for delete
to authenticated
using ( (select auth.uid()) = user_id );
