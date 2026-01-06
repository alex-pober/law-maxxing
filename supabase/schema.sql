-- Create the notes table
create table notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text, -- Optional description for the note
  content_markdown text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_favorite boolean default false not null,
  is_public boolean default false not null, -- Whether the note is visible on the explore page
  class_name text, -- Class/course name for the note
  teacher_name text, -- Teacher/professor name
  user_id uuid references auth.users(id),
  folder_id uuid references folders(id),
  position integer default 0 not null,
  forked_from uuid references notes(id) on delete set null -- Tracks original note if saved from explore
);

-- Auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row
  execute function update_updated_at_column();

-- Migration: Rename category to description if table already exists
-- alter table notes rename column category to description;
-- alter table notes alter column description drop not null;

-- Migration: Add updated_at and is_favorite columns if table already exists
-- alter table notes add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
-- alter table notes add column if not exists is_favorite boolean default false not null;

-- Create folders table
create table folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_id uuid references folders(id),
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  position integer default 0 not null,
  is_public boolean default false not null -- Whether the folder is visible on the explore page
);

-- Migration: Add position columns if tables already exist
-- alter table notes add column if not exists position integer default 0 not null;
-- alter table folders add column if not exists position integer default 0 not null;

-- Enable Row Level Security (RLS)
alter table notes enable row level security;
alter table folders enable row level security;

-- ===========================================
-- NOTES POLICIES
-- ===========================================

-- SELECT: Users can see their own notes OR public notes
create policy "Users can view own notes or public notes"
on notes for select
using (auth.uid() = user_id or is_public = true);

-- INSERT: Users can only create notes for themselves
create policy "Users can create their own notes"
on notes for insert
with check (auth.uid() = user_id);

-- UPDATE: Users can only update their own notes
create policy "Users can update their own notes"
on notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- DELETE: Users can only delete their own notes
create policy "Users can delete their own notes"
on notes for delete
using (auth.uid() = user_id);

-- ===========================================
-- FOLDERS POLICIES
-- ===========================================

-- SELECT: Users can see their own folders OR public folders
create policy "Users can view own folders or public folders"
on folders for select
using (auth.uid() = user_id or is_public = true);

-- INSERT: Users can only create folders for themselves
create policy "Users can create their own folders"
on folders for insert
with check (auth.uid() = user_id);

-- UPDATE: Users can only update their own folders
create policy "Users can update their own folders"
on folders for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- DELETE: Users can only delete their own folders
create policy "Users can delete their own folders"
on folders for delete
using (auth.uid() = user_id);

-- ===========================================
-- PROFILES TABLE (for public user info on explore page)
-- ===========================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  school text, -- User's school/university name
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Anyone can view profiles (needed for explore page)
create policy "Profiles are publicly viewable"
on profiles for select
using (true);

-- Users can only update their own profile
create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

-- Auto-create profile on user signup via trigger
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Anonymous'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at for profiles
create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- ===========================================
-- MIGRATIONS (for existing databases)
-- ===========================================

-- Migration: Add is_public column to notes
-- alter table notes add column if not exists is_public boolean default false not null;

-- Migration: Add is_public column to folders
-- alter table folders add column if not exists is_public boolean default false not null;

-- Migration: Add forked_from column to notes (for saving public notes)
-- alter table notes add column if not exists forked_from uuid references notes(id) on delete set null;

-- Migration: Drop old RLS policies and create new ones (run these in order)
-- drop policy if exists "Users can only access their own notes" on notes;
-- drop policy if exists "Users can manage their own folders" on folders;
-- Then run the new policy creates above

-- ===========================================
-- FULL TEXT SEARCH (see migrations/20260106_add_fts_to_notes.sql)
-- ===========================================
-- Migration: Add Full Text Search column to notes
-- ALTER TABLE notes ADD COLUMN IF NOT EXISTS fts tsvector
-- GENERATED ALWAYS AS (
--   setweight(to_tsvector('english', coalesce(content_markdown, '')), 'A') ||
--   setweight(to_tsvector('english', coalesce(title, '')), 'B') ||
--   setweight(to_tsvector('english', coalesce(description, '')), 'C')
-- ) STORED;
-- CREATE INDEX IF NOT EXISTS notes_fts_idx ON notes USING GIN (fts);
