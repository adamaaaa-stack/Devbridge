"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/lib/types";
import { ChevronRight } from "lucide-react";

export interface SkillLevelProgressProps {
  skill: Skill;
  currentLevel: number;
  onTakeNextTest: (skillId: string, skillSlug: string, nextLevel: number) => void;
  loading?: boolean;
}

export function SkillLevelProgress({
  skill,
  currentLevel,
  onTakeNextTest,
  loading = false,
}: SkillLevelProgressProps) {
  const nextLevel = currentLevel + 1;
  const canTakeNext = nextLevel <= 10;

  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{skill.name}</CardTitle>
        <span className="text-sm text-muted-foreground">
          Level {currentLevel === 0 ? "0 (not started)" : currentLevel}
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        {canTakeNext ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-between"
            onClick={() => onTakeNextTest(skill.id, skill.slug, nextLevel)}
            disabled={loading}
          >
            Take Level {nextLevel} test
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">All levels completed (10/10)</p>
        )}
      </CardContent>
    </Card>
  );
}
