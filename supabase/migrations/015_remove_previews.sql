-- Remove all preview deployment fields and statuses from submissions.

alter table public.submissions
  drop column if exists preview_status,
  drop column if exists preview_deployment_id,
  drop column if exists preview_error,
  drop column if exists preview_url;

drop index if exists public.idx_submissions_preview_status;

alter table public.submissions drop constraint if exists submissions_status_check;

-- Migrate preview statuses to valid values (so existing rows satisfy the new check)
update public.submissions
set status = 'submitted'
where status in ('preview_building', 'preview_ready', 'preview_failed');

alter table public.submissions
  add constraint submissions_status_check check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'approved',
      'payment_required',
      'delivered'
    )
  );
