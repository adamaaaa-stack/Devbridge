"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkspaceCTA } from "@/components/workspace/WorkspaceCTA";
import type { ParticipantSummary } from "@/lib/types";
import type { Workspace } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

interface ConversationHeaderProps {
  otherParticipant: ParticipantSummary;
  conversationId: string;
  studentId: string;
  workspaces: Workspace[];
  currentUserRole: "company" | "student";
}

export function ConversationHeader({
  otherParticipant,
  conversationId,
  studentId,
  workspaces,
  currentUserRole,
}: ConversationHeaderProps) {
  const name = otherParticipant.display_name ?? "Unknown";
  const initials = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/messages" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary sm:h-10 sm:w-10">
          {otherParticipant.avatar_url ? (
            <img
              src={otherParticipant.avatar_url}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {otherParticipant.role}
          </p>
        </div>
      </div>
      <div className="flex w-full shrink-0 basis-full flex-wrap items-center gap-2 sm:w-auto sm:basis-auto">
        <WorkspaceCTA
          conversationId={conversationId}
          studentId={studentId}
          workspaces={workspaces}
          currentUserRole={currentUserRole}
        />
      </div>
    </header>
  );
}
