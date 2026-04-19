// ============================================================
// STUDIO OS — Canonical State Reader
// Reads real data from OpenClaw shared filesystem
// ============================================================

import fs from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

export interface Opportunity {
  opportunity_id: string;
  title: string;
  status: string;
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  mission_id: string;
  title: string;
  status: string;
  owner?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueItem {
  queue_id: string;
  target_agent: string;
  reason: string;
  ref_type: string;
  ref_id: string;
  status: string;
  created_at: string;
}

export interface Decision {
  decision_id: string;
  opportunity_id: string;
  decision: string;
  approved_by: string;
  created_at: string;
  rationale?: { summary: string };
}

export interface StudioState {
  studio_status: string;
  current_mode: string;
  active_wave: string | null;
  updated_at: string;
}

export interface RevenueSummary {
  total_products: number;
  published_products: number;
  total_revenue: number;
}

// ---- File helpers ----

function readJsonFile<T>(filepath: string): T | null {
  try {
    if (!fs.existsSync(filepath)) return null;
    const content = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function readJsonDir<T>(
  dir: string,
  pattern: RegExp,
  idKey = "id"
): T[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => pattern.test(f))
      .map((f) => {
        const full = path.join(dir, f);
        const raw = fs.readFileSync(full, "utf-8");
        return JSON.parse(raw) as T;
      })
      .filter((item) => (item as Record<string, unknown>)[idKey]);
  } catch {
    return [];
  }
}

// ---- Opportunity functions ----

export function getOpportunities(): Opportunity[] {
  return readJsonDir<Opportunity>(
    path.join(SHARED_DIR, "opportunities"),
    /^opportunity-.*\.json$/,
    "opportunity_id"
  );
}

export function getOpportunitiesByStatus(
  status: string
): Opportunity[] {
  return getOpportunities().filter(
    (o) => o.status.toLowerCase() === status.toLowerCase()
  );
}

export function getOpportunityStats(): {
  total: number;
  byStatus: Record<string, number>;
} {
  const all = getOpportunities();
  const byStatus: Record<string, number> = {};
  for (const o of all) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
  }
  return { total: all.length, byStatus };
}

// ---- Mission functions ----

export function getMissions(): Mission[] {
  return readJsonDir<Mission>(
    path.join(SHARED_DIR, "missions"),
    /^mission-.*\.json$/,
    "mission_id"
  );
}

export function getMissionStats(): {
  total: number;
  byStatus: Record<string, number>;
} {
  const all = getMissions();
  const byStatus: Record<string, number> = {};
  for (const m of all) {
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
  }
  return { total: all.length, byStatus };
}

// ---- Queue functions ----

export function getQueueItems(): QueueItem[] {
  const queue = readJsonFile<{ items: QueueItem[] }>(
    path.join(SHARED_DIR, "queue", "run_queue.json")
  );
  return queue?.items ?? [];
}

export function getActiveQueueItems(): QueueItem[] {
  return getQueueItems().filter((q) => q.status === "queued" || q.status === "launched");
}

export function getQueueStats(): {
  total: number;
  active: number;
  byAgent: Record<string, number>;
} {
  const all = getQueueItems();
  const active = getActiveQueueItems();
  const byAgent: Record<string, number> = {};
  for (const q of active) {
    byAgent[q.target_agent] = (byAgent[q.target_agent] || 0) + 1;
  }
  return { total: all.length, active: active.length, byAgent };
}

// ---- Decision functions ----

export function getDecisions(limit = 20): Decision[] {
  return readJsonDir<Decision>(
    path.join(SHARED_DIR, "decisions"),
    /^decision-.*\.json$/,
    "decision_id"
  )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

// ---- Studio state ----

export function getStudioState(): StudioState | null {
  return readJsonFile<StudioState>(
    path.join(SHARED_DIR, "studio", "studio_state.json")
  );
}

// ---- Portfolio / Revenue ----

export function getPortfolioSummary(): RevenueSummary {
  const portfolio = readJsonFile<{
    products: Array<{ status: string; revenue: number }>;
    total_products: number;
  }>(path.join(SHARED_DIR, "portfolio", "portfolio.json"));

  if (!portfolio) {
    return { total_products: 0, published_products: 0, total_revenue: 0 };
  }

  const published = portfolio.products?.filter(
    (p) => p.status === "published"
  ) ?? [];
  const totalRevenue = published.reduce((sum, p) => sum + (p.revenue ?? 0), 0);

  return {
    total_products: portfolio.total_products ?? 0,
    published_products: published.length,
    total_revenue: totalRevenue,
  };
}

// ---- Run log ----

export function getRunLog(limit = 50): string {
  try {
    const log = fs.readFileSync(
      path.join(SHARED_DIR, "RUN_LOG.md"),
      "utf-8"
    );
    const lines = log.split("\n");
    return lines.slice(-limit).join("\n");
  } catch {
    return "";
  }
}

// ---- Org Health Score ----

export function computeOrgHealth(): {
  pulseIndex: number;
  momentum: number;
  health: number;
  autonomy: number;
  velocity: number;
  label: "healthy" | "strained" | "blocked" | "idle";
} {
  const oppStats = getOpportunityStats();
  const missionStats = getMissionStats();
  const queueStats = getQueueStats();

  // Compute a pulse index (0-100) based on activity
  const activeOpp = (oppStats.byStatus["discovered"] ?? 0) + (oppStats.byStatus["researched"] ?? 0) + (oppStats.byStatus["scored"] ?? 0);
  const activeMission = (missionStats.byStatus["planning"] ?? 0) + (missionStats.byStatus["in_progress"] ?? 0);
  const queueDepth = queueStats.active;

  const activity = Math.min(100, (activeOpp * 5) + (activeMission * 15) + (queueDepth * 8));
  const momentum = Math.min(100, activity + (missionStats.byStatus["complete"] ?? 0) * 3);
  const health = activeMission > 0 ? Math.min(100, 70 + activeMission * 5) : 40;
  const autonomy = queueDepth > 5 ? 75 : queueDepth > 2 ? 55 : 30;
  const velocity = missionStats.byStatus["in_progress"]
    ? Math.min(100, 60 + missionStats.byStatus["in_progress"] * 10)
    : 45;

  const pulseIndex = Math.round((momentum + health + autonomy + velocity) / 4);

  let label: "healthy" | "strained" | "blocked" | "idle" = "healthy";
  if (pulseIndex < 30) label = "idle";
  else if (queueStats.active === 0 && missionStats.total === 0) label = "idle";
  else if (health < 50) label = "strained";
  else if (queueStats.active > 10) label = "strained";

  return { pulseIndex, momentum, health, autonomy, velocity, label };
}

// ---- Full dashboard data ----

export interface StudioDashboard {
  opportunities: ReturnType<typeof getOpportunityStats>;
  missions: ReturnType<typeof getMissionStats>;
  queue: ReturnType<typeof getQueueStats>;
  decisions: Decision[];
  studioState: StudioState | null;
  portfolio: RevenueSummary;
  orgHealth: ReturnType<typeof computeOrgHealth>;
  runLog: string;
}

export function getStudioDashboard(): StudioDashboard {
  return {
    opportunities: getOpportunityStats(),
    missions: getMissionStats(),
    queue: getQueueStats(),
    decisions: getDecisions(),
    studioState: getStudioState(),
    portfolio: getPortfolioSummary(),
    orgHealth: computeOrgHealth(),
    runLog: getRunLog(),
  };
}
