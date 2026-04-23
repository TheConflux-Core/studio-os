import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";

const CRON_SCHEDULE_PATH = "/home/calo/.openclaw/shared/studio/cron_schedule.json";

interface CronJob {
  job_id: string;
  name: string;
  agent: string;
  schedule: string;
  schedule_description: string;
  window_minutes: number;
  priority: string;
  depends_on?: string[];
  output_ref?: string;
  circuit_breaker_threshold: number;
  rate_limit_max: number;
  notes?: string;
}

interface CronSchedule {
  version: string;
  updated_at: string;
  timezone: string;
  model: string;
  architecture: string;
  design_doc: string;
  priority_tiers: Record<string, string[]>;
  morning_chain: { agents: CronJob[] };
  catalyst?: { job_id: string; name: string; agent: string; schedule: string };
  email_monitoring?: CronJob;
  email_monitoring_pm?: CronJob;
  github_monitoring?: CronJob;
  afternoon_chain?: { agents: CronJob[] };
  nightly_chain?: CronJob[];
  dead_letter_check?: CronJob;
  circuit_breaker_reset_check?: CronJob;
  total_crons: number;
}

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
  priority: string;
  window_minutes: number;
  depends_on: string[];
  output_ref?: string;
}

const AGENT_MAP: Record<string, { name: string; emoji: string; color: string; division: string }> = {
  aegis:    { name: "Aegis",    emoji: "🛡️", color: "#ef4444", division: "security" },
  bolt:     { name: "Bolt",    emoji: "⚡", color: "#10b981", division: "ops" },
  helix:    { name: "Helix",   emoji: "🔍", color: "#06b6d4", division: "intelligence" },
  prism:    { name: "Prism",   emoji: "🔷", color: "#8b5cf6", division: "product" },
  forge:    { name: "Forge",   emoji: "🔨", color: "#8b5cf6", division: "product" },
  pulse:    { name: "Pulse",   emoji: "📣", color: "#ec4899", division: "growth" },
  viper:    { name: "Viper",   emoji: "🐍", color: "#ef4444", division: "security" },
  quanta:   { name: "Quanta",  emoji: "✓",  color: "#8b5cf6", division: "product" },
  catalyst: { name: "Catalyst", emoji: "⚡", color: "#8b5cf6", division: "product" },
  zigbot:   { name: "ZigBot",  emoji: "🤖", color: "#f59e0b", division: "strategy" },
  conflux:  { name: "Conflux", emoji: "🤖", color: "#f59e0b", division: "strategy" },
};

const DIVISION_COLORS: Record<string, string> = {
  strategy:    "#f59e0b",
  security:    "#ef4444",
  product:     "#8b5cf6",
  intelligence: "#06b6d4",
  ops:         "#10b981",
  growth:      "#ec4899",
};

// Parse cron expression [minute] [hour] * * * to get hour:minute
function parseCronToTime(cronExpr: string): string | null {
  // Simple 5-field cron: minute hour day month dow
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length < 5) return null;
  const minute = parts[0];
  const hour = parts[1];
  if (hour === "*" || minute === "*") return null;
  const h = parseInt(hour);
  const m = parseInt(minute);
  if (isNaN(h) || isNaN(m)) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getAgentType(agent: string, name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("security") || lower.includes("scan")) return "scan";
  if (lower.includes("build") || lower.includes("forge")) return "build";
  if (lower.includes("market") || lower.includes("intel") || lower.includes("helix")) return "discover";
  if (lower.includes("standup") || lower.includes("prism")) return "standup";
  if (lower.includes("pipeline") || lower.includes("bolt")) return "pipeline";
  if (lower.includes("growth") || lower.includes("pulse")) return "growth";
  if (lower.includes("digest") || lower.includes("catalyst")) return "email";
  if (lower.includes("dream") || lower.includes("diary")) return "dream";
  if (lower.includes("github") || lower.includes("issue")) return "discover";
  if (lower.includes("email") || lower.includes("inbox")) return "email";
  if (lower.includes("security") && agent === "viper") return "security";
  if (lower.includes("qa") || lower.includes("quanta")) return "verify";
  if (lower.includes("dead") || lower.includes("letter")) return "ops";
  return "report";
}

function computeStatus(
  time: string,
  windowMinutes: number
): { status: ScheduledEvent["status"]; completedAt?: string } {
  const now = new Date();
  const [schedHour, schedMin] = time.split(":").map(Number);
  const schedMinutes = schedHour * 60 + schedMin;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const windowEnd = schedMinutes + windowMinutes + 30; // +30min buffer past window

  if (currentMinutes < schedMinutes - 5) {
    return { status: "pending" };
  } else if (currentMinutes >= schedMinutes - 5 && currentMinutes <= schedMinutes + windowMinutes) {
    return { status: "running" };
  } else if (currentMinutes > schedMinutes + windowMinutes && currentMinutes <= windowEnd) {
    return { status: "done" };
  } else if (currentMinutes > windowEnd) {
    return { status: "done" };
  }
  return { status: "pending" };
}

