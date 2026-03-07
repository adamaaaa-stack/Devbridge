"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminJobActions({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/delete-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      Delete job
    </Button>
  );
}
