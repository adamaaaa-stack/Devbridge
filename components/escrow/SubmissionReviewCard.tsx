"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download } from "lucide-react";
import { PreviewStatusBadge } from "@/components/workspace/PreviewStatusBadge";
import { UnlockCodeButton } from "@/components/workspace/UnlockCodeButton";

export interface SubmissionReviewItem {
  id: string;
  status: string;
  repo_url: string | null;
  preview_url: string | null;
  description: string | null;
  created_at: string;
  preview_status?: string | null;
  preview_error?: string | null;
  escrow?: { payment_status: string; code_access_granted: boolean } | null;
}

interface SubmissionReviewCardProps {
  workspaceId: string;
  submissions: SubmissionReviewItem[];
}

export function SubmissionReviewCard({
  submissions,
}: SubmissionReviewCardProps) {
  const router = useRouter();
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function handleReview(submissionId: string, approved: boolean) {
    setError(null);
    setReviewLoadingId(submissionId);
    try {
      const res = await fetch("/api/submissions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          approved,
          review_notes: reviewNotes[submissionId] || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setReviewLoadingId(null);
    }
  }

  async function handleDownload(submissionId: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/submissions/download?submission_id=${encodeURIComponent(submissionId)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download failed");
      if (data.url) window.open(data.url, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const reviewable = submissions.filter(
    (s) =>
      s.status === "submitted" ||
      s.status === "preview_ready" ||
      s.status === "preview_building" ||
      s.status === "under_review"
  );
  const paymentRequired = submissions.filter(
    (s) => s.status === "approved" || s.status === "payment_required"
  );
  const delivered = submissions.filter(
    (s) => s.status === "delivered" || s.escrow?.code_access_granted
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission review</CardTitle>
        <CardDescription>
          Test the preview, then approve or request changes. Source code unlocks only after payment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No submissions yet. The developer will submit a solution with a preview link.
          </p>
        ) : (
          <ul className="space-y-4">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {s.status.replace(/_/g, " ")}
                    </Badge>
                    <PreviewStatusBadge status={s.preview_status} />
                  </div>
                  {s.preview_url && (
                    <a
                      href={s.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open preview <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {s.preview_error && (
                  <p className="text-sm text-destructive">{s.preview_error}</p>
                )}
                {s.description && (
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                )}

                {(s.status === "submitted" ||
                  s.status === "preview_ready" ||
                  s.status === "preview_building" ||
                  s.status === "under_review") && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Review notes (optional)"
                      value={reviewNotes[s.id] ?? ""}
                      onChange={(e) =>
                        setReviewNotes((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(s.id, true)}
                        disabled={reviewLoadingId === s.id}
                      >
                        {reviewLoadingId === s.id ? "Saving…" : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(s.id, false)}
                        disabled={reviewLoadingId === s.id}
                      >
                        Request changes
                      </Button>
                    </div>
                  </div>
                )}

                {(s.status === "approved" || s.status === "payment_required") && (
                  <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                    <p className="font-medium">Payment required to unlock source code.</p>
                    <UnlockCodeButton submissionId={s.id} />
                  </div>
                )}

                {(s.status === "delivered" || s.escrow?.code_access_granted) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownload(s.id)}
                  >
                    <Download className="h-4 w-4" />
                    Download source code
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
