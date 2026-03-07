-- Code unlock payments: track Lemon Squeezy checkouts and orders.

create table public.submission_payments (
  id uuid primary key default gen_random_uuid(),

  submission_id uuid not null references public.submissions(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  company_id uuid not null references public.profiles(id) on delete cascade,
  developer_id uuid not null references public.profiles(id) on delete cascade,

  lemonsqueezy_checkout_id text,
  lemonsqueezy_order_id text,

  amount_cents int,
  currency text not null default 'USD',

  status text not null check (
    status in (
      'pending',
      'paid',
      'failed',
      'refunded'
    )
  ) default 'pending',

  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_submission_payments_submission on public.submission_payments (submission_id);
create index idx_submission_payments_order on public.submission_payments (lemonsqueezy_order_id);
create unique index idx_submission_payments_submission_unique on public.submission_payments (submission_id);

alter table public.submission_payments enable row level security;

create policy "Workspace participants can read submission_payments"
  on public.submission_payments for select
  using (
    workspace_id in (
      select id from public.workspaces
      where company_id = auth.uid() or student_id = auth.uid()
    )
  );

-- Inserts/updates via server (service role) only for payment flow
