import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { listJobsForAdmin } from "@/lib/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminJobActions } from "./AdminJobActions";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

export default async function AdminJobsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const jobs = await listJobsForAdmin();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-muted-foreground hover:underline">Back to Admin</Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">Moderate job listings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All jobs</CardTitle>
          <CardDescription>Delete inappropriate listings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {jobs.map((j) => (
              <div key={j.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <Link href={`/jobs/${j.id}`} className="font-medium hover:underline">{j.title}</Link>
                  <Badge variant="secondary" className="ml-2">{j.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(j.created_at)}</p>
                </div>
                <AdminJobActions jobId={j.id} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
