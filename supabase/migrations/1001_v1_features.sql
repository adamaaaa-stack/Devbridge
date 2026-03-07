-- V1: Notifications, reviews, verified projects, activity timeline, admin, anti-cheat

-- ========== NOTIFICATIONS ==========
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  type text not null,
  title text not null,
  message text,
  link text,

  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications (user_id);
create index idx_notifications_read on public.notifications (user_id, read);
create index idx_notifications_created on public.notifications (created_at desc);

alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications (mark read)"
  on public.notifications for update using (auth.uid() = user_id);
-- Inserts done via service role in app (no insert policy = only service role can insert)

-- ========== WORKSPACE REVIEWS (after completed workspace) ==========
create table public.workspace_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.profiles(id) on delete cascade,
  developer_id uuid not null references public.profiles(id) on delete cascade,

  rating int not null check (rating >= 1 and rating <= 5),
  review_text text,

  created_at timestamptz not null default now(),

  unique(workspace_id)
);

create index idx_workspace_reviews_developer on public.workspace_reviews (developer_id);

alter table public.workspace_reviews enable row level security;

create policy "Public read workspace_reviews"
  on public.workspace_reviews for select using (true);
create policy "Company can insert review for own workspace"
  on public.workspace_reviews for insert
  with check (
    auth.uid() = company_id
    and workspace_id in (select id from public.workspaces where company_id = auth.uid())
  );

-- ========== VERIFIED PROJECTS (from completed workspaces) ==========
create table public.verified_projects (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references public.profiles(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,

  title text not null,
  description text,
  tech_stack text[] not null default '{}',
  completed_at timestamptz not null default now()
);

create index idx_verified_projects_developer on public.verified_projects (developer_id);

alter table public.verified_projects enable row level security;

create policy "Public read verified_projects"
  on public.verified_projects for select using (true);
-- Inserts only via service role when workspace completes (no insert policy for auth users)

-- ========== WORKSPACE ACTIVITY TIMELINE ==========
create table public.workspace_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,

  event_type text not null,
  description text,

  created_at timestamptz not null default now()
);

create index idx_workspace_activity_workspace on public.workspace_activity (workspace_id);

alter table public.workspace_activity enable row level security;

create policy "Workspace participants can read activity"
  on public.workspace_activity for select
  using (
    workspace_id in (
      select id from public.workspaces
      where company_id = auth.uid() or student_id = auth.uid()
    )
  );
create policy "Service can insert activity"
  on public.workspace_activity for insert with check (true);

-- ========== ADMIN: BAN USER ==========
alter table public.profiles
  add column if not exists is_banned boolean not null default false;

-- ========== ANTI-CHEAT: test_submissions ==========
alter table public.test_submissions
  add column if not exists time_started timestamptz,
  add column if not exists time_submitted timestamptz,
  add column if not exists code_hash text,
  add column if not exists flagged_for_review boolean not null default false;

create index idx_test_submissions_flagged on public.test_submissions (flagged_for_review) where flagged_for_review = true;
create index idx_test_submissions_task_hash on public.test_submissions (task_id, code_hash);

-- RLS: allow admins to read flagged submissions (admin routes use service role or we add policy)
-- No policy change needed if admin uses service role.
