import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/auth";
import { CreateJobForm } from "@/components/jobs/CreateJobForm";

export default async function CreateJobPage() {
  const [user, profile] = await Promise.all([requireUser(), getCurrentProfile()]);
  if (profile?.role !== "company") redirect("/jobs");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a job</h1>
        <p className="text-muted-foreground">
          Describe the role and skills needed. Developers can apply and you can accept to start a workspace.
        </p>
      </div>
      <CreateJobForm />
    </div>
  );
}
