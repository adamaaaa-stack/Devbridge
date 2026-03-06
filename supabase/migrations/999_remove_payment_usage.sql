-- Remove payment-related tables and simplify workspace/milestone statuses.
-- App no longer uses escrow, ledger, payouts, or funding.

-- Drop payment tables (order: respect FKs)
drop table if exists public.payout_transactions;
drop table if exists public.payout_accounts;
drop table if exists public.escrow_payments;
drop table if exists public.ledger_transactions;
drop table if exists public.accounts;

-- Simplify workspace status: collaboration-only (no funding_required, disputed)
-- Migrate existing payment-related statuses to collaboration equivalents
update public.workspaces set status = 'active' where status = 'funding_required';
update public.workspaces set status = 'cancelled' where status = 'disputed';

alter table public.workspaces
  drop constraint if exists workspaces_status_check;

alter table public.workspaces
  add constraint workspaces_status_check check (
    status in (
      'draft',
      'awaiting_student_confirmation',
      'active',
      'completed',
      'cancelled'
    )
  );

-- Simplify milestone status: remove 'paid'
update public.milestones set status = 'approved' where status = 'paid';

alter table public.milestones
  drop constraint if exists milestones_status_check;

alter table public.milestones
  add constraint milestones_status_check check (
    status in (
      'draft',
      'pending_student_confirmation',
      'active',
      'submitted',
      'approved',
      'rejected',
      'cancelled'
    )
  );

-- Milestone amount no longer used for payments; allow 0, default 0
alter table public.milestones
  drop constraint if exists milestones_amount_check;

alter table public.milestones
  add constraint milestones_amount_check check (amount >= 0);

alter table public.milestones
  alter column amount set default 0;
