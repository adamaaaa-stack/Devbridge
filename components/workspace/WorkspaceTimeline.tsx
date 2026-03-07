"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatDate";
import type { WorkspaceActivityDb } from "@/lib/types";
import {
  CheckCircle2,
  FileCode2,
  LockOpen,
  MessageSquare,
  UserCheck,
  Users,
  FolderOpen,
} from "lucide-react";

const EVENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  workspace_created: { label: "Workspace created", icon: <FolderOpen className="h-4 w-4" /> },
  student_invited: { label: "Sent to student for confirmation", icon: <Users className="h-4 w-4" /> },
  student_accepted: { label: "Student accepted", icon: <UserCheck className="h-4 w-4" /> },
  submission_uploaded: { label: "Solution submitted", icon: <FileCode2 className="h-4 w-4" /> },
  submission_reviewed: { label: "Submission reviewed", icon: <MessageSquare className="h-4 w-4" /> },
  code_unlocked: { label: "Code unlocked", icon: <LockOpen className="h-4 w-4" /> },
  workspace_completed: { label: "Workspace completed", icon: <CheckCircle2 className="h-4 w-4" /> },
};

interface WorkspaceTimelineProps {
  events: WorkspaceActivityDb[];
}

export function WorkspaceTimeline({ events }: WorkspaceTimelineProps) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Chronological workspace events</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {events.map((e) => {
            const config = EVENT_LABELS[e.event_type] ?? {
              label: e.event_type,
              icon: <FolderOpen className="h-4 w-4" />,
            };
            return (
              <li key={e.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {config.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{config.label}</p>
                  {e.description && (
                    <p className="text-xs text-muted-foreground">{e.description}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(e.created_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
