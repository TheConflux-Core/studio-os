// ============================================================
// STUDIO OS — Complete Agent Roster
// The Conflux AI Venture Studio
// 18 agents across 5 divisions
// ============================================================

export type Division =
  | "strategy"
  | "security"
  | "product"
  | "intelligence"
  | "business_ops"
  | "growth_creative";

export type AgentStatus = "active" | "idle" | "busy" | "blocked" | "parked";

export interface AgentCapability {
  strength: number;       // 1-100
  specialty: string;     // Short label
  tools: string[];        // Primary tools/methods
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  division: Division;
  emoji: string;
  color: string;           // Primary hex color for orbital node
  accentColor: string;      // Secondary/gradient color
  status: AgentStatus;
  load: number;            // 0-100, how busy they are
  energy: number;          // 0-100, how healthy/flowing
  velocity: number;        // 0-100, how fast they're moving
  capabilities: AgentCapability;
  orbitRadius: number;     // Distance from center in orbital map (0 = center, 100 = outermost)
  summary: string;          // One-line description
  longDescription: string;  // Full role description
  collaborationEdges: string[]; // IDs of agents this one frequently works with
  schedule: {
    typicalHours: string;
    peakPerformance: string;
    autonomyLevel: "full" | "high" | "medium" | "low";
  };
  currentFocus?: string;   // What they're working on right now
  lastActivity?: string;    // ISO timestamp of last activity
  metrics: {
    tasksCompleted: number;
    missionsOwned: number;
    discoveriesMade: number;
    buildsShipped: number;
    verificationsPassed: number;
  };
}

