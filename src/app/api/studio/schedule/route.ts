import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";

const RUN_LOG_PATH = "/home/calo/.openclaw/shared/RUN_LOG.md";

interface ScheduledEvent {
  id: string;
  time: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  division: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "running" | "done" | "missed";
  completedAt?: string;
}

interface DivisionPulse {
  division: string;
  label: string;
  emoji: string;
  color: string;
  status: "active" | "quiet" | "blocked";
  lastActivity: string;
  activeCount: number;
  currentTask: string;
}

// Standard log format: [YYYY-MM-DD HH:MM:SS] AgentName | ACTION | Details
interface LogEntry {
  timestamp: Date;
  agentId: string;
  action: string;
  details: string;
}

const SCHEDULE: Omit<ScheduledEvent, "status" | "completedAt">[] = [
  {
    id: "aegis-morning",
    time: "07:00",
    agentId: "aegis",
    agentName: "Aegis",
    agentEmoji: "🛡️",
    agentColor: "#ef4444",
    division: "security",
    title: "Security Posture Scan",
    description: "Overnight anomaly detection, access pattern review, CVE check",
    type: "scan",
  },
  {
    id: "bolt-build",
    time: "07:30",
    agentId: "bolt",
    agentName: "Bolt",
    agentEmoji: "⚡",
    agentColor: "#10b981",
    division: "ops",
    title: "CI/CD Pipeline Health Check",
    description: "Build status, failed tests, deployment health across all platforms",
    type: "report",
  },
  {
    id: "helix-market",
    time: "08:00",
    agentId: "helix",
    agentName: "Helix",
    agentEmoji: "🔍",
    agentColor: "#06b6d4",
    division: "intelligence",
    title: "Overnight Market Scan",
    description: "Competitor launches, funding rounds, AI news, demand signals",
    type: "discover",
  },
  {
    id: "prism-standup",
    time: "09:00",
    agentId: "prism",
    agentName: "Prism",
    agentEmoji: "🔷",
    agentColor: "#8b5cf6",
    division: "product",
    title: "Daily Standup Published",
    description: "Active mission status, blockers, items needing Vector's attention",
    type: "standup",
  },
  {
    id: "forge-build",
    time: "09:00",
    agentId: "forge",
    agentName: "Forge",
    agentEmoji: "🔨",
    agentColor: "#8b5cf6",
    division: "product",
    title: "Security Layer Build Sprint",
    description: "Permission gates + activity monitoring — mission-1224",
    type: "build",
  },
  {
    id: "catalyst-daily",
    time: "15:00",
    agentId: "catalyst",
    agentName: "Catalyst",
    agentEmoji: "⚡",
    agentColor: "#8b5cf6",
    division: "product",
    title: "Daily Progress Email → Don",
    description: "What shipped, what's blocked, tomorrow's priority",
    type: "email",
  },
  {
    id: "pulse-growth",
    time: "17:00",
    agentId: "pulse",
    agentName: "Pulse",
    agentEmoji: "📣",
    agentColor: "#ec4899",
    division: "growth",
    title: "Daily Growth Snapshot",
    description: "DAU, signups, churn, social mentions, Product Hunt position",
    type: "growth",
  },
  {
    id: "zigbot-dream",
    time: "23:30",
    agentId: "zigbot",
    agentName: "ZigBot",
    agentEmoji: "🤖",
    agentColor: "#f59e0b",
    division: "strategy",
    title: "Dream Cycle — Memory Consolidation",
    description: "Self-improvement, memory.md update, canonical state review",
    type: "dream",
  },
];

