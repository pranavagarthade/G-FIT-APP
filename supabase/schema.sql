create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  condition text,
  is_premium boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_weight numeric,
  weekly_sessions integer default 4,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null,
  duration_minutes integer,
  distance_km numeric,
  calories integer,
  activity_date date not null default current_date,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  days_left integer not null default 15,
  enrolled_count integer not null default 0,
  is_premium_only boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default now() + interval '15 days'
);

create table if not exists public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  score integer not null default 0,
  completed boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (user_id, challenge_id)
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid references public.challenges(id) on delete set null,
  title text not null,
  description text,
  earned boolean not null default false,
  earned_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  post_type text not null check (post_type in ('update', 'discussion', 'transformation', 'recipe')),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_recaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month text not null,
  sessions_count integer not null default 0,
  top_activity text,
  best_streak integer default 0,
  summary text,
  share_image_url text,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.activity_logs enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.achievements enable row level security;
alter table public.community_posts enable row level security;
alter table public.chat_messages enable row level security;
alter table public.monthly_recaps enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can manage own goals" on public.user_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own activities" on public.activity_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own achievements" on public.achievements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own posts" on public.community_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own chat" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own recap" on public.monthly_recaps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Challenge data is viewable by everyone" on public.challenges for select using (true);
create policy "Users can manage own challenge enrollment" on public.challenge_participants for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_activity_logs_user_date on public.activity_logs(user_id, activity_date desc);
create index if not exists idx_challenge_participants_user on public.challenge_participants(user_id);
create index if not exists idx_community_posts_created_at on public.community_posts(created_at desc);
create index if not exists idx_monthly_recaps_user_month on public.monthly_recaps(user_id, month);