// Division color palette
export const DIVISION_COLORS: Record<Division, { primary: string; glow: string }> = {
  strategy:    { primary: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  security:    { primary: "#ef4444", glow: "rgba(239,68,68,0.4)" },
  product:     { primary: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  intelligence:{ primary: "#06b6d4", glow: "rgba(6,182,212,0.4)" },
  business_ops:{ primary: "#10b981", glow: "rgba(16,185,129,0.4)" },
  growth_creative: { primary: "#ec4899", glow: "rgba(236,72,153,0.4)" },
};

export const AGENTS: Agent[] = [
  // ============================================================
  // DIVISION 1: STRATEGY — "Where we're going and why"
  // ============================================================

  {
    id: "vector",
    name: "Vector",
    role: "CEO / Business Strategist",
    division: "strategy",
    emoji: "🎯",
    color: "#f59e0b",
    accentColor: "#fbbf24",
    status: "active",
    load: 45,
    energy: 88,
    velocity: 72,
    orbitRadius: 12,
    summary: "Approves or rejects every opportunity. The buck stops here.",
    longDescription: "Vector is the strategic gravity at the center of the company. Every opportunity that enters the pipeline requires his sign-off. He applies rigorous financial and market analysis before anything gets greenlit. He's the reason The Conflux doesn't waste resources on low-value work. When Vector says no, it's final. When he says yes, the full weight of the company follows.",
    collaborationEdges: ["zigbot", "prism", "helix", "pulse"],
    schedule: {
      typicalHours: "7:00 AM – 6:00 PM",
      peakPerformance: "Morning (board prep, major decisions)",
      autonomyLevel: "full",
    },
    currentFocus: "Reviewing Q2 product roadmap priorities",
    lastActivity: new Date().toISOString(),
    capabilities: {
      strength: 95,
      specialty: "Strategic Decision Making",
      tools: ["Opportunity scoring", "Market timing analysis", "Capital allocation"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 2, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "zigbot",
    name: "ZigBot",
    role: "Strategic Partner",
    division: "strategy",
    emoji: "🤖",
    color: "#f59e0b",
    accentColor: "#fcd34d",
    status: "active",
    load: 62,
    energy: 91,
    velocity: 85,
    orbitRadius: 22,
    summary: "Helps Don think, decide, and prioritize. The right hand.",
    longDescription: "ZigBot is the connective tissue of the entire organization. He synthesizes information from every division, surfaces the right insights at the right time, and helps Don navigate complex decisions. He's not an assistant — he's a co-president without the title. When Vector needs context, ZigBot has it. When Helix finds something interesting, ZigBot frames it. When Don needs to think out loud, ZigBot listens.",
    collaborationEdges: ["vector", "prism", "helix", "pulse", "catalyst"],
    schedule: {
      typicalHours: "9:00 AM – 8:00 PM",
      peakPerformance: "Afternoon (strategic synthesis)",
      autonomyLevel: "high",
    },
    currentFocus: "Framing Q2 strategic options for Don",
    lastActivity: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    capabilities: {
      strength: 90,
      specialty: "Strategic Clarity & Synthesis",
      tools: ["Opportunity framing", "Decision architecture", "Org design", "Memory systems"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  // ============================================================
  // DIVISION 2: SECURITY — "Protecting everything we build"
  // ============================================================

  {
    id: "viper",
    name: "Viper",
    role: "Red Team Operator",
    division: "security",
    emoji: "🐍",
    color: "#ef4444",
    accentColor: "#f87171",
    status: "active",
    load: 28,
    energy: 94,
    velocity: 78,
    orbitRadius: 85,
    summary: "Finds vulnerabilities before attackers do. Breaks things on purpose.",
    longDescription: "Viper thinks like an attacker. His job is to find the thing nobody thought to protect. He runs penetration tests, probes new features for abuse vectors, documents vulnerabilities with severity ratings, and challenges Aegis's defenses with adversarial exercises. Dark sense of humor, deeper understanding of threat models. He never lets the company get comfortable.",
    collaborationEdges: ["aegis", "forge", "vector"],
    schedule: {
      typicalHours: "10:00 AM – 7:00 PM",
      peakPerformance: "Late afternoon (deep testing focus)",
      autonomyLevel: "high",
    },
    currentFocus: "Scanning v0.1.73 attack surface",
    lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    capabilities: {
      strength: 88,
      specialty: "Penetration Testing & Threat Modeling",
      tools: ["Attack simulation", "CVE research", "Social engineering vectors", "Exploit development"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "aegis",
    name: "Aegis",
    role: "Blue Team Guardian",
    division: "security",
    emoji: "🛡️",
    color: "#ef4444",
    accentColor: "#fca5a5",
    status: "active",
    load: 55,
    energy: 82,
    velocity: 68,
    orbitRadius: 90,
    summary: "Hardens defenses, monitors posture, and responds to incidents.",
    longDescription: "Aegis is the shield. He monitors security telemetry across all systems, maintains the defense infrastructure, enforces policies, and responds to incidents when Viper finds something. He makes the difference between a breach that burns the company and a breach that gets contained on a Tuesday afternoon. Paranoia is his professional virtue.",
    collaborationEdges: ["viper", "bolt", "vector"],
    schedule: {
      typicalHours: "7:00 AM – 4:00 PM",
      peakPerformance: "Morning (SOC coverage, incident response)",
      autonomyLevel: "high",
    },
    currentFocus: "Monitoring auth module for anomalous access patterns",
    lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    capabilities: {
      strength: 90,
      specialty: "Security Hardening & Incident Response",
      tools: ["SIEM monitoring", "IAM policy management", "Vulnerability remediation", "Compliance auditing"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  // ============================================================
  // DIVISION 3: PRODUCT — "Building what users pay for"
  // ============================================================

  {
    id: "prism",
    name: "Prism",
    role: "System Orchestrator",
    division: "product",
    emoji: "🔷",
    color: "#8b5cf6",
    accentColor: "#a78bfa",
    status: "active",
    load: 71,
    energy: 79,
    velocity: 83,
    orbitRadius: 38,
    summary: "Owns mission lifecycles. Nothing falls through the cracks.",
    longDescription: "Prism is the mission director. He owns the full lifecycle of every approved initiative — from Vector's greenlight to final delivery. He breaks down top-level goals into sequenced milestones, identifies blockers before they become crises, and keeps the entire execution chain moving. When a mission is at risk, Prism is already three steps ahead on remediation.",
    collaborationEdges: ["spectra", "luma", "catalyst", "zigbot", "vector"],
    schedule: {
      typicalHours: "8:30 AM – 5:30 PM",
      peakPerformance: "Morning (mission planning), afternoon (blocker triage)",
      autonomyLevel: "high",
    },
    currentFocus: "Monitoring mission-1223 (Conflux Home) milestone progress",
    lastActivity: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    capabilities: {
      strength: 87,
      specialty: "Mission Orchestration & Lifecycle Management",
      tools: ["Milestone tracking", "Dependency mapping", "Resource allocation", "Risk assessment"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 1, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "spectra",
    name: "Spectra",
    role: "Task Decomposer",
    division: "product",
    emoji: "🧩",
    color: "#8b5cf6",
    accentColor: "#c4b5fd",
    status: "active",
    load: 58,
    energy: 85,
    velocity: 77,
    orbitRadius: 48,
    summary: "Turns big ideas into precise, parallelizable work specs.",
    longDescription: "Spectra is the architect. He takes every approved mission and decomposes it into discrete, parallelizable workstreams. His specs are so precise that ten engineers can work on the same mission without stepping on each other. He maintains the technical design documents, maps dependencies, and adjusts specs in real-time based on what Forge encounters during implementation.",
    collaborationEdges: ["forge", "luma", "prism", "quanta"],
    schedule: {
      typicalHours: "9:00 AM – 6:00 PM",
      peakPerformance: "Deep work mornings (spec writing)",
      autonomyLevel: "high",
    },
    currentFocus: "Decomposing mission-1224 (Cybersecurity Layer) task graph",
    lastActivity: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    capabilities: {
      strength: 92,
      specialty: "Systems Architecture & Task Decomposition",
      tools: ["API design", "Data modeling", "Dependency mapping", "Technical writing"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "luma",
    name: "Luma",
    role: "Run Launcher",
    division: "product",
    emoji: "🚀",
    color: "#8b5cf6",
    accentColor: "#818cf8",
    status: "active",
    load: 82,
    energy: 76,
    velocity: 91,
    orbitRadius: 58,
    summary: "Dispatches work, manages queues, keeps the pipeline flowing.",
    longDescription: "Luma is the traffic controller. He manages the work queue, dispatches tasks to the right agents, monitors pipeline health, and handles rate limits. He's the only agent allowed to launch other agents — Forge doesn't build unless Luma queues it. When the pipeline backs up, Luma is the first to know and the first to act. Early bird by design: he owns the morning handoff.",
    collaborationEdges: ["forge", "spectra", "prism", "quanta", "catalyst"],
    schedule: {
      typicalHours: "7:00 AM – 4:00 PM",
      peakPerformance: "Early morning (queue triage)",
      autonomyLevel: "high",
    },
    currentFocus: "Processing 3 queued tasks for Forge",
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    capabilities: {
      strength: 85,
      specialty: "Pipeline Orchestration & Resource Management",
      tools: ["Queue management", "Rate limit handling", "Run monitoring", "Priority dispatch"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "catalyst",
    name: "Catalyst",
    role: "Pipeline Driver",
    division: "product",
    emoji: "⚡",
    color: "#8b5cf6",
    accentColor: "#e879f9",
    status: "active",
    load: 94,
    energy: 88,
    velocity: 97,
    orbitRadius: 68,
    summary: "The relentless executor. Never stops until the work is verified done.",
    longDescription: "Cat doesn't take no for an answer. She is the most driven operator in the studio — spawning sub-agents, verifying their output, pushing Forge when they stall, and reporting up the chain. She rotates through departments hourly, executing every task in that domain and finding more work when she's done. She is the reason the autonomous pipeline doesn't just run — it accelerates.",
    collaborationEdges: ["forge", "helix", "quanta", "pulse", "prism", "zigbot"],
    schedule: {
      typicalHours: "Ongoing (autonomous — no fixed hours)",
      peakPerformance: "Always on",
      autonomyLevel: "full",
    },
    currentFocus: "Running growth department hour — pushing Pulse on launch assets",
    lastActivity: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    capabilities: {
      strength: 93,
      specialty: "Autonomous Execution & Verification",
      tools: ["Sub-agent spawning", "Evidence gathering", "Canonical state updates", "Report generation"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "forge",
    name: "Forge",
    role: "Builder / Execution",
    division: "product",
    emoji: "🔨",
    color: "#8b5cf6",
    accentColor: "#6d28d9",
    status: "busy",
    load: 91,
    energy: 74,
    velocity: 86,
    orbitRadius: 78,
    summary: "Writes the code. Ships the product. Makes the impossible real.",
    longDescription: "Forge is the factory. 251+ Rust commands, 91+ DB tables, 15 apps built in days. He turns Spectra's specs into working product — frontend, backend, infrastructure, whatever the mission calls for. He's the reason Conflux Home exists. He participates in design reviews, does code reviews, mentors on engineering standards, and debugs production incidents at 2 AM when everything breaks.",
    collaborationEdges: ["spectra", "quanta", "luma", "viper", "catalyst", "bolt"],
    schedule: {
      typicalHours: "9:00 AM – 7:00 PM",
      peakPerformance: "Deep work blocks (code), end of day (code reviews)",
      autonomyLevel: "high",
    },
    currentFocus: "Building cybersecurity layer — permission gates and activity monitoring",
    lastActivity: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    capabilities: {
      strength: 96,
      specialty: "Full-Stack Development & Systems Engineering",
      tools: ["Rust/Tauri", "React/TypeScript", "PostgreSQL", "CI/CD", "API design"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 15, verificationsPassed: 0 },
  },

  {
    id: "quanta",
    name: "Quanta",
    role: "Verification & QA",
    division: "product",
    emoji: "✓",
    color: "#8b5cf6",
    accentColor: "#4ade80",
    status: "active",
    load: 33,
    energy: 90,
    velocity: 69,
    orbitRadius: 95,
    summary: "The final gate. Nothing ships without her sign-off.",
    longDescription: "Quanta is the quality guardian. She owns the final QA gate before every release — if she says not ready, it doesn't go. She designs and maintains the automated test suite, runs pre-release verification sprints, validates every bug fix Forge claims is complete, and builds simulation environments so users never encounter a bug twice. Quality is her personal point of pride, not just a job requirement.",
    collaborationEdges: ["forge", "luma", "prism", "catalyst"],
    schedule: {
      typicalHours: "8:00 AM – 5:00 PM",
      peakPerformance: "Morning (test runs), afternoon (review sessions)",
      autonomyLevel: "high",
    },
    currentFocus: "Awaiting mission-1224 build output for QA review",
    lastActivity: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    capabilities: {
      strength: 89,
      specialty: "Quality Assurance & Test Engineering",
      tools: ["Test automation", "Regression testing", "Performance benchmarking", "Bug validation"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "pulse",
    name: "Pulse",
    role: "Growth Engine",
    division: "growth_creative",
    emoji: "📣",
    color: "#ec4899",
    accentColor: "#f472b6",
    status: "active",
    load: 67,
    energy: 83,
    velocity: 88,
    orbitRadius: 55,
    summary: "Turns product into revenue. Owns the full growth funnel.",
    longDescription: "Pulse is the growth engine. He owns acquisition, activation, retention, and revenue — the full funnel. He runs A/B tests on everything, manages paid acquisition budgets, analyzes product usage data to find drop-off points, and owns the launch calendar for every feature. He's data-obsessed and experiment-driven, and he believes every growth lever can be measured and optimized. When Pulse reports, Vector listens.",
    collaborationEdges: ["helix", "forge", "vector", "zigbot", "catalyst", "vanta"],
    schedule: {
      typicalHours: "8:30 AM – 6:00 PM",
      peakPerformance: "Early morning (campaign launches), late afternoon (analysis)",
      autonomyLevel: "high",
    },
    currentFocus: "Analyzing Product Hunt launch metrics — day 3 performance",
    lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    capabilities: {
      strength: 88,
      specialty: "Growth Marketing & User Acquisition",
      tools: ["A/B testing", "SEO", "Content marketing", "Paid acquisition", "Funnel analytics"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  // ============================================================
  // DIVISION 4: INTELLIGENCE — "Knowing what to build before the market tells us"
  // ============================================================

  {
    id: "helix",
    name: "Helix",
    role: "Market Research",
    division: "intelligence",
    emoji: "🔍",
    color: "#06b6d4",
    accentColor: "#22d3ee",
    status: "active",
    load: 44,
    energy: 87,
    velocity: 76,
    orbitRadius: 33,
    summary: "Finds what the market wants before competitors see it.",
    longDescription: "Helix is the intelligence arm. He tracks the competitive landscape 24/7, runs customer discovery calls, produces the weekly Signal vs. Noise memo, sizes markets, identifies demand signals before they become obvious, and provides the evidence Vector needs to approve opportunities. He's at every AI/ML conference and comes back with 200 pages of actionable notes. He's the early warning system that keeps The Conflux ahead of the market.",
    collaborationEdges: ["vector", "zigbot", "pulse", "catalyst", "forge"],
    schedule: {
      typicalHours: "8:00 AM – 5:00 PM",
      peakPerformance: "Early morning (overnight signal review)",
      autonomyLevel: "high",
    },
    currentFocus: "Mapping AI agent desktop app competitive landscape",
    lastActivity: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    capabilities: {
      strength: 91,
      specialty: "Market Intelligence & Competitive Analysis",
      tools: ["Competitive mapping", "Customer discovery", "Market sizing", "Demand signal detection"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  // ============================================================
  // DIVISION 5: BUSINESS OPERATIONS — "Making the business work"
  // ============================================================

  {
    id: "lex",
    name: "Lex",
    role: "Legal & Compliance",
    division: "business_ops",
    emoji: "⚖️",
    color: "#10b981",
    accentColor: "#34d399",
    status: "parked",
    load: 15,
    energy: 80,
    velocity: 40,
    orbitRadius: 100,
    summary: "Keeps us legally defensible. Unlocks enterprise deals.",
    longDescription: "Lex handles everything legal: Terms of Service, Privacy Policy, EULA, GDPR compliance, DPA templates, enterprise contract review, and IP protection. He unlocks app store listings, enterprise sales, and international markets. He's the reason The Conflux can operate in the EU and sign deals with enterprise customers. Currently parked — brought in as needed for specific legal questions.",
    collaborationEdges: ["vector", "ledger", "bolt"],
    schedule: {
      typicalHours: "9:00 AM – 5:00 PM (on-call)",
      peakPerformance: "As needed (legal reviews)",
      autonomyLevel: "medium",
    },
    currentFocus: "On standby — no active legal reviews",
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    capabilities: {
      strength: 86,
      specialty: "Legal Review & Compliance",
      tools: ["Contract review", "ToS/Privacy drafting", "GDPR compliance", "IP protection"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "ledger",
    name: "Ledger",
    role: "Finance & Revenue",
    division: "business_ops",
    emoji: "📊",
    color: "#10b981",
    accentColor: "#6ee7b7",
    status: "parked",
    load: 20,
    energy: 78,
    velocity: 45,
    orbitRadius: 105,
    summary: "Tracks the money. Knows when the math works.",
    longDescription: "Ledger owns the financial picture: burn rate, runway, revenue tracking, Stripe integration, unit economics, pricing optimization, and investor reporting. He knows the margin on every product, the CAC/LTV ratio, and exactly when The Conflux crosses into profitability. He partners with Vector on capital allocation and with Pulse on pricing strategy. Currently parked — activated for financial reviews.",
    collaborationEdges: ["vector", "lex", "pulse"],
    schedule: {
      typicalHours: "On-demand (financial reviews)",
      peakPerformance: "Monthly (financial reporting)",
      autonomyLevel: "medium",
    },
    currentFocus: "On standby — awaiting Q2 financial review",
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    capabilities: {
      strength: 87,
      specialty: "Financial Planning & Revenue Tracking",
      tools: ["Stripe integration", "Burn rate analysis", "Unit economics", "Pricing optimization"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "bolt",
    name: "Bolt",
    role: "DevOps & Infrastructure",
    division: "business_ops",
    emoji: "⚡",
    color: "#10b981",
    accentColor: "#a7f3d0",
    status: "active",
    load: 49,
    energy: 85,
    velocity: 73,
    orbitRadius: 70,
    summary: "Keeps the lights on. Makes shipping reliable and fast.",
    longDescription: "Bolt owns the infrastructure that everything else runs on. CI/CD pipelines, automated builds, multi-platform releases (Windows, macOS, Linux), auto-updaters, CDN distribution, and developer onboarding. He's the reason users get updates without friction and new engineers can ship code on day one. He's also the first responder when builds break at odd hours.",
    collaborationEdges: ["forge", "aegis", "quanta", "lex"],
    schedule: {
      typicalHours: "8:00 AM – 5:00 PM",
      peakPerformance: "Morning (build pipeline review), end of day (release prep)",
      autonomyLevel: "high",
    },
    currentFocus: "Setting up CI/CD for v0.1.73 release pipeline",
    lastActivity: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    capabilities: {
      strength: 88,
      specialty: "DevOps & Infrastructure Engineering",
      tools: ["CI/CD", "Multi-platform builds", "Auto-update systems", "Cloud infrastructure"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  // ============================================================
  // GROWTH & CREATIVE — "Making it beautiful and loud"
  // ============================================================

  {
    id: "sona",
    name: "Sona",
    role: "Music Composer",
    division: "growth_creative",
    emoji: "🎵",
    color: "#ec4899",
    accentColor: "#c084fc",
    status: "parked",
    load: 10,
    energy: 95,
    velocity: 55,
    orbitRadius: 110,
    summary: "Gives everything a sonic identity. Sound is 50% of immersion.",
    longDescription: "Sona composes original music for every touchpoint in Conflux Home: boot sequences, notification sounds, ambient audio landscapes, and onboarding moments. She understands that sound design is 50% of emotional immersion — Hearth should feel warm like a kitchen, Pulse should feel alive and rhythmic. She collaborates with Vanta on sonic-visual alignment and with Pulse on brand audio identity. Currently parked — activated for content creation sprints.",
    collaborationEdges: ["vanta", "pulse", "forge"],
    schedule: {
      typicalHours: "10:00 AM – 8:00 PM (creative peak late afternoon)",
      peakPerformance: "Late afternoon/evening",
      autonomyLevel: "medium",
    },
    currentFocus: "On standby — awaiting studio launch for audio assets",
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    capabilities: {
      strength: 94,
      specialty: "Adaptive Music Composition",
      tools: ["Music generation", "Sound design", "Audio branding", "Adaptive audio systems"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },

  {
    id: "vanta",
    name: "Vanta",
    role: "Visual Artist",
    division: "growth_creative",
    emoji: "🎨",
    color: "#ec4899",
    accentColor: "#f9a8d4",
    status: "active",
    load: 38,
    energy: 92,
    velocity: 71,
    orbitRadius: 60,
    summary: "Creates the visual language. Makes 16 apps feel like one family.",
    longDescription: "Vanta designs the visual identity of everything The Conflux ships: agent avatars, app iconography, brand illustrations, marketing assets, and the Conflux Home visual system. She maintains the design language so all 16 apps feel like they belong to the same family without looking like clones. She thinks in visual systems, not individual assets, and she's the reason the product looks like a billion-dollar company built it.",
    collaborationEdges: ["sona", "pulse", "forge", "helix"],
    schedule: {
      typicalHours: "9:00 AM – 7:00 PM",
      peakPerformance: "Morning (creative deep work), afternoon (feedback review)",
      autonomyLevel: "high",
    },
    currentFocus: "Designing v0.1.73 marketing visual assets",
    lastActivity: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    capabilities: {
      strength: 95,
      specialty: "Visual Identity & Brand Systems",
      tools: ["Avatar design", "Brand illustration", "UI/UX visual design", "Motion graphics"],
    },
    metrics: { tasksCompleted: 0, missionsOwned: 0, discoveriesMade: 0, buildsShipped: 0, verificationsPassed: 0 },
  },
];

// ============================================================
// Lookup helpers
// ============================================================
export const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));
export const DIVISION_ORDER: Division[] = [
  "strategy",
  "security",
  "product",
  "intelligence",
  "business_ops",
  "growth_creative",
];
export const DIVISION_LABELS: Record<Division, string> = {
  strategy: "Strategy",
  security: "Security",
  product: "Product",
  intelligence: "Intelligence",
  business_ops: "Business Ops",
  growth_creative: "Growth & Creative",
};

export function getAgentsByDivision(division: Division): Agent[] {
  return AGENTS.filter((a) => a.division === division);
}

export function getDivisionColor(division: Division): string {
  return DIVISION_COLORS[division].primary;
}
