import Link from "next/link";
import { listOpenJobs } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth";
import { JobFilterBar } from "@/components/jobs/JobFilterBar";
import { Briefcase, Plus } from "lucide-react";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { search?: string; skill?: string; difficulty?: string; estimated_hours?: string };
}) {
  const params = searchParams ?? {};
  const filters = {
    search: params.search ?? null,
    skill: params.skill ?? null,
    difficulty: params.difficulty ?? null,
    estimated_hours_max: params.estimated_hours ? parseInt(params.estimated_hours, 10) : null,
  };
  const [jobs, profile] = await Promise.all([
    listOpenJobs(filters),
    getCurrentProfile(),
  ]);
  const isCompany = profile?.role === "company";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job board</h1>
          <p className="text-muted-foreground">
            Browse open roles from companies. Apply and start a conversation.
          </p>
        </div>
        {isCompany && (
          <Button asChild className="gap-2">
            <Link href="/jobs/create">
              <Plus className="h-4 w-4" />
              Post a job
            </Link>
          </Button>
        )}
      </div>

      <JobFilterBar />

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No open jobs yet</p>
            <p className="text-sm text-muted-foreground">
              {isCompany ? "Post the first job to find developers." : "Check back later or browse developers to message directly."}
            </p>
            {isCompany && (
              <Button asChild className="mt-4">
                <Link href="/jobs/create">Post a job</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="transition-colors hover:bg-muted/30">
              <Link href={`/jobs/${job.id}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{job.title}</CardTitle>
                  <CardDescription>
                    {job.company_name ?? "Company"}
                    {job.skill_required && <span className="ml-2">· {job.skill_required}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.estimated_hours != null && (
                      <Badge variant="secondary" className="text-xs">~{job.estimated_hours}h</Badge>
                    )}
                    {job.difficulty && (
                      <Badge variant="outline" className="text-xs">{job.difficulty}</Badge>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
