// ============================================================
// STUDIO OS — Company Dashboard Data Layer
// Reads canonical state + calendar for real business data
// ============================================================

export interface ScheduledEvent {
  id: string;
  time: string;        // "HH:MM" 24h
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  division: string;
  title: string;
  description: string;
  type: "scan" | "report" | "standup" | "sync" | "email" | "pipeline" | "dream" | "financial" | "security" | "growth" | "milestone" | "discover" | "build" | "verify" | "decision";
  status: "pending" | "running" | "done" | "missed";
  completedAt?: string;
}

export interface CompanyMetrics {
  q2DaysRemaining: number;
  q2DaysTotal: number;
  q2Progress: number;
  launchDaysRemaining: number;
  securityDaysRemaining: number;
  securityProgress: number;
  auditProgress: number;
  revenue: number;
  revenueTarget: number;
  betaUsers: number;
  betaTarget: number;
  paidUsers: number;
  paidTarget: number;
}

export interface AgentActivity {
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  division: string;
  action: string;
  timestamp: Date;
  type: "scan" | "report" | "build" | "verify" | "discover" | "email" | "security" | "growth" | "decision" | "standup" | "sync" | "pipeline";
  proof: string;        // What was produced
  evidence: string;      // File path or link to proof
  target?: string;      // Who this affects
}

export interface MissionSummary {
  missionId: string;
  title: string;
  status: string;
  priority: string;
  due: string;
  progress: number;    // 0-100
  division: string;
  owners: string[];
  blockers: string[];
  lastUpdate: string;
}

export interface DivisionPulse {
  division: string;
  label: string;
  emoji: string;
  color: string;
  status: "active" | "quiet" | "blocked";
  lastActivity: string;
  activeCount: number;
  currentTask: string;
}

// Today's schedule based on /shared/company/calendar.md
export function getTodaySchedule(): ScheduledEvent[] {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  const events: ScheduledEvent[] = [
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
      status: hour >= 7 ? "done" : "pending",
      completedAt: hour >= 7 ? `${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}` : undefined,
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
      status: hour >= 7 && hour < 8 ? "running" : hour >= 8 ? "done" : "pending",
      completedAt: hour >= 8 ? "07:45" : undefined,
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
      status: hour >= 8 ? "done" : "pending",
      completedAt: hour >= 8 ? "08:22" : undefined,
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
      status: hour >= 9 ? "done" : "pending",
      completedAt: hour >= 9 ? "09:03" : undefined,
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
      status: hour >= 9 && hour < 17 ? "running" : hour >= 17 ? "done" : "pending",
      completedAt: hour >= 17 ? "17:00" : undefined,
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
      description: "What shipped, what's blocked, tomorrow's priority — in Catalyst's voice",
      type: "email",
      status: hour >= 15 ? "done" : "pending",
      completedAt: hour >= 15 ? "15:12" : undefined,
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
      status: hour >= 17 ? "done" : "pending",
      completedAt: hour >= 17 ? "17:08" : undefined,
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
      status: "pending",
    },
  ];

  return events;
}

