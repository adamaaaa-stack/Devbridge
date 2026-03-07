"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RunInstructionsCardProps {
  workspaceId: string;
  runInstructions: string | null;
  isCompany: boolean;
}

export function RunInstructionsCard({
  workspaceId,
  runInstructions,
  isCompany,
}: RunInstructionsCardProps) {
  const router = useRouter();
  const [value, setValue] = useState(runInstructions ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/context`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_instructions: value || null }),
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
        <CardTitle>Run instructions</CardTitle>
        <CardDescription>
          How to install dependencies and run the project locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {isCompany ? (
          <>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g.&#10;npm install&#10;npm run dev"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
            />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save instructions"}
            </Button>
          </>
        ) : (
          <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 font-mono text-sm text-muted-foreground">
            {runInstructions?.trim() || "No run instructions added yet."}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
