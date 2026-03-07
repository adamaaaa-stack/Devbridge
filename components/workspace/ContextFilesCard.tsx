"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2 } from "lucide-react";

interface ContextFile {
  id: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
}

interface ContextFilesCardProps {
  workspaceId: string;
  initialFiles: ContextFile[];
  isCompany: boolean;
}

function fileNameFromPath(path: string): string {
  const parts = path.split("/");
  const last = parts[parts.length - 1] ?? "file";
  const afterUnderscore = last.includes("_") ? last.split("_").slice(1).join("_") : last;
  return afterUnderscore || last;
}

export function ContextFilesCard({
  workspaceId,
  initialFiles,
  isCompany,
}: ContextFilesCardProps) {
  const router = useRouter();
  const [files, setFiles] = useState<ContextFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch(`/api/workspaces/${workspaceId}/context-files`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setFiles((prev) => [
        { id: data.id, file_path: data.file_path, uploaded_by: "", created_at: new Date().toISOString() },
        ...prev,
      ]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDownload(fileId: string) {
    setError(null);
    setDownloadingId(fileId);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/context-files/${fileId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Download failed");
      if (data.url) window.open(data.url, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context files</CardTitle>
        <CardDescription>
          Reference files for the project. Developers can download them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {isCompany && (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Upload file"}
            </Button>
          </div>
        )}
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No context files yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
              >
                <span className="truncate">{fileNameFromPath(f.file_path)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 shrink-0"
                  onClick={() => handleDownload(f.id)}
                  disabled={downloadingId === f.id}
                >
                  {downloadingId === f.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