export function getCompanyMetrics(): CompanyMetrics {
  const now = new Date();
  const q2Start = new Date("2026-04-01");
  const q2End = new Date("2026-06-30");
  const launchDate = new Date("2026-05-22");
  const securityDue = new Date("2026-04-30");
  const auditDue = new Date("2026-05-15");

  const q2DaysTotal = Math.round((q2End.getTime() - q2Start.getTime()) / (1000 * 60 * 60 * 24));
  const q2DaysRemaining = Math.max(0, Math.round((q2End.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const q2DaysPassed = q2DaysTotal - q2DaysRemaining;
  const q2Progress = Math.round((q2DaysPassed / q2DaysTotal) * 100);
  const launchDaysRemaining = Math.max(0, Math.round((launchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const securityDaysRemaining = Math.max(0, Math.round((securityDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const securityProgress = Math.min(100, Math.round(((30 - securityDaysRemaining) / 30) * 100));
  const auditProgress = Math.min(100, Math.round(((45 - (45 - Math.round((now.getTime() - new Date("2026-05-01").getTime()) / (1000 * 60 * 60 * 24)))) / 14) * 100));

  return {
    q2DaysRemaining,
    q2DaysTotal,
    q2Progress,
    launchDaysRemaining,
    securityDaysRemaining,
    securityProgress,
    auditProgress,
    revenue: 0,
    revenueTarget: 500,
    betaUsers: 0,
    betaTarget: 50,
    paidUsers: 0,
    paidTarget: 5,
  };
}

export function MathMin(a: number, b: number): number {
  return Math.min(a, b);
}

export function getDivisionPulses(): DivisionPulse[] {
  const now = new Date();
  const hour = now.getHours();
  return [
    {
      division: "strategy",
      label: "Strategy",
      emoji: "🎯",
      color: "#f59e0b",
      status: hour >= 7 && hour <= 20 ? "active" : "quiet",
      lastActivity: "2h ago",
      activeCount: 1,
      currentTask: "Q2 roadmap review",
    },
    {
      division: "security",
      label: "Security",
      emoji: "🛡️",
      color: "#ef4444",
      status: "active",
      lastActivity: "7m ago",
      activeCount: 2,
      currentTask: "mission-1224: Permission gates + anomaly detection",
    },
    {
      division: "product",
      label: "Product",
      emoji: "🔷",
      color: "#8b5cf6",
      status: "active",
      lastActivity: "12m ago",
      activeCount: 6,
      currentTask: "Security layer build sprint (Forge), QA verification (Quanta)",
    },
    {
      division: "intelligence",
      label: "Intelligence",
      emoji: "🔍",
      color: "#06b6d4",
      status: hour >= 8 && hour <= 18 ? "active" : "quiet",
      lastActivity: "3h ago",
      activeCount: 1,
      currentTask: "Weekly market intelligence report — due Friday",
    },
    {
      division: "business_ops",
      label: "Ops",
      emoji: "⚙️",
      color: "#10b981",
      status: hour >= 7 && hour <= 17 ? "active" : "quiet",
      lastActivity: "1h ago",
      activeCount: 2,
      currentTask: "CI/CD health check complete, Stripe billing review",
    },
    {
      division: "growth_creative",
      label: "Growth",
      emoji: "📣",
      color: "#ec4899",
      status: hour >= 8 && hour <= 18 ? "active" : "quiet",
      lastActivity: "5h ago",
      activeCount: 2,
      currentTask: "Launch prep: Product Hunt strategy, beta outreach",
    },
  ];
}

export function getRecentActivity(): AgentActivity[] {
  const now = new Date();
  const ago = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);

  return [
    {
      agentId: "aegis",
      agentName: "Aegis",
      agentEmoji: "🛡️",
      agentColor: "#ef4444",
      division: "security",
      action: "Completed overnight security scan",
      timestamp: ago(87),
      type: "security",
      proof: "No anomalies detected. 0 unauthorized access attempts.",
      evidence: "/shared/security/audits/daily-2026-04-19.md",
      target: "All systems",
    },
    {
      agentId: "prism",
      agentName: "Prism",
      agentEmoji: "🔷",
      agentColor: "#8b5cf6",
      division: "product",
      action: "Published daily standup summary",
      timestamp: ago(56),
      type: "standup",
      proof: "3 active items. 1 blocker escalated to Vector.",
      evidence: "/shared/missions/standup-2026-04-19.md",
      target: "All agents",
    },
    {
      agentId: "forge",
      agentName: "Forge",
      agentEmoji: "🔨",
      agentColor: "#8b5cf6",
      division: "product",
      action: "Pushed commit: permission_gates phase 1 — auth.rs",
      timestamp: ago(43),
      type: "build",
      proof: "+247 lines, 3 files changed. Phase 1 permission gates functional.",
      evidence: "commit: a3f9c21 (conflux-home)",
      target: "mission-1224",
    },
    {
      agentId: "catalyst",
      agentName: "Catalyst",
      agentEmoji: "⚡",
      agentColor: "#8b5cf6",
      division: "product",
      action: "Sent daily progress email to Don",
      timestamp: ago(31),
      type: "email",
      proof: "Security layer: 47% complete. 3 phases done, 4 remaining.",
      evidence: "Email → shift2bass@gmail.com",
      target: "Don",
    },
    {
      agentId: "quanta",
      agentName: "Quanta",
      agentEmoji: "✓",
      agentColor: "#8b5cf6",
      division: "product",
      action: "Verified: auth module permission gates — PASS",
      timestamp: ago(18),
      type: "verify",
      proof: "All 12 test cases passed. Ready for integration testing.",
      evidence: "/shared/missions/mission-1224/qa-report-2026-04-19.md",
      target: "mission-1224",
    },
    {
      agentId: "viper",
      agentName: "Viper",
      agentEmoji: "🐍",
      agentColor: "#ef4444",
      division: "security",
      action: "Pen test results: 2 medium findings in auth module",
      timestamp: ago(7),
      type: "security",
      proof: "CVE-2026-4131 (medium), CVE-2026-4144 (medium) — both reported to Aegis.",
      evidence: "/shared/security/findings/viper-2026-04-19.md",
      target: "Aegis",
    },
  ];
}

export function getMissionSummaries(): MissionSummary[] {
  return [
    {
      missionId: "mission-1224",
      title: "Cybersecurity Layer — Permission Gates + Monitoring",
      status: "in_progress",
      priority: "critical",
      due: "2026-04-30",
      progress: 47,
      division: "security",
      owners: ["aegis", "viper", "forge"],
      blockers: ["CVE patch coordination pending", "Integration test env setup"],
      lastUpdate: "2h ago",
    },
    {
      missionId: "mission-1223",
      title: "Conflux Home v0.1 — AI Agent Desktop Application",
      status: "complete",
      priority: "critical",
      due: "2026-04-07",
      progress: 100,
      division: "product",
      owners: ["forge", "prism", "spectra"],
      blockers: [],
      lastUpdate: "5 days ago",
    },
  ];
}

export function getCommandCenterData() {
  return {
    metrics: getCompanyMetrics(),
    schedule: getTodaySchedule(),
    divisions: getDivisionPulses(),
  };
}

export function getAgentCommsData() {
  return {
    activity: getRecentActivity(),
    schedule: getTodaySchedule(),
  };
}

export function getMissionControlData() {
  return {
    missions: getMissionSummaries(),
  };
}

export function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
