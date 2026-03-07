-- Code Escrow: submissions, reviews, escrow records. No real payments yet.
--
-- Storage: Create a private bucket named "code_submissions" in Supabase Dashboard
-- (Storage → New bucket → name: code_submissions, public: off).
-- Upload path: {workspace_id}/{submission_id}/source.zip

-- --------------------------------------------------
-- submissions
-- --------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  developer_id uuid not null references public.profiles(id) on delete cascade,

  repo_url text,
  preview_url text,
  description text,

  status text not null check (
    status in (
      'draft',
      'submitted',
      'preview_ready',
      'under_review',
      'approved',
      'payment_required',
      'delivered'
    )
  ) default 'draft',

  code_storage_path text,

  created_at timestamptz not null default now()
);

create index idx_submissions_workspace on public.submissions (workspace_id);
create index idx_submissions_developer on public.submissions (developer_id);
create index idx_submissions_status on public.submissions (status);

-- --------------------------------------------------
-- submission_reviews
-- --------------------------------------------------
create table public.submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  company_id uuid not null references public.profiles(id) on delete cascade,

  approved boolean not null,
  review_notes text,

  created_at timestamptz not null default now()
);

create index idx_submission_reviews_submission on public.submission_reviews (submission_id);

-- --------------------------------------------------
-- escrow_records
-- --------------------------------------------------
create table public.escrow_records (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,

  payment_status text not null check (
    payment_status in (
      'pending',
      'paid',
      'released'
    )
  ) default 'pending',

  code_access_granted boolean not null default false,
  released_at timestamptz,

  created_at timestamptz not null default now(),

  unique(submission_id)
);

create index idx_escrow_records_submission on public.escrow_records (submission_id);

-- --------------------------------------------------
-- RLS: submissions (workspace participants can read; developer can insert/update own)
-- --------------------------------------------------
alter table public.submissions enable row level security;

create policy "Workspace participants can read submissions"
  on public.submissions for select
  using (
    workspace_id in (
      select id from public.workspaces
      where company_id = auth.uid() or student_id = auth.uid()
    )
  );

create policy "Developer can insert own submission"
  on public.submissions for insert
  with check (auth.uid() = developer_id);

create policy "Developer can update own submission"
  on public.submissions for update
  using (auth.uid() = developer_id)
  with check (auth.uid() = developer_id);

-- --------------------------------------------------
-- RLS: submission_reviews (workspace company can read/insert)
-- --------------------------------------------------
alter table public.submission_reviews enable row level security;

create policy "Workspace participants can read submission_reviews"
  on public.submission_reviews for select
  using (
    submission_id in (
      select s.id from public.submissions s
      join public.workspaces w on w.id = s.workspace_id
      where w.company_id = auth.uid() or w.student_id = auth.uid()
    )
  );

create policy "Company can insert review for own workspace"
  on public.submission_reviews for insert
  with check (
    company_id = auth.uid()
    and submission_id in (
      select s.id from public.submissions s
      join public.workspaces w on w.id = s.workspace_id
      where w.company_id = auth.uid()
    )
  );

-- --------------------------------------------------
-- RLS: escrow_records (workspace participants can read; updates via server only)
-- --------------------------------------------------
alter table public.escrow_records enable row level security;

create policy "Workspace participants can read escrow_records"
  on public.escrow_records for select
  using (
    submission_id in (
      select s.id from public.submissions s
      join public.workspaces w on w.id = s.workspace_id
      where w.company_id = auth.uid() or w.student_id = auth.uid()
    )
  );

-- Inserts/updates for escrow_records and submission status changes done server-side (service role or with care).
