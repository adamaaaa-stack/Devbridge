import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getWorkspaceById,
  getWorkspaceMessages,
  markWorkspaceMessagesRead,
  getWorkspaceReview,
  getWorkspaceContextFiles,
} from "@/lib/workspaces";
import { getWorkspaceActivity } from "@/lib/workspace-activity";
import { getSubmissionsForWorkspace } from "@/lib/escrow/submissions";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceConfirmationCard } from "@/components/workspace/WorkspaceConfirmationCard";
import { WorkspaceTimeline } from "@/components/workspace/WorkspaceTimeline";
import { CompleteWorkspaceCard } from "@/components/workspace/CompleteWorkspaceCard";
import { LeaveReviewCard } from "@/components/workspace/LeaveReviewCard";
import { ProjectContextCard } from "@/components/workspace/ProjectContextCard";
import { ContextFilesCard } from "@/components/workspace/ContextFilesCard";
import { RunInstructionsCard } from "@/components/workspace/RunInstructionsCard";
import { WorkspaceChatWindow } from "@/components/workspace/WorkspaceChatWindow";
import { WorkspaceMessageComposer } from "@/components/workspace/WorkspaceMessageComposer";
import { SubmitSolutionCard } from "@/components/escrow/SubmitSolutionCard";
import { SubmissionReviewCard } from "@/components/escrow/SubmissionReviewCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const workspaceId = params.id;

  const workspace = await getWorkspaceById(workspaceId, user.id);
  if (!workspace) {
    redirect("/messages");
  }

  const [messages, submissions, activity, existingReview, contextFiles] = await Promise.all([
    getWorkspaceMessages(workspaceId, user.id),
    getSubmissionsForWorkspace(workspaceId, user.id),
    getWorkspaceActivity(workspaceId, user.id),
    getWorkspaceReview(workspaceId),
    getWorkspaceContextFiles(workspaceId, user.id),
  ]);

  await markWorkspaceMessagesRead(workspaceId, user.id);

  const isCompany = workspace.company_id === user.id;
  const otherParticipant =
    workspace.company_id === user.id ? workspace.student : workspace.company;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <WorkspaceHeader workspace={workspace} />

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project overview</CardTitle>
              <CardDescription>Scope and tech stack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {workspace.description}
              </p>
              {workspace.tech_stack?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {workspace.tech_stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <ProjectContextCard
            workspaceId={workspaceId}
            context={workspace.context ?? null}
            isCompany={isCompany}
          />

          <ContextFilesCard
            workspaceId={workspaceId}
            initialFiles={contextFiles}
            isCompany={isCompany}
          />

          <RunInstructionsCard
            workspaceId={workspaceId}
            runInstructions={workspace.run_instructions ?? null}
            isCompany={isCompany}
          />

          <WorkspaceConfirmationCard
            workspace={workspace}
            currentUserId={user.id}
          />

          {workspace.status === "active" && isCompany && (
            <CompleteWorkspaceCard workspaceId={workspaceId} />
          )}
          {workspace.status === "active" && (
            isCompany ? (
              <SubmissionReviewCard
                workspaceId={workspaceId}
                submissions={submissions}
              />
            ) : (
              <SubmitSolutionCard
                workspaceId={workspaceId}
                submissions={submissions}
              />
            )
          )}

          {workspace.status === "completed" && isCompany && (
            <LeaveReviewCard
              workspaceId={workspaceId}
              existingReview={existingReview}
            />
          )}

          <WorkspaceTimeline events={activity} />
        </div>

        <Card className="flex min-h-[280px] flex-col overflow-hidden sm:min-h-[320px]">
          <CardHeader className="shrink-0">
            <CardTitle>Workspace chat</CardTitle>
            <CardDescription>Project-specific messages</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <div className="flex min-h-[200px] flex-1 flex-col sm:min-h-[280px]">
              <WorkspaceChatWindow
                workspaceId={workspaceId}
                currentUserId={user.id}
                initialMessages={messages}
                otherParticipant={otherParticipant}
              />
              <WorkspaceMessageComposer
                workspaceId={workspaceId}
                currentUserId={user.id}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
