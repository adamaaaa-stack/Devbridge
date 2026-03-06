"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Skill } from "@/lib/types";
import { Code2 } from "lucide-react";

export interface SkillCardProps {
  skill: Skill;
  currentLevel: number;
  onTakeTest: (skillId: string, skillSlug: string, level: number) => void;
  loading?: boolean;
}

export function SkillCard({
  skill,
  currentLevel,
  onTakeTest,
  loading = false,
}: SkillCardProps) {
  const nextLevel = currentLevel + 1;
  const canTake = nextLevel <= 10;

  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-medium">{skill.name}</CardTitle>
        </div>
        <span className="text-sm text-muted-foreground">
          Level {currentLevel}/10
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        {canTake ? (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onTakeTest(skill.id, skill.slug, nextLevel)}
            disabled={loading}
          >
            Take Level {nextLevel} test
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Completed</p>
        )}
      </CardContent>
    </Card>
  );
}
