-- Workspace project context: context text, run instructions, and context files.
-- Create Storage bucket "workspace-context-files" (private) in Supabase Dashboard if not exists.

alter table public.workspaces
  add column if not exists context text,
  add column if not exists run_instructions text;

create table public.workspace_context_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  file_path text not null,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_workspace_context_files_workspace on public.workspace_context_files (workspace_id);

alter table public.workspace_context_files enable row level security;

create policy "Workspace participants can read context files"
  on public.workspace_context_files for select
  using (
    workspace_id in (
      select id from public.workspaces
      where company_id = auth.uid() or student_id = auth.uid()
    )
  );

create policy "Company can insert context files"
  on public.workspace_context_files for insert
  with check (
    workspace_id in (
      select id from public.workspaces where company_id = auth.uid()
    )
    and uploaded_by = auth.uid()
  );

create policy "Company can delete own workspace context files"
  on public.workspace_context_files for delete
  using (
    workspace_id in (
      select id from public.workspaces where company_id = auth.uid()
    )
  );
