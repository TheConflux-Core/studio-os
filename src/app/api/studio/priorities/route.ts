import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SHARED_DIR = "/home/calo/.openclaw/shared";

// ---- Types ----

interface RawQueueItem {
  queue_id: string;
  target_agent: string;
  reason: string;
  ref_type: string;
  ref_id: string;
  status: string;
  created_at: string;
}

interface RawMission {
  mission_id: string;
  title: string;
  status: string;
  priority: string;
  owner?: string;
  created_at: string;
  updated_at: string;
}

interface RawOpportunity {
  opportunity_id: string;
  title: string;
  status: string;
  scores?: {
    opportunity_score?: number;
    revenue_potential?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PriorityItem {
  id: string;
  label: string;
  type: "mission" | "opportunity" | "task" | "security" | "growth";
  buoyancy: number;
  density: number;
  assignee?: string;
  color: string;
  lastMoved?: string;
}

// ---- Helpers ----

const TYPE_COLORS: Record<PriorityItem["type"], string> = {
  mission: "#8b5cf6",
  opportunity: "#f59e0b",
  task: "#06b6d4",
  security: "#ef4444",
  growth: "#ec4899",
};

function readJsonFile<T>(filepath: string): T | null {
  try {
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function readJsonDir<T>(dir: string, pattern: RegExp): T[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => pattern.test(f))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as T)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function daysOld(dateStr: string): number {
  const created = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
}

function computeMissionBuoyancy(mission: RawMission): number {
  const recencyBoost = Math.min(10, daysOld(mission.created_at) * 0.5);
  const priorityBonus =
    mission.priority === "critical"
      ? 15
      : mission.priority === "high"
      ? 10
      : mission.priority === "medium"
      ? 5
      : 0;

  if (mission.status === "in_progress") {
    return Math.min(100, 85 + recencyBoost + priorityBonus);
  }
  if (mission.status === "planning") {
    return Math.min(100, 70 + recencyBoost + priorityBonus);
  }
  // Any other active status
  return Math.min(100, 60 + recencyBoost + priorityBonus);
}

function computeOpportunityBuoyancy(opp: RawOpportunity): number {
  const recencyBoost = Math.min(8, daysOld(opp.created_at) * 0.4);
  const scoreBonus = opp.scores?.opportunity_score
    ? opp.scores.opportunity_score * 2
    : 0;

  if (opp.status === "discovered") {
    return Math.min(100, 50 + recencyBoost + scoreBonus);
  }
  // scored
  return Math.min(100, 80 + recencyBoost + scoreBonus);
}

function computeQueueBuoyancy(item: RawQueueItem): number {
  const recencyBoost = Math.min(15, daysOld(item.created_at) * 2);
  return Math.min(100, 40 + recencyBoost);
}

function deriveTypeFromReason(reason: string): PriorityItem["type"] {
  const r = reason.toLowerCase();
  if (r.includes("security") || r.includes("cybersec") || r.includes("vuln")) return "security";
  if (r.includes("growth") || r.includes("launch") || r.includes("distribution") || r.includes("seo")) return "growth";
  if (r.includes("mission")) return "mission";
  if (r.includes("opportunit")) return "opportunity";
  return "task";
}

// ---- Main data fetch ----

function loadPriorityItems(): PriorityItem[] {
  const items: PriorityItem[] = [];

  // 1. Active queue items
  const queueData = readJsonFile<{ items: RawQueueItem[] }>(
    path.join(SHARED_DIR, "queue", "run_queue.json")
  );
  const activeQueue = (queueData?.items ?? []).filter(
    (q) => q.status === "queued" || q.status === "launched"
  );
  for (const q of activeQueue) {
    const type: PriorityItem["type"] =
      q.ref_type === "mission"
        ? "mission"
        : q.ref_type === "opportunity"
        ? "opportunity"
        : deriveTypeFromReason(q.reason);

    items.push({
      id: q.queue_id,
      label: q.reason.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      type,
      buoyancy: computeQueueBuoyancy(q),
      density: 0,
      assignee: q.target_agent,
      color: TYPE_COLORS[type],
      lastMoved: q.created_at,
    });
  }

  // 2. Active missions
  const missions = readJsonDir<RawMission>(
    path.join(SHARED_DIR, "missions"),
    /^mission-.*\.json$/
  );
  const activeMissions = missions.filter(
    (m) => !["complete", "archived", "failed"].includes(m.status)
  );
  for (const m of activeMissions) {
    const type: PriorityItem["type"] =
      m.title.toLowerCase().includes("security") ||
      m.title.toLowerCase().includes("cybersec")
        ? "security"
        : m.title.toLowerCase().includes("growth") ||
          m.title.toLowerCase().includes("launch") ||
          m.title.toLowerCase().includes("seo")
        ? "growth"
        : "mission";

    items.push({
      id: m.mission_id,
      label: m.title.length > 40 ? m.title.slice(0, 38) + "…" : m.title,
      type,
      buoyancy: computeMissionBuoyancy(m),
      density: 0,
      assignee: m.owner,
      color: TYPE_COLORS[type],
      lastMoved: m.updated_at,
    });
  }

  // 3. Active opportunities
  const opportunities = readJsonDir<RawOpportunity>(
    path.join(SHARED_DIR, "opportunities"),
    /^opportunity-.*\.json$/
  );
  const activeOpps = opportunities.filter((o) =>
    ["discovered", "scored"].includes(o.status)
  );
  for (const o of activeOpps) {
    items.push({
      id: o.opportunity_id,
      label: o.title.length > 40 ? o.title.slice(0, 38) + "…" : o.title,
      type: "opportunity",
      buoyancy: computeOpportunityBuoyancy(o),
      density: 0,
      color: TYPE_COLORS.opportunity,
      lastMoved: o.updated_at,
    });
  }

  return items;
}

// ---- Route handler ----

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = loadPriorityItems();
    return NextResponse.json({ items, updated_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load priorities", detail: String(err) },
      { status: 500 }
    );
  }
}
