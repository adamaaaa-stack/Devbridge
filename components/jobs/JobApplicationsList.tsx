"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink, UserCheck } from "lucide-react";

type App = {
  id: string;
  job_id: string;
  developer_id: string;
  message: string | null;
  portfolio_link: string | null;
  status: string;
  created_at: string;
  developer_name?: string | null;
  developer_bio?: string | null;
};

export function JobApplicationsList({
  jobId,
  applications,
}: {
  jobId: string;
  applications: App[];
}) {
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept(applicationId: string) {
    setError(null);
    setAcceptingId(applicationId);
    try {
      const res = await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept");
      if (data.workspaceId) {
        window.location.href = `/workspace/${data.workspaceId}`;
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
        <CardDescription>
          {applications.length === 0
            ? "No applications yet."
            : `${applications.length} application${applications.length !== 1 ? "s" : ""}. Accept one to create a workspace and start the project.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">When developers apply, they will appear here.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/developers/${app.developer_id}`}
                      className="font-medium hover:underline"
                    >
                      {app.developer_name ?? "Developer"}
                    </Link>
                    <Badge variant="secondary" className="ml-2 capitalize text-xs">
                      {app.status}
                    </Badge>
                  </div>
                  {app.status === "applied" || app.status === "shortlisted" ? (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAccept(app.id)}
                      disabled={acceptingId !== null}
                    >
                      <UserCheck className="h-4 w-4" />
                      {acceptingId === app.id ? "Creating workspace…" : "Accept & create workspace"}
                    </Button>
                  ) : null}
                </div>
                {app.developer_bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{app.developer_bio}</p>
                )}
                {app.message && (
                  <p className="text-sm whitespace-pre-wrap">{app.message}</p>
                )}
                {app.portfolio_link && (
                  <a
                    href={app.portfolio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Portfolio <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
