"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";

export function CreateProfileStep() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateProfile(role: "student" | "company") {
    setError(null);
    setLoading(role);
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Please log in again.");
      setLoading(null);
      return;
    }
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      role,
      onboarding_complete: false,
    });
    if (insertError) {
      setError(insertError.message ?? "Failed to create profile");
      setLoading(null);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create your profile</CardTitle>
        <CardDescription>
          Choose how you want to use Codeveria. You can complete your profile in the next step.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 py-4"
            onClick={() => handleCreateProfile("student")}
            disabled={loading !== null}
          >
            <User className="h-5 w-5 shrink-0" />
            <span className="text-left">
              <strong>Student / Developer</strong>
              <br />
              <span className="text-muted-foreground text-sm">Find work and get hired by companies</span>
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 py-4"
            onClick={() => handleCreateProfile("company")}
            disabled={loading !== null}
          >
            <Building2 className="h-5 w-5 shrink-0" />
            <span className="text-left">
              <strong>Company</strong>
              <br />
              <span className="text-muted-foreground text-sm">Hire verified student developers</span>
            </span>
          </Button>
        </div>
        {loading && (
          <p className="text-sm text-muted-foreground">Creating profile…</p>
        )}
      </CardContent>
    </Card>
  );
}
