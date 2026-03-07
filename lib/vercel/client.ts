/**
 * Vercel REST API client for deployments.
 * Used for preview deployments from submission repo URLs.
 */

const VERCEL_API = "https://api.vercel.com";

function getToken(): string {
  const token = process.env.VERCEL_TOKEN;
  if (!token?.trim()) throw new Error("VERCEL_TOKEN is not set");
  return token.trim();
}

function getTeamId(): string | null {
  const id = process.env.VERCEL_TEAM_ID?.trim();
  return id || null;
}

export interface CreateDeploymentOptions {
  name: string;
  repoUrl: string;
  ref?: string;
}

export interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState?: string;
}

/**
 * Parse GitHub repo URL into org/repo.
 * Supports https://github.com/org/repo, https://github.com/org/repo.git, git@github.com:org/repo.git
 */
export function parseGitHubRepo(repoUrl: string): { org: string; repo: string } | null {
  const trimmed = repoUrl.trim();
  const gitMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (gitMatch) {
    return { org: gitMatch[1], repo: gitMatch[2].replace(/\.git$/, "") };
  }
  const httpsMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+?)(?:\.git)?\/?(\?.*)?$/i);
  if (httpsMatch) {
    return { org: httpsMatch[1], repo: httpsMatch[2].replace(/\.git$/, "") };
  }
  return null;
}

/**
 * Create a new deployment from a GitHub repo.
 * Uses gitSource with org/repo/ref (no project link required for some Vercel setups).
 */
export async function createDeployment(
  options: CreateDeploymentOptions
): Promise<{ deploymentId: string; url: string; readyState: string } | { error: string }> {
  try {
    const parsed = parseGitHubRepo(options.repoUrl);
    if (!parsed) {
      return { error: "Invalid GitHub repo URL" };
    }

    const body: Record<string, unknown> = {
      name: options.name,
      gitSource: {
        type: "github",
        org: parsed.org,
        repo: parsed.repo,
        ref: options.ref ?? "main",
      },
    };

    const token = getToken();
    const teamId = getTeamId();
    const url = new URL("/v13/deployments", VERCEL_API);
    if (teamId) url.searchParams.set("teamId", teamId);

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: text || `Vercel API ${res.status}` };
    }

    const data = (await res.json()) as {
      id?: string;
      url?: string;
      readyState?: string;
    };
    const deploymentId = data.id;
    const deploymentUrl = data.url;
    if (!deploymentId || !deploymentUrl) {
      return { error: "Invalid response from Vercel" };
    }

    const previewUrl = `https://${deploymentUrl}`;
    return {
      deploymentId: String(deploymentId),
      url: previewUrl,
      readyState: data.readyState ?? "BUILDING",
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Vercel deployment failed" };
  }
}

/**
 * Get deployment status (optional polling).
 */
export async function getDeployment(
  deploymentId: string
): Promise<{ url: string; readyState: string } | { error: string }> {
  try {
    const token = getToken();
    const teamId = getTeamId();
    const url = new URL(`/v13/deployments/${deploymentId}`, VERCEL_API);
    if (teamId) url.searchParams.set("teamId", teamId);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: text || `Vercel API ${res.status}` };
    }

    const data = (await res.json()) as { url?: string; readyState?: string };
    const deploymentUrl = data.url;
    if (!deploymentUrl) return { error: "Deployment not found" };

    return {
      url: `https://${deploymentUrl}`,
      readyState: data.readyState ?? "UNKNOWN",
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to get deployment" };
  }
}
