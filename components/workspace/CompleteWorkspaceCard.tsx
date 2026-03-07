"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { completeWorkspaceAction } from "@/app/workspace/actions";

interface CompleteWorkspaceCardProps {
  workspaceId: string;
}

export function CompleteWorkspaceCard({ workspaceId }: CompleteWorkspaceCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    if (!confirm("Mark this workspace as completed? This will add a verified project to the developer profile.")) return;
    setError(null);
    setLoading(true);
    const result = await completeWorkspaceAction(workspaceId);
    setLoading(false);
    if (result && "error" in result && typeof result.error === "string") {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete workspace</CardTitle>
        <CardDescription>
          When the project is done, mark it complete. The developer will get a verified project entry and you can leave a review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <Button size="sm" onClick={handleComplete} disabled={loading}>
          {loading ? "Completing…" : "Mark as completed"}
        </Button>
      </CardContent>
    </Card>
  );
}
