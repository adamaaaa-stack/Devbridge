-- AI-generated skill test system: levels 1-10 per skill, task generation, submissions, progression

-- Add optional columns to existing skills (keep id, slug, name from 002)
alter table public.skills
  add column if not exists category text,
  add column if not exists created_at timestamptz default now();

-- skill_levels: one row per (skill, level) for levels 1-10
create table public.skill_levels (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  level int not null check (level >= 1 and level <= 10),
  difficulty text,
  created_at timestamptz not null default now(),
  unique(skill_id, level)
);

create index idx_skill_levels_skill on public.skill_levels (skill_id);

-- skill_tasks: AI-generated challenge per skill_level (one active task per level)
create table public.skill_tasks (
  id uuid primary key default gen_random_uuid(),
  skill_level_id uuid not null references public.skill_levels(id) on delete cascade,

  title text not null,
  prompt text not null,
  description text,
  requirements text[] default '{}',
  expected_output text,
  evaluation_rules text,

  generated_by_ai boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_skill_tasks_level on public.skill_tasks (skill_level_id);

-- test_submissions: developer code submission and AI evaluation result
create table public.test_submissions (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.skill_tasks(id) on delete cascade,

  code_submission text not null,

  score int check (score >= 0 and score <= 100),
  passed boolean not null default false,
  ai_feedback text,

  created_at timestamptz not null default now()
);

create index idx_test_submissions_profile on public.test_submissions (profile_id);
create index idx_test_submissions_task on public.test_submissions (task_id);
create index idx_test_submissions_created on public.test_submissions (profile_id, task_id, created_at desc);

-- developer_skill_levels: current unlocked level per developer per skill (0 = not started)
create table public.developer_skill_levels (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  current_level int not null default 0 check (current_level >= 0 and current_level <= 10),
  updated_at timestamptz not null default now(),
  unique(profile_id, skill_id)
);

create index idx_developer_skill_levels_profile on public.developer_skill_levels (profile_id);
create index idx_developer_skill_levels_skill on public.developer_skill_levels (skill_id);

-- RLS: skill_levels (public read)
alter table public.skill_levels enable row level security;
create policy "Public read skill_levels"
  on public.skill_levels for select using (true);

-- RLS: skill_tasks (public read)
alter table public.skill_tasks enable row level security;
create policy "Public read skill_tasks"
  on public.skill_tasks for select using (true);

-- RLS: test_submissions (own profile only)
alter table public.test_submissions enable row level security;
create policy "Users read own test_submissions"
  on public.test_submissions for select using (auth.uid() = profile_id);
create policy "Users insert own test_submissions"
  on public.test_submissions for insert with check (auth.uid() = profile_id);

-- RLS: developer_skill_levels (read own; insert/update own)
alter table public.developer_skill_levels enable row level security;
create policy "Public read developer_skill_levels"
  on public.developer_skill_levels for select using (true);
create policy "Users manage own developer_skill_levels"
  on public.developer_skill_levels for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);