const AGENT_MAP: Record<string, string> = {
  aegis: "🛡️", bolt: "⚡", helix: "🔍", prism: "🔷",
  forge: "🔨", catalyst: "⚡", pulse: "📣", zigbot: "🤖",
  viper: "🐍", quanta: "✓", spectra: "🧩", luma: "🚀",
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function parseRunLog(): LogEntry[] {
  if (!existsSync(RUN_LOG_PATH)) return [];
  try {
    const raw = readFileSync(RUN_LOG_PATH, "utf-8");
    const entries: LogEntry[] = [];
    const blocks = raw.split(/^---$/m);
    for (const block of blocks) {
      const line = block.trim().split("\n")[0];
      if (!line) continue;
      const tsMatch = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/);
      if (!tsMatch) continue;
      const rest = line.substring(tsMatch[0].length).trim();
      const pipeIdx = rest.indexOf("|");
      if (pipeIdx === -1) continue;
      const namePart = rest.substring(0, pipeIdx).trim();
      const afterPipe = rest.substring(pipeIdx + 1);
      const actionIdx = afterPipe.indexOf("|");
      const action = actionIdx === -1 ? afterPipe.trim() : afterPipe.substring(0, actionIdx).trim();
      const details = actionIdx === -1 ? "" : afterPipe.substring(actionIdx + 1).trim();

      const agentId = namePart.toLowerCase();
      const d = new Date(tsMatch[1].replace(" ", "T") + ":00");
      if (isNaN(d.getTime())) continue;
      entries.push({ timestamp: d, agentId, action, details });
    }
    return entries;
  } catch {
    return [];
  }
}

function computeStatus(event: Omit<ScheduledEvent, "status" | "completedAt">, logEntries: LogEntry[]): ScheduledEvent {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const eventMinutes = timeToMinutes(event.time);

  // Find last log entry for this agent
  const agentLogs = logEntries
    .filter((e) => e.agentId === event.agentId.toLowerCase())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const lastLog = agentLogs[0];

  // Status logic
  let status: ScheduledEvent["status"] = "pending";
  if (currentMinutes > eventMinutes + 60) {
    // More than 60 min past scheduled time
    status = lastLog ? "done" : "missed";
  } else if (currentMinutes >= eventMinutes - 5 && currentMinutes <= eventMinutes + 60) {
    status = "running";
  } else if (currentMinutes > eventMinutes) {
    status = lastLog ? "done" : "missed";
  }

  return {
    ...event,
    status,
    completedAt: lastLog && status === "done"
      ? lastLog.timestamp.toISOString().substring(11, 16)
      : undefined,
  };
}

function computeDivisions(logEntries: LogEntry[]): DivisionPulse[] {
  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const DIVISION_CONFIG = [
    { division: "strategy", label: "Strategy", emoji: "🎯", color: "#f59e0b", agents: ["vector", "zigbot"] },
    { division: "security", label: "Security", emoji: "🛡️", color: "#ef4444", agents: ["aegis", "viper"] },
    { division: "product", label: "Product", emoji: "🔷", color: "#8b5cf6", agents: ["prism", "spectra", "luma", "catalyst", "forge", "quanta"] },
    { division: "intelligence", label: "Intelligence", emoji: "🔍", color: "#06b6d4", agents: ["helix"] },
    { division: "ops", label: "Ops", emoji: "⚙️", color: "#10b981", agents: ["bolt", "ledger"] },
    { division: "growth_creative", label: "Growth", emoji: "📣", color: "#ec4899", agents: ["pulse"] },
  ];

  return DIVISION_CONFIG.map((cfg) => {
    const divLogs = logEntries.filter(
      (e) => cfg.agents.includes(e.agentId.toLowerCase())
    );

    const recentLogs = divLogs.filter((e) => e.timestamp >= twentyFourHoursAgo);
    const veryRecent = recentLogs.filter((e) => e.timestamp >= fourHoursAgo);

    let status: DivisionPulse["status"] = "quiet";
    if (veryRecent.length > 0) status = "active";
    else if (recentLogs.length === 0) status = "blocked";

    const lastLog = divLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    const lastActivity = lastLog
      ? `${Math.round((now.getTime() - lastLog.timestamp.getTime()) / 60000)}m ago`
      : "none";

    return {
      division: cfg.division,
      label: cfg.label,
      emoji: cfg.emoji,
      color: cfg.color,
      status,
      lastActivity,
      activeCount: recentLogs.length,
      currentTask: lastLog?.action ?? "No recent activity",
    };
  });
}

export async function GET() {
  try {
    const logEntries = parseRunLog();
    const events = SCHEDULE.map((e) => computeStatus(e, logEntries));
    const divisions = computeDivisions(logEntries);

    return NextResponse.json({ events, divisions, source: logEntries.length > 0 ? "live" : "static" }, { status: 200 });
  } catch (err) {
    console.error("[/api/studio/schedule]", err);
    return NextResponse.json({ events: SCHEDULE.map((e) => ({ ...e, status: "pending" as const })), divisions: [], source: "error" }, { status: 200 });
  }
}
