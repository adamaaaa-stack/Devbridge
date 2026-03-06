"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface CodeSubmissionEditorProps {
  onSubmit: (code: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function CodeSubmissionEditor({
  onSubmit,
  disabled = false,
  placeholder = "// Write your solution here...",
}: CodeSubmissionEditorProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter your code before submitting.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(trimmed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={16}
        className="w-full rounded-md border border-input bg-muted/30 font-mono text-sm tab-size-2 focus:outline-none focus:ring-2 focus:ring-ring px-3 py-3"
        spellCheck={false}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handleSubmit}
        disabled={disabled || loading}
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Evaluating…
          </>
        ) : (
          "Submit solution"
        )}
      </Button>
    </div>
  );
}
