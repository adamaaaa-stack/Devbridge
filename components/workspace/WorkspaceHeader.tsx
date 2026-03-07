import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkspaceWithParticipants } from "@/lib/types";
import type { WorkspaceStatus } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

interface WorkspaceHeaderProps {
  workspace: WorkspaceWithParticipants;
}

const statusVariant: Record<WorkspaceStatus, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  awaiting_student_confirmation: "outline",
  active: "default",
  completed: "secondary",
  cancelled: "outline",
};

export function WorkspaceHeader({ workspace }: WorkspaceHeaderProps) {
  const companyName = workspace.company.display_name ?? "Company";
  const studentName = workspace.student.display_name ?? "Student";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" className="shrink-0" asChild>
            <Link href="/messages" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <h2 className="min-w-0 truncate text-lg font-semibold tracking-tight sm:text-xl">
            {workspace.title}
          </h2>
        </div>
        <Badge variant={statusVariant[workspace.status] ?? "secondary"} className="w-fit shrink-0">
          {workspace.status.replace(/_/g, " ")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-3 text-sm sm:gap-4">
          <div>
            <span className="text-muted-foreground">Company: </span>
            <span className="font-medium">{companyName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Student: </span>
            <span className="font-medium">{studentName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Scope: </span>
            <span className="font-medium">{workspace.total_budget}</span>
          </div>
          {(workspace.start_date || workspace.end_date) && (
            <div>
              <span className="text-muted-foreground">Dates: </span>
              <span className="font-medium">
                {workspace.start_date ?? "—"} to {workspace.end_date ?? "—"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
