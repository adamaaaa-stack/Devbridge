-- Preview deployments: add fields to submissions and extend status for building/failed.

-- Add preview-related columns to submissions
alter table public.submissions
  add column if not exists preview_status text check (
    preview_status in (
      'not_started',
      'building',
      'ready',
      'failed'
    )
  ) default 'not_started',
  add column if not exists preview_deployment_id text,
  add column if not exists preview_error text;

-- preview_url already exists on submissions; ensure we have it
-- (no change if column exists)

-- Extend submission status check to include preview_building and preview_failed
alter table public.submissions drop constraint if exists submissions_status_check;

alter table public.submissions
  add constraint submissions_status_check check (
    status in (
      'draft',
      'submitted',
      'preview_building',
      'preview_ready',
      'preview_failed',
      'under_review',
      'approved',
      'payment_required',
      'delivered'
    )
  );

create index if not exists idx_submissions_preview_status on public.submissions (preview_status);
