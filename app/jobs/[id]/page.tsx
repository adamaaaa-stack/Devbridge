import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, getApplicationsForJob, getMyApplicationForJob } from "@/lib/jobs";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { ApplyToJobForm } from "@/components/jobs/ApplyToJobForm";
import { JobApplicationsList } from "@/components/jobs/JobApplicationsList";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, profile] = await Promise.all([
    getJobById(params.id),
    getCurrentProfile(),
  ]);
  if (!job) notFound();

  const isCompany = profile?.id === job.company_id;
  const isDeveloper = profile?.role === "student";

  const [applications, myApplication] = await Promise.all([
    isCompany && profile ? getApplicationsForJob(job.id, profile.id) : Promise.resolve([]),
    isDeveloper && profile ? getMyApplicationForJob(job.id, profile.id) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/jobs" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <Badge variant={job.status === "open" ? "default" : "secondary"}>
              {job.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <CardDescription>
            {job.company_name ?? "Company"}
            {job.skill_required && ` · ${job.skill_required}`}
            {job.estimated_hours != null && ` · ~${job.estimated_hours}h`}
            {job.difficulty && ` · ${job.difficulty}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {job.description}
          </p>
        </CardContent>
      </Card>

      {isCompany && (
        <JobApplicationsList
          jobId={job.id}
          applications={applications}
        />
      )}

      {isDeveloper && job.status === "open" && (
        <Card>
          <CardHeader>
            <CardTitle>Apply</CardTitle>
            <CardDescription>
              {myApplication
                ? `You applied on ${new Date(myApplication.created_at).toLocaleDateString()}. Status: ${myApplication.status}.`
                : "Send a message and optional portfolio link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myApplication ? (
              <p className="text-sm text-muted-foreground">
                Your application is {myApplication.status}. The company may contact you via messages.
              </p>
            ) : (
              <ApplyToJobForm jobId={job.id} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
