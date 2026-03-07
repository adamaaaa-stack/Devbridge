import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { listFlaggedSubmissions } from "@/lib/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

export default async function AdminReportsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const flagged = await listFlaggedSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">← Admin</Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Flagged tests</h1>
        <p className="text-muted-foreground">Skill test submissions flagged for review (e.g. suspicious solve time or duplicate code).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Flagged submissions</CardTitle>
          <CardDescription>Review and take action if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground">No flagged submissions.</p>
          ) : (
            <div className="space-y-2">
              {flagged.map((s) => {
                const started = s.time_started ? new Date(s.time_started).getTime() : null;
                const submitted = s.time_submitted ? new Date(s.time_submitted).getTime() : null;
                const solveSec = started != null && submitted != null ? (submitted - started) / 1000 : null;
                return (
                  <div
                    key={s.id}
                    className="rounded-lg border p-3 text-sm"
                  >
                    <p><strong>Submission</strong> {s.id.slice(0, 8)}…</p>
                    <p>Profile: {s.profile_id.slice(0, 8)}… · Task: {s.task_id.slice(0, 8)}…</p>
                    <p>Score: {s.score ?? "—"} · Passed: {s.passed ? "Yes" : "No"}</p>
                    {solveSec != null && (
                      <p>Solve time: {solveSec.toFixed(1)}s</p>
                    )}
                    <p className="text-muted-foreground">{formatDate(s.created_at)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
