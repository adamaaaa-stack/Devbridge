"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillRequired, setSkillRequired] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [difficulty, setDifficulty] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          skill_required: skillRequired.trim() || null,
          skill_level: skillLevel.trim() ? parseInt(skillLevel, 10) : null,
          estimated_hours: estimatedHours.trim() ? parseInt(estimatedHours, 10) : null,
          difficulty: difficulty.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }
      if (data.job?.id) {
        router.push(`/jobs/${data.job.id}`);
      } else {
        router.push("/jobs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React front-end task"
              required
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you need built, scope, expectations..."
              required
              rows={4}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Skill required</label>
            <Input
              value={skillRequired}
              onChange={(e) => setSkillRequired(e.target.value)}
              placeholder="e.g. React, Python"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Skill level (1–10)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              placeholder="Optional"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Estimated hours</label>
            <Input
              type="number"
              min={1}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="Optional"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Difficulty</label>
            <Input
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              placeholder="e.g. beginner, intermediate"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Post job"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
