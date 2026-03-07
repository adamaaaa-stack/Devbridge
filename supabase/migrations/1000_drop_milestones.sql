-- Remove milestones feature: drop table and trigger.
-- Runs after 999_remove_payment_usage (which may alter milestones).

drop trigger if exists milestones_updated_at on public.milestones;
drop table if exists public.milestones;
