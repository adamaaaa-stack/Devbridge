"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, CheckCircle } from "lucide-react";

export interface SubmissionItem {
  id: string;
  status: string;
  repo_url: string | null;
  description: string | null;
  created_at: string;
  escrow?: {
    code_access_granted: boolean;
    company_payment_confirmed: boolean;
    developer_payment_confirmed: boolean;
  } | null;
}

interface SubmitSolutionCardProps {
  workspaceId: string;
  submissions: SubmissionItem[];
}

export function SubmitSolutionCard({
  workspaceId,
  submissions,
}: SubmitSolutionCardProps) {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmReceivedLoadingId, setConfirmReceivedLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmPaymentReceived(submissionId: string) {
    setError(null);
    setConfirmReceivedLoadingId(submissionId);
    try {
      const res = await fetch("/api/submissions/confirm-payment-developer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submissionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Confirmation failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setConfirmReceivedLoadingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const createRes = await fetch("/api/submissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: workspaceId,
          repo_url: repoUrl.trim() || null,
          description: description.trim() || null,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create submission");
      }
      const submissionId = createData.submission?.id;
      if (!submissionId) throw new Error("No submission id returned");

      if (file && file.size > 0) {
        const form = new FormData();
        form.set("submission_id", submissionId);
        form.set("workspace_id", workspaceId);
        form.set("file", file);
        const uploadRes = await fetch("/api/submissions/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Upload failed");
        }
      }

      setRepoUrl("");
      setDescription("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit solution</CardTitle>
        <CardDescription>
          Upload your code and description. Payments are handled directly between you and the company. Both parties must confirm payment before the code is released.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div>
            <label className="text-sm font-medium">Repo URL (optional)</label>
            <Input
              type="url"
              placeholder="https://github.com/..."
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="What you built, how to test it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Source code (ZIP, optional now)</label>
            <Input
              type="file"
              accept=".zip,application/zip"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={loading} className="gap-2">
            <Upload className="h-4 w-4" />
            {loading ? "Submitting…" : "Submit solution"}
          </Button>
        </form>

        {submissions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium">Your submissions</h4>
            <ul className="mt-2 space-y-2">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-muted/20 px-3 py-2 text-sm"
                >
                  <span className="capitalize">{s.status.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    {(s.status === "approved" || s.status === "payment_required") && (
                      <div className="rounded border border-amber-500/30 bg-amber-500/5 px-2 py-1.5 text-xs space-y-1">
                        {s.escrow?.company_payment_confirmed && (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Company confirmed payment sent
                          </p>
                        )}
                        {s.escrow?.developer_payment_confirmed ? (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> You confirmed payment received
                          </p>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={confirmReceivedLoadingId === s.id}
                            onClick={() => handleConfirmPaymentReceived(s.id)}
                          >
                            {confirmReceivedLoadingId === s.id ? "Saving…" : "Confirm Payment Received"}
                          </Button>
                        )}
                        {s.escrow?.code_access_granted && (
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            Payment confirmed by both parties. Code is now available to the company.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
