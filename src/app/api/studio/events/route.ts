import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";

const RUN_LOG_PATH = "/home/calo/.openclaw/shared/RUN_LOG.md";

// Minimal agent roster map for emoji/color lookup (avoids importing the full TS module)
const AGENT_LOOKUP: Record<string, { name: string; emoji: string; color: string }> = {
  vector:   { name: "Vector",   emoji: "🎯", color: "#f59e0b" },
  zigbot:   { name: "ZigBot",   emoji: "🤖", color: "#f59e0b" },
  viper:    { name: "Viper",    emoji: "🐍", color: "#ef4444" },
  aegis:    { name: "Aegis",    emoji: "🛡️", color: "#ef4444" },
  prism:    { name: "Prism",    emoji: "🔷", color: "#8b5cf6" },
  spectra:  { name: "Spectra",  emoji: "🧩", color: "#8b5cf6" },
  luma:     { name: "Luma",     emoji: "🚀", color: "#8b5cf6" },
  catalyst: { name: "Catalyst", emoji: "⚡", color: "#8b5cf6" },
  forge:    { name: "Forge",    emoji: "🔨", color: "#8b5cf6" },
  quanta:   { name: "Quanta",   emoji: "✓",  color: "#8b5cf6" },
  pulse:    { name: "Pulse",    emoji: "📣", color: "#ec4899" },
  helix:    { name: "Helix",    emoji: "🔍", color: "#06b6d4" },
  lex:      { name: "Lex",      emoji: "⚖️", color: "#10b981" },
  ledger:   { name: "Ledger",  emoji: "📊", color: "#10b981" },
  bolt:     { name: "Bolt",     emoji: "⚡", color: "#10b981" },
  sona:     { name: "Sona",     emoji: "🎵", color: "#ec4899" },
  vanta:    { name: "Vanta",    emoji: "🎨", color: "#ec4899" },
};

interface ParsedEvent {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  color: string;
  type: "discovery" | "build" | "verify" | "security" | "strategy" | "growth" | "ops" | "social";
  action: string;
  timestamp: string; // ISO string
  priority: "low" | "medium" | "high";
}

function parseTimestamp(line: string): string | null {
  const match = line.match(/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2} [A-Z]{3})\]/);
  if (!match) return null;
  const str = match[1];
  // Convert MDT/MST to a parseable date — use Date.parse with the full string
  const d = new Date(str.replace(/([A-Z]{3})$/, "-07:00"));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function inferEventType(action: string, orchestrator: string): ParsedEvent["type"] {
  const lower = action.toLowerCase();
  if (lower.includes("security") || lower.includes("vulnerability") || lower.includes("cve") || lower.includes("harden") || lower.includes("attack") || lower.includes("siem") || lower.includes("iam"))
    return "security";
  if (lower.includes("build") || lower.includes("ship") || lower.includes("merge") || lower.includes("pr ") || lower.includes("feature") || lower.includes("code"))
    return "build";
  if (lower.includes("verify") || lower.includes("qa") || lower.includes("test") || lower.includes("passed") || lower.includes("edge case"))
    return "verify";
  if (lower.includes("market") || lower.includes("research") || lower.includes("competitive") || lower.includes("discovery") || lower.includes("signal"))
    return "discovery";
  if (lower.includes("approve") || lower.includes("decision") || lower.includes("strategic") || lower.includes("priority") || lower.includes("review"))
    return "strategy";
  if (lower.includes("growth") || lower.includes("launch") || lower.includes("product hunt") || lower.includes("a/b") || lower.includes("marketing"))
    return "growth";
  if (lower.includes("queue") || lower.includes("dispatch") || lower.includes("pipeline") || lower.includes("ops") || lower.includes("rotate"))
    return "ops";
  return "social";
}

function inferPriority(type: ParsedEvent["type"], action: string): ParsedEvent["priority"] {
  const lower = action.toLowerCase();
  const highKeywords = ["critical", "immediate", "urgent", "cve", "security", "vulnerability", "flagged", "high", "risk"];
  const mediumKeywords = ["mission", "approved", "shipped", "merge", "product hunt", "competitive", "market"];
  if (highKeywords.some((k) => lower.includes(k))) return "high";
  if (mediumKeywords.some((k) => lower.includes(k))) return "medium";
  if (type === "security" || type === "build") return "high";
  if (type === "verify" || type === "discovery" || type === "strategy") return "medium";
  return "low";
}

export async function GET() {
  try {
    if (!existsSync(RUN_LOG_PATH)) {
      return NextResponse.json({ events: [], source: "empty" } as const, { status: 200 });
    }

    const raw = readFileSync(RUN_LOG_PATH, "utf-8");
    const rawEntries = raw.split(/^---$/m).filter((s) => s.trim());

    const parsed: ParsedEvent[] = [];

    for (const entry of rawEntries) {
      const lines = entry.trim().split("\n");

      let timestamp = new Date().toISOString();
      let orchestrator = "";
      let action = "";

      for (const line of lines) {
        const t = parseTimestamp(line.trim());
        if (t) {
          timestamp = t;
          continue;
        }
        if (line.startsWith("Orchestrator:")) {
          orchestrator = line.replace("Orchestrator:", "").trim().toLowerCase();
          continue;
        }
        if (line.startsWith("Action:")) {
          action = line.replace("Action:", "").trim();
          continue;
        }
      }

      if (!action) continue;

      const agent = AGENT_LOOKUP[orchestrator];
      const agentId = orchestrator || "unknown";
      const agentName = agent?.name ?? orchestrator;
      const agentEmoji = agent?.emoji ?? "🤖";
      const color = agent?.color ?? "#6b7280";
      const type = inferEventType(action, orchestrator);
      const priority = inferPriority(type, action);

      parsed.push({
        id: `log-${parsed.length}-${Date.now()}`,
        agentId,
        agentName,
        agentEmoji,
        color,
        type,
        action,
        timestamp,
        priority,
      });
    }

    // Most recent first, take 30
    const recent = parsed
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30);

    return NextResponse.json(
      { events: recent, source: recent.length > 0 ? "live" : "empty" } as const,
      { status: 200 }
    );
  } catch {
    // Graceful degradation — never crash the feed
    return NextResponse.json({ events: [], source: "error" } as const, { status: 200 });
  }
}
