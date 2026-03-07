"use client";

import { Badge } from "@/components/ui/badge";

type PreviewStatus = "not_started" | "building" | "ready" | "failed";

const LABELS: Record<string, string> = {
  not_started: "No preview",
  building: "Building…",
  ready: "Ready",
  failed: "Failed",
};

export function PreviewStatusBadge({ status }: { status?: PreviewStatus | string | null }) {
  const s = status ?? "not_started";
  const label = LABELS[s] ?? s;
  const variant = s === "ready" ? "default" : s === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}
