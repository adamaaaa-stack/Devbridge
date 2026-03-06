import { redirect } from "next/navigation";
import { getSkills } from "@/lib/developers";
import { getDeveloperSkillLevels } from "@/lib/skill-tests";
import { getCurrentUser } from "@/lib/auth";
import { TestsPageClient } from "./TestsPageClient";

export default async function TestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [skills, developerLevelsRows] = await Promise.all([
    getSkills(),
    getDeveloperSkillLevels(user.id),
  ]);

  const developerLevels: Record<string, number> = {};
  for (const row of developerLevelsRows) {
    developerLevels[row.skill_id] = row.current_level;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skill tests</h1>
        <p className="text-muted-foreground">
          Prove your skills with AI-generated coding challenges. Each skill has
          levels 1–10. Pass a test to unlock the next level.
        </p>
      </div>
      <TestsPageClient
        skills={skills}
        developerLevels={developerLevels}
      />
    </div>
  );
}