function jobToEvent(job: CronJob, time: string): ScheduledEvent {
  const agent = AGENT_MAP[job.agent] ?? {
    name: job.agent.charAt(0).toUpperCase() + job.agent.slice(1),
    emoji: "🤖",
    color: "#6b7280",
    division: "product",
  };

  return {
    id: job.job_id,
    time,
    agentId: job.agent,
    agentName: agent.name,
    agentEmoji: agent.emoji,
    agentColor: agent.color,
    division: agent.division,
    title: job.name.replace(/^(Aegis|Helix|Bolt|Prism|Forge|Pulse|Viper|Quanta|Catalyst|ZigBot|Conflux) — /, ""),
    description: job.notes ?? "",
    type: getAgentType(job.agent, job.name),
    priority: job.priority,
    window_minutes: job.window_minutes,
    depends_on: job.depends_on ?? [],
    output_ref: job.output_ref,
    status: "pending",
  };
}

export async function GET() {
  try {
    if (!existsSync(CRON_SCHEDULE_PATH)) {
      return NextResponse.json({ events: [], divisions: [], source: "error", error: "cron_schedule.json not found" }, { status: 200 });
    }

    const raw = readFileSync(CRON_SCHEDULE_PATH, "utf-8");
    const schedule = JSON.parse(raw) as CronSchedule;

    const allJobs: CronJob[] = [
      ...schedule.morning_chain.agents,
      ...(schedule.afternoon_chain?.agents ?? []),
      ...(schedule.nightly_chain ?? []),
    ];

    if (schedule.catalyst) {
      allJobs.push({
        job_id: schedule.catalyst.job_id,
        name: schedule.catalyst.name,
        agent: schedule.catalyst.agent,
        schedule: schedule.catalyst.schedule,
        schedule_description: "Every 5 minutes, midnight–10 PM MDT",
        window_minutes: 2,
        priority: "HIGH",
        depends_on: [],
        circuit_breaker_threshold: 5,
        rate_limit_max: 20,
        notes: "Every 5 minutes polling loop — Catalyst decision engine",
      });
    }

    if (schedule.email_monitoring) allJobs.push(schedule.email_monitoring);
    if (schedule.email_monitoring_pm) allJobs.push(schedule.email_monitoring_pm);
    if (schedule.github_monitoring) allJobs.push(schedule.github_monitoring);
    if (schedule.dead_letter_check) allJobs.push(schedule.dead_letter_check);
    if (schedule.circuit_breaker_reset_check) allJobs.push(schedule.circuit_breaker_reset_check);

    const events: ScheduledEvent[] = [];
    for (const job of allJobs) {
      const time = parseCronToTime(job.schedule);
      if (!time) continue;
      const { status, completedAt } = computeStatus(time, job.window_minutes ?? 30);
      const event = jobToEvent(job, time);
      event.status = status;
      event.completedAt = completedAt;
      events.push(event);
    }

    // Sort by time
    events.sort((a, b) => {
      const [ah, am] = a.time.split(":").map(Number);
      const [bh, bm] = b.time.split(":").map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });

    // Compute division health from schedule
    const DIVISION_CONFIG = [
      { division: "strategy",    label: "Strategy",     emoji: "🎯", color: "#f59e0b", agents: ["zigbot", "conflux"] },
      { division: "security",     label: "Security",      emoji: "🛡️", color: "#ef4444", agents: ["aegis", "viper"] },
      { division: "product",      label: "Product",       emoji: "🔷", color: "#8b5cf6", agents: ["prism", "catalyst", "forge", "quanta", "spectra", "luma"] },
      { division: "intelligence", label: "Intelligence",  emoji: "🔍", color: "#06b6d4", agents: ["helix"] },
      { division: "ops",          label: "Ops",           emoji: "⚙️", color: "#10b981", agents: ["bolt", "ledger"] },
      { division: "growth",       label: "Growth",        emoji: "📣", color: "#ec4899", agents: ["pulse"] },
    ];

    const now = new Date();
    const fourHoursMs = 4 * 60 * 60 * 1000;

    const divisions = DIVISION_CONFIG.map((cfg) => {
      const divEvents = events.filter((e) => cfg.agents.includes(e.agentId));
      const nowMs = now.getTime();
      const futureEvents = divEvents.filter((e) => {
        const [h, m] = e.time.split(":").map(Number);
        const eventMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m).getTime();
        return eventMs > nowMs;
      });
      const lastDone = divEvents
        .filter((e) => e.status === "done")
        .sort((a, b) => b.time.localeCompare(a.time))[0];

      const hoursSinceLast = lastDone
        ? (nowMs - new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...lastDone.time.split(":").map(Number)).getTime()) / 3600000
        : 999;

      let status: "active" | "quiet" | "blocked" = "quiet";
      if (hoursSinceLast < 4) status = "active";

      return {
        division: cfg.division,
        label: cfg.label,
        emoji: cfg.emoji,
        color: cfg.color,
        status,
        lastActivity: lastDone
          ? `${Math.round(hoursSinceLast)}h ago`
          : "none",
        activeCount: divEvents.filter((e) => e.status === "done").length,
        currentTask: futureEvents[0]
          ? `Next: ${futureEvents[0].title} at ${futureEvents[0].time}`
          : lastDone
          ? lastDone.title
          : "No events today",
      };
    });

    return NextResponse.json(
      { events, divisions, source: "cron_schedule", schedule_version: schedule.version },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/studio/schedule]", err);
    return NextResponse.json(
      { events: [], divisions: [], source: "error", error: String(err) },
      { status: 200 }
    );
  }
}
