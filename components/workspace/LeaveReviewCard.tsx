"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { leaveReviewAction } from "@/app/workspace/actions";

interface LeaveReviewCardProps {
  workspaceId: string;
  existingReview: { rating: number; review_text: string | null } | null;
}

export function LeaveReviewCard({ workspaceId, existingReview }: LeaveReviewCardProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5.");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await leaveReviewAction(workspaceId, rating, reviewText.trim() || null);
    setLoading(false);
    if (result && "error" in result && typeof result.error === "string") {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (existingReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your review</CardTitle>
          <CardDescription>You left a {existingReview.rating}/5 review for this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {existingReview.review_text && (
            <p className="text-sm text-muted-foreground">{existingReview.review_text}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate the developer</CardTitle>
        <CardDescription>
          Leave a rating (1–5) and optional review. This will appear on the developer's profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="mb-2 block text-sm font-medium">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${
                  rating === n
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Review (optional)</label>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="How was the collaboration?"
            rows={3}
            className="resize-none"
          />
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting…" : "Submit review"}
        </Button>
      </CardContent>
    </Card>
  );
}
