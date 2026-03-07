"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Unlock } from "lucide-react";

interface UnlockCodeButtonProps {
  submissionId: string;
}

export function UnlockCodeButton({ submissionId }: UnlockCodeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/code-escrow/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_id: submissionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to open checkout");
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setError("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        size="sm"
        className="gap-2"
        onClick={handleUnlock}
        disabled={loading}
      >
        <Unlock className="h-4 w-4" />
        {loading ? "Opening checkout…" : "Unlock code (pay with Lemon Squeezy)"}
      </Button>
    </div>
  );
}
