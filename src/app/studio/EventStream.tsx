"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Agent } from "@/data/agentRoster";
import styles from "./EventStream.module.css";

type EventType = "discovery" | "build" | "verify" | "security" | "strategy" | "growth" | "ops" | "social";

interface StreamEvent {
  id: string;
  agentId: string;
  agentName: string;
  emoji: string;
  color: string;
  type: EventType;
  message: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
  simulated?: boolean;
}

const TYPE_ICONS: Record<EventType, string> = {
  discovery: "🔍",
  build: "🔨",
  verify: "✓",
  security: "🛡️",
  strategy: "🎯",
  growth: "📈",
  ops: "⚙️",
  social: "💬",
};

const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444",
};

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return date.toLocaleDateString();
}

// Simulate realistic events from agents (fallback when no live data)
function generateSimulatedEvents(agents: Agent[]): StreamEvent[] {
  const eventTemplates: Array<{
    type: EventType;
    template: (agent: Agent) => string;
    priority: StreamEvent["priority"];
  }> = [
    { type: "discovery", priority: "medium", template: (a) => `New market signal detected by ${a.name} — analyzing competitive gap` },
    { type: "build", priority: "high", template: (a) => `${a.name} shipped feature to production — v0.1.73` },
    { type: "verify", priority: "medium", template: (a) => `${a.name} passed QA gate — all checks green` },
    { type: "security", priority: "high", template: (a) => `${a.name} flagged: CVE requires immediate patch` },
    { type: "strategy", priority: "high", template: (a) => `${a.name} sent to Vector: strategic decision required` },
    { type: "growth", priority: "medium", template: (a) => `${a.name}: A/B test variant B showing 34% lift` },
    { type: "ops", priority: "low", template: (a) => `${a.name} updated CI/CD pipeline — build time -18%` },
    { type: "social", priority: "low", template: (a) => `${a.name} published weekly brief to #mission-control` },
    { type: "discovery", priority: "medium", template: (a) => `${a.name} completed market map for AI agent desktop apps` },
    { type: "build", priority: "high", template: (a) => `${a.name} merged PR #247 — cybersecurity layer phase 1` },
    { type: "verify", priority: "medium", template: (a) => `${a.name} found 3 edge cases in auth module — pushing fix` },
    { type: "strategy", priority: "high", template: (a) => `${a.name}: Q2 priorities framed for Don's review` },
    { type: "ops", priority: "low", template: (a) => `${a.name} rotated API keys — zero downtime` },
    { type: "security", priority: "medium", template: (a) => `${a.name} hardened rate limits on all endpoints` },
    { type: "growth", priority: "medium", template: (a) => `${a.name}: Product Hunt day 3 — 312 upvotes, 47 comments` },
  ];

  const now = Date.now();
  return eventTemplates.map((tpl, i) => {
    const agent = agents[i % agents.length];
    return {
      id: `sim-${i}-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      emoji: agent.emoji,
      color: agent.color,
      type: tpl.type,
      message: tpl.template(agent),
      timestamp: new Date(now - (15 - i) * 1000 * 60 * 4),
      priority: tpl.priority,
      simulated: true,
    };
  });
}

interface EventStreamProps {
  agents: Agent[];
  maxItems?: number;
}

export default function EventStream({ agents, maxItems = 30 }: EventStreamProps) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [isPaused, setIsPaused] = useState(false);
  const [dataSource, setDataSource] = useState<"live" | "simulated">("simulated");

  const fetchLiveEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/events", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      if (json.events && json.events.length > 0) {
        const mapped: StreamEvent[] = json.events.map(
          (e: {
            id: string;
            agentId: string;
            agentName: string;
            agentEmoji: string;
            color: string;
            type: EventType;
            action: string;
            timestamp: string;
            priority: "low" | "medium" | "high";
          }) => ({
            id: e.id,
            agentId: e.agentId,
            agentName: e.agentName,
            emoji: e.agentEmoji,
            color: e.color,
            type: e.type,
            message: e.action,
            timestamp: new Date(e.timestamp),
            priority: e.priority,
            simulated: false,
          })
        );
        setEvents(mapped);
        setDataSource("live");
      } else {
        setEvents(generateSimulatedEvents(agents));
        setDataSource("simulated");
      }
    } catch {
      setEvents(generateSimulatedEvents(agents));
      setDataSource("simulated");
    }
  }, [agents]);

  // Initial fetch
  useEffect(() => {
    fetchLiveEvents();
  }, [fetchLiveEvents]);

  // Simulate new events coming in (only when using simulated data)
  useEffect(() => {
    if (dataSource === "live") return;

    const interval = setInterval(() => {
      if (isPaused) return;
      const template = generateSimulatedEvents(agents);
      const newEvent = template[Math.floor(Math.random() * template.length)];
      const agent = agents[Math.floor(Math.random() * agents.length)];
      setEvents((prev) => {
        const event: StreamEvent = {
          ...newEvent,
          id: `sim-${Date.now()}`,
          agentId: agent.id,
          agentName: agent.name,
          emoji: agent.emoji,
          color: agent.color,
          timestamp: new Date(),
          simulated: true,
        };
        return [event, ...prev].slice(0, maxItems);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [agents, isPaused, maxItems, dataSource]);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.pulse} />
          Event Stream
          {dataSource === "live" ? (
            <span className={styles.liveBadge}>LIVE</span>
          ) : (
            <span className={styles.simulatedBadge}>SIMULATED</span>
          )}
        </div>
        <div className={styles.controls}>
          <select
            className={styles.filter}
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All</option>
            <option value="discovery">Discovery</option>
            <option value="build">Build</option>
            <option value="verify">Verify</option>
            <option value="security">Security</option>
            <option value="strategy">Strategy</option>
            <option value="growth">Growth</option>
            <option value="ops">Ops</option>
          </select>
          <button
            className={`${styles.pauseBtn} ${isPaused ? styles.paused : ""}`}
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      <div className={styles.feed}>
        <AnimatePresence initial={false}>
          {filtered.map((event, i) => (
            <motion.div
              key={event.id}
              className={styles.event}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className={styles.eventLeft}>
                <span className={styles.typeIcon} title={event.type}>
                  {TYPE_ICONS[event.type]}
                </span>
                <span
                  className={styles.agentEmoji}
                  style={{ opacity: event.agentId === "vector" ? 1 : 0.85 }}
                >
                  {event.emoji}
                </span>
              </div>
              <div className={styles.eventContent}>
                <p className={styles.message}>
                  {event.simulated ? "[simulated] " : ""}
                  {event.message}
                </p>
                <div className={styles.meta}>
                  <span className={styles.time}>{formatTime(event.timestamp)}</span>
                  <span
                    className={styles.priority}
                    style={{ color: PRIORITY_COLORS[event.priority] }}
                  >
                    {event.priority}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
