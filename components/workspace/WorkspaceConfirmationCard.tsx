"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  sendForConfirmationAction,
  studentAcceptAction,
  studentRequestChangesAction,
} from "@/app/workspace/actions";
import type { WorkspaceWithParticipants } from "@/lib/types";

interface WorkspaceConfirmationCardProps {
  workspace: WorkspaceWithParticipants;
  currentUserId: string;
}

export function WorkspaceConfirmationCard({
  workspace,
  currentUserId,
}: WorkspaceConfirmationCardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isCompany = workspace.company_id === currentUserId;

  async function handleSendForConfirmation() {
    setError(null);
    const result = await sendForConfirmationAction(workspace.id);
    if (result && "error" in result && typeof result.error === "string") {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAccept() {
    setError(null);
    const result = await studentAcceptAction(workspace.id);
    if (result && "error" in result && typeof result.error === "string") {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleRequestChanges() {
    setError(null);
    const result = await studentRequestChangesAction(workspace.id);
    if (result && "error" in result && typeof result.error === "string") {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (workspace.status !== "draft" && workspace.status !== "awaiting_student_confirmation") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation</CardTitle>
        <CardDescription>
          {workspace.status === "draft" && isCompany &&
            "Send the workspace to the student to confirm scope before starting."}
          {workspace.status === "awaiting_student_confirmation" && !isCompany &&
            "Review the project scope. Accept to start or request changes."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {isCompany && workspace.status === "draft" && (
          <Button size="sm" onClick={handleSendForConfirmation}>
            Send to student for confirmation
          </Button>
        )}
        {!isCompany && workspace.status === "awaiting_student_confirmation" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept}>
              Accept workspace
            </Button>
            <Button size="sm" variant="outline" onClick={handleRequestChanges}>
              Request changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
