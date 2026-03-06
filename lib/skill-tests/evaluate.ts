/**
 * Evaluate a code submission against a task using OpenRouter (DeepSeek R1).
 */

import { chatCompletion } from "@/lib/openrouter/client";

export interface EvaluationResult {
  score: number;
  passed: boolean;
  feedback: string;
  strengths?: string[];
  improvements?: string[];
}

const EVAL_PROMPT = `You are evaluating a coding test.

Task:
{{task_prompt}}

Developer submission:
{{code}}

Evaluate the solution.

Return JSON only (no other text):

{
  "score": 0-100,
  "passed": true or false,
  "feedback": "short explanation",
  "strengths": ["..."],
  "improvements": ["..."]
}

Be strict and realistic. Passing should mean the solution correctly addresses the task.`;

function parseEvaluationPayload(raw: string): EvaluationResult {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0]! : trimmed;
  const parsed = JSON.parse(jsonStr) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid evaluation response");
  }
  const p = parsed as Record<string, unknown>;
  const score = typeof p.score === "number" ? Math.max(0, Math.min(100, p.score)) : 0;
  const passed = Boolean(p.passed);
  const feedback = typeof p.feedback === "string" ? p.feedback : "";
  const strengths = Array.isArray(p.strengths) ? (p.strengths as string[]) : undefined;
  const improvements = Array.isArray(p.improvements) ? (p.improvements as string[]) : undefined;
  return { score, passed, feedback, strengths, improvements };
}

export async function evaluateSubmission(
  taskPrompt: string,
  codeSubmission: string
): Promise<EvaluationResult> {
  const prompt = EVAL_PROMPT.replace("{{task_prompt}}", taskPrompt).replace(
    "{{code}}",
    codeSubmission
  );

  const raw = await chatCompletion(
    [{ role: "user", content: prompt }],
    { maxTokens: 1024, responseFormat: "json_object" }
  );

  return parseEvaluationPayload(raw);
}
