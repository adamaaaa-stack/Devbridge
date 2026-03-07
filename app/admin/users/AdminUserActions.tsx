"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminUserActions({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleBan() {
    if (!confirm(isBanned ? "Unban this user?" : "Ban this user? They will not be able to log in.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/ban-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, banned: !isBanned }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button
      variant={isBanned ? "outline" : "destructive"}
      size="sm"
      onClick={toggleBan}
      disabled={loading}
    >
      {isBanned ? "Unban" : "Ban"}
    </Button>
  );
}
