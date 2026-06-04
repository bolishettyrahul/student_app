-- CampusConnect Database Initialization Schema
-- Initial Migration: 20260531000000_init_schema.sql

-- 1. Create Core Tables

-- Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subjects Table (Individual courses owned by a user)
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  code text,
  color text not null, -- Hex color or tailwind style label
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assignments Table (Tasks associated with a user and optionally a subject)
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamp with time zone not null,
  status text check (status in ('pending', 'completed')) default 'pending' not null,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Study Groups Table (Collaborative discussion rooms)
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Group Members Junction Table
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- Group Messages Table (Chat logs)
create table public.group_messages (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Performance & Relationship Indexes
create index idx_subjects_user_id on public.subjects(user_id);
create index idx_assignments_user_id on public.assignments(user_id);
create index idx_assignments_subject_id on public.assignments(subject_id);
create index idx_assignments_user_deadline on public.assignments(user_id, due_date);
create index idx_group_members_user_id on public.group_members(user_id);
create index idx_group_messages_group_id on public.group_messages(group_id);

-- 3. Automatic Profile Synchronization Trigger on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger for Profile Synchronization on Update
create or replace function public.handle_update_user()
returns trigger as $$
begin
  update public.profiles
  set 
    full_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', full_name),
    avatar_url = coalesce(new.raw_user_meta_data->>'avatar_url', avatar_url),
    updated_at = timezone('utc'::text, now())
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_update_user();

-- 4. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.assignments enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;

-- 5. Establish RLS Access Policies

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Subjects Policies
create policy "Users can view their own subjects." on public.subjects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own subjects." on public.subjects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own subjects." on public.subjects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own subjects." on public.subjects
  for delete using (auth.uid() = user_id);

-- Assignments Policies
create policy "Users can view their own assignments." on public.assignments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own assignments." on public.assignments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own assignments." on public.assignments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own assignments." on public.assignments
  for delete using (auth.uid() = user_id);

-- Study Groups Policies
create policy "Authenticated users can view groups." on public.groups
  for select to authenticated using (true);

create policy "Authenticated users can create groups." on public.groups
  for insert to authenticated with check (auth.uid() = created_by);

create policy "Creators can update groups." on public.groups
  for update using (auth.uid() = created_by);

create policy "Creators can delete groups." on public.groups
  for delete using (auth.uid() = created_by);

-- Group Members Policies
create policy "Members can view memberships." on public.group_members
  for select to authenticated using (true);

create policy "Users can join groups." on public.group_members
  for insert to authenticated with check (auth.uid() = user_id);

create policy "Members can leave groups." on public.group_members
  for delete using (auth.uid() = user_id);

-- Group Messages Policies
create policy "Members can view group messages." on public.group_messages
  for select using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = group_messages.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Members can post group messages." on public.group_messages
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.group_members
      where group_members.group_id = group_messages.group_id
      and group_members.user_id = auth.uid()
    )
  );

-- 6. Enable Realtime Replication Sync
alter publication supabase_realtime add table public.group_messages;
alter publication supabase_realtime add table public.assignments;
