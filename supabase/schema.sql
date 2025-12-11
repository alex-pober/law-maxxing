-- Create the notes table
create table notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text, -- Optional description for the note
  content_markdown text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  folder_id uuid references folders(id),
  position integer default 0 not null
);

-- Migration: Rename category to description if table already exists
-- alter table notes rename column category to description;
-- alter table notes alter column description drop not null;

-- Create folders table
create table folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_id uuid references folders(id),
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  position integer default 0 not null
);

-- Migration: Add position columns if tables already exist
-- alter table notes add column if not exists position integer default 0 not null;
-- alter table folders add column if not exists position integer default 0 not null;

-- Enable Row Level Security (RLS)
alter table notes enable row level security;
alter table folders enable row level security;

-- Create a policy that allows users to manage their own notes
create policy "Users can only access their own notes"
on notes for all
using (auth.uid() = user_id);

-- Create policy for folders
create policy "Users can manage their own folders"
on folders for all
using (auth.uid() = user_id);
