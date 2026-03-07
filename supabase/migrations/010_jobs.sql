-- Job listings: companies post jobs, developers apply, accept triggers workspace.

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,

  title text not null,
  description text not null,

  skill_required text,
  skill_level int,

  estimated_hours int,
  difficulty text,

  status text not null check (
    status in (
      'open',
      'in_progress',
      'completed',
      'closed'
    )
  ) default 'open',

  created_at timestamptz not null default now()
);

create index idx_jobs_company on public.jobs (company_id);
create index idx_jobs_status on public.jobs (status);
create index idx_jobs_created on public.jobs (created_at desc);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  developer_id uuid not null references public.profiles(id) on delete cascade,

  message text,
  portfolio_link text,

  status text not null check (
    status in (
      'applied',
      'shortlisted',
      'rejected',
      'accepted'
    )
  ) default 'applied',

  created_at timestamptz not null default now(),

  unique(job_id, developer_id)
);

create index idx_job_applications_job on public.job_applications (job_id);
create index idx_job_applications_developer on public.job_applications (developer_id);

-- RLS
alter table public.jobs enable row level security;

create policy "Anyone can read open jobs"
  on public.jobs for select
  using (status = 'open' or company_id = auth.uid());

create policy "Company can insert own jobs"
  on public.jobs for insert
  with check (auth.uid() = company_id);

create policy "Company can update own jobs"
  on public.jobs for update
  using (auth.uid() = company_id)
  with check (auth.uid() = company_id);

alter table public.job_applications enable row level security;

create policy "Applicant and job company can read applications"
  on public.job_applications for select
  using (
    developer_id = auth.uid()
    or job_id in (select id from public.jobs where company_id = auth.uid())
  );

create policy "Developer can insert own application"
  on public.job_applications for insert
  with check (auth.uid() = developer_id);

create policy "Company can update applications for own jobs"
  on public.job_applications for update
  using (
    job_id in (select id from public.jobs where company_id = auth.uid())
  );
