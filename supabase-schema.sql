-- ============================================
-- UNSAID — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Profiles table
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  display_name text not null,
  created_at timestamptz default now()
);

-- Messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  recipient_username text not null references profiles(username) on delete cascade,
  content text not null,
  category text default 'feedback' check (category in ('compliment','question','confession','feedback')),
  is_favorite boolean default false,
  is_reported boolean default false,
  created_at timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists messages_recipient_idx on messages(recipient_username);
create index if not exists messages_created_idx on messages(created_at desc);

-- Row Level Security
alter table profiles enable row level security;
alter table messages enable row level security;

-- Profiles: anyone can read, anyone can insert (signup)
create policy "Public profiles readable" on profiles for select using (true);
create policy "Anyone can create profile" on profiles for insert with check (true);

-- Messages: anyone can insert (send anonymously), anyone can read by username
create policy "Anyone can send message" on messages for insert with check (true);
create policy "Anyone can read messages by username" on messages for select using (true);
create policy "Anyone can update messages" on messages for update using (true);
create policy "Anyone can delete messages" on messages for delete using (true);
