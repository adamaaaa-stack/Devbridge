"use client";

import { useState } from "react";
import { TakeTestFlow } from "@/components/skill-tests/TakeTestFlow";
import type { Skill } from "@/lib/types";

interface TestsPageClientProps {
  skills: Skill[];
  developerLevels: Record<string, number>;
}

export function TestsPageClient({
  skills,
  developerLevels,
}: TestsPageClientProps) {
  const [showFlow, setShowFlow] = useState(true);

  return (
    <TakeTestFlow
      skills={skills}
      developerLevels={developerLevels}
      onBack={() => setShowFlow(true)}
    />
  );
}
