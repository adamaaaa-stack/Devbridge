"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function JobFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const skill = searchParams.get("skill") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const estimated_hours = searchParams.get("estimated_hours") ?? "";

  function applyFilters(values: { search?: string; skill?: string; difficulty?: string; estimated_hours?: string }) {
    const params = new URLSearchParams();
    if (values.search?.trim()) params.set("search", values.search.trim());
    if (values.skill?.trim()) params.set("skill", values.skill.trim());
    if (values.difficulty?.trim()) params.set("difficulty", values.difficulty.trim());
    if (values.estimated_hours?.trim()) params.set("estimated_hours", values.estimated_hours.trim());
    router.push(`/jobs?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    applyFilters({
      search: (formData.get("search") as string) ?? undefined,
      skill: (formData.get("skill") as string) ?? undefined,
      difficulty: (formData.get("difficulty") as string) ?? undefined,
      estimated_hours: (formData.get("estimated_hours") as string) ?? undefined,
    });
  }

  return (
    <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          placeholder="Search jobs…"
          defaultValue={search}
          className="pl-9"
        />
      </div>
      <div className="w-[140px]">
        <Input
          name="skill"
          placeholder="Skill (e.g. React)"
          defaultValue={skill}
        />
      </div>
      <div className="w-[140px]">
        <select
          name="difficulty"
          defaultValue={difficulty || ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="w-[120px]">
        <Input
          name="estimated_hours"
          type="number"
          min={0}
          placeholder="Max hours"
          defaultValue={estimated_hours || ""}
        />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        Apply filters
      </Button>
    </form>
  );
}
