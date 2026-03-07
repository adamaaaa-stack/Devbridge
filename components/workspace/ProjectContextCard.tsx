"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProjectContextCardProps {
  workspaceId: string;
  context: string | null;
  isCompany: boolean;
}

export function ProjectContextCard({
  workspaceId,
  context,
  isCompany,
}: ProjectContextCardProps) {
  const router = useRouter();
  const [value, setValue] = useState(context ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/context`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: value || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project context</CardTitle>
        <CardDescription>
          Background, goals, and any extra context for the developer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {isCompany ? (
          <>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. This project is for our internal dashboard. Use our design system. The API base URL is..."
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save context"}
            </Button>
          </>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {context?.trim() || "No context added yet."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
