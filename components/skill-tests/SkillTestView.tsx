"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeSubmissionEditor } from "./CodeSubmissionEditor";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export interface TaskData {
  id: string;
  title: string;
  prompt: string;
  description: string | null;
  requirements: string[];
  expected_output: string | null;
  evaluation_rules: string | null;
  skill_name?: string;
  level?: number;
}

export interface SkillTestViewProps {
  task: TaskData;
  skillName: string;
  level: number;
  onSubmit: (taskId: string, code: string) => Promise<{
    score: number;
    passed: boolean;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
  }>;
  onBack: () => void;
}

export function SkillTestView({
  task,
  skillName,
  level,
  onSubmit,
  onBack,
}: SkillTestViewProps) {
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
  } | null>(null);

  async function handleSubmit(code: string) {
    const res = await onSubmit(task.id, code);
    setResult(res);
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {skillName} — Level {level}
              </p>
              <CardTitle className="mt-1">{task.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="mt-1 whitespace-pre-wrap text-sm">{task.description}</p>
            </div>
          )}
          {task.requirements?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Requirements</h4>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
                {task.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {task.expected_output && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Expected output</h4>
              <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-3 text-xs">
                {task.expected_output}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {result ? (
        <Card className={result.passed ? "border-green-500/50" : "border-amber-500/50"}>
          <CardHeader className="flex flex-row items-center gap-2">
            {result.passed ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-amber-600" />
            )}
            <CardTitle className="text-lg">
              {result.passed ? "Passed" : "Not passed"} — Score: {result.score}/100
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{result.feedback}</p>
            {result.strengths && result.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Strengths</h4>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.improvements && result.improvements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">Improvements</h4>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  {result.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onBack}>
              Back to skills
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your solution</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeSubmissionEditor onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
