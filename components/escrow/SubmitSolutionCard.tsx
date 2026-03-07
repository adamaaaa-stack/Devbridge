"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Upload } from "lucide-react";

export interface SubmissionItem {
  id: string;
  status: string;
  repo_url: string | null;
  preview_url: string | null;
  description: string | null;
  created_at: string;
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
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          preview_url: previewUrl.trim() || null,
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
      setPreviewUrl("");
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
          Upload your code and share a preview URL so the company can test before payment. Source code is locked until payment.
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
            <label className="text-sm font-medium">Preview URL</label>
            <Input
              type="url"
              placeholder="https://preview.example.com or preview.devbridge.app/..."
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
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
                  className="flex items-center justify-between rounded border border-border bg-muted/20 px-3 py-2 text-sm"
                >
                  <span className="capitalize">{s.status.replace(/_/g, " ")}</span>
                  <div className="flex gap-2">
                    {s.preview_url && (
                      <a
                        href={s.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Preview <ExternalLink className="h-3 w-3" />
                      </a>
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
