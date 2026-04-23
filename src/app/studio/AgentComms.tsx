"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AgentComms.module.css";

// ---- Types ----

type EventType = "discovery" | "build" | "verify" | "security" | "strategy" | "growth" | "ops" | "social";

interface AgentEvent {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  color: string;
  type: EventType;
  action: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
}

const TYPE_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  scan:      { emoji: "🔍", color: "#06b6d4", label: "Scan" },
  report:   { emoji: "📊", color: "#10b981", label: "Report" },
  build:    { emoji: "🔨", color: "#8b5cf6", label: "Build" },
  verify:   { emoji: "✓",  color: "#22d3ee", label: "Verified" },
  discover: { emoji: "🔍", color: "#06b6d4", label: "Discovery" },
  email:    { emoji: "📧", color: "#ec4899", label: "Email" },
  security: { emoji: "🛡️", color: "#ef4444", label: "Security" },
  growth:   { emoji: "📈", color: "#ec4899", label: "Growth" },
  decision: { emoji: "🎯", color: "#f59e0b", label: "Decision" },
  standup:  { emoji: "📋", color: "#8b5cf6", label: "Standup" },
  sync:     { emoji: "🔄", color: "#6b7280", label: "Sync" },
  pipeline: { emoji: "⚡", color: "#8b5cf6", label: "Pipeline" },
  dream:    { emoji: "🌙", color: "#f59e0b", label: "Dream" },
  ops:      { emoji: "⚙️", color: "#10b981", label: "Ops" },
  social:   { emoji: "💬", color: "#6b7280", label: "Social" },
  discovery:{ emoji: "🔍", color: "#06b6d4", label: "Discovery" },
  strategy: { emoji: "🎯", color: "#f59e0b", label: "Strategy" },
};

type Tab = "activity" | "outbound" | "escalations";

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AgentComms() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [tab, setTab] = useState<Tab>("activity");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "simulated" | "empty">("empty");

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/studio/events", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const json = await res.json();
      if (json.events && Array.isArray(json.events)) {
        setEvents(json.events);
        setSource(json.source ?? "live");
      }
    } catch {
      setSource("empty");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, 30000);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const outboundMessages = events.filter(
    (e) =>
      e.action.toLowerCase().includes("email") ||
      e.action.toLowerCase().includes("digest") ||
      e.action.toLowerCase().includes("brief") ||
      e.action.toLowerCase().includes("to don")
  );

  const escalations = events.filter(
    (e) =>
      e.priority === "high" ||
      e.action.toLowerCase().includes("urgent") ||
      e.action.toLowerCase().includes("critical") ||
      e.action.toLowerCase().includes("security") ||
      e.action.toLowerCase().includes("cve") ||
      e.action.toLowerCase().includes("vulnerability") ||
      e.action.toLowerCase().includes("flagged")
  );

  const displayEvents = tab === "activity" ? events : tab === "outbound" ? outboundMessages : escalations;

  return (
    <div className={styles.container}>
      {/* Tab bar */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "activity" ? styles.tabActive : ""}`}
          onClick={() => setTab("activity")}
        >
          ⚡ Agent Activity
          <span className={styles.tabCount}>{events.length}</span>
          {source === "live" && <span className={styles.liveDot}>●</span>}
        </button>
        <button
          className={`${styles.tab} ${tab === "outbound" ? styles.tabActive : ""}`}
          onClick={() => setTab("outbound")}
        >
          📧 Outbound to Don
          <span className={styles.tabCount}>{outboundMessages.length}</span>
        </button>
        <button
          className={`${styles.tab} ${tab === "escalations" ? styles.tabActive : ""}`}
          onClick={() => setTab("escalations")}
        >
          🚨 Escalations
          <span className={`${styles.tabCount} ${escalations.length > 0 ? styles.tabCountAlert : ""}`}>
            {escalations.length}
          </span>
        </button>
      </div>

      {/* Source indicator */}
      <div className={styles.sourceBar}>
        {source === "live" && <span className={styles.liveBadge}>LIVE — RUN_LOG.md</span>}
        {source === "simulated" && <span className={styles.simulatedBadge}>SIMULATED</span>}
        {source === "empty" && <span className={styles.emptyBadge}>No events yet — agents haven&apos;t fired today</span>}
      </div>

      {/* Feed */}
      <div className={styles.feed}>
        <AnimatePresence initial={false}>
          {loading && [1, 2, 3].map((i) => (
            <div key={`skel-${i}`} className={styles.skeleton} />
          ))}

          {!loading && displayEvents.length === 0 && (
            <div className={styles.empty}>
              {tab === "activity" && <span>No agent activity recorded yet</span>}
              {tab === "outbound" && <span>No outbound messages to Don</span>}
              {tab === "escalations" && <span>🟢 No escalations — things are running clean</span>}
            </div>
          )}

          {displayEvents.map((item, i) => {
            const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.report;
            const isExpanded = expanded === item.id;

            return (
              <motion.div
                key={item.id}
                className={styles.activityCard}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Card header */}
                <button
                  className={styles.cardHeader}
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                >
                  <div className={styles.cardLeft}>
                    <span
                      className={styles.agentAvatar}
                      style={{ borderColor: item.color }}
                    >
                      {item.agentEmoji}
                    </span>
                    <div className={styles.cardMeta}>
                      <span className={styles.agentName} style={{ color: item.color }}>
                        {item.agentName}
                      </span>
                      <span className={styles.actionText}>{item.action}</span>
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span
                      className={styles.typeBadge}
                      style={{ color: cfg.color, background: `${cfg.color}15`, borderColor: `${cfg.color}30` }}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span className={styles.timestamp}>{timeAgo(item.timestamp)}</span>
                    <motion.span
                      className={styles.expandChevron}
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                    >
                      ›
                    </motion.span>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className={styles.proof}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={styles.proofInner}>
                        <div className={styles.proofSection}>
                          <span className={styles.proofLabel}>FULL ACTION</span>
                          <p className={styles.proofText}>{item.action}</p>
                        </div>
                        <div className={styles.proofSection}>
                          <span className={styles.proofLabel}>TIMESTAMP</span>
                          <span className={styles.proofTarget}>
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.proofSection}>
                          <span className={styles.proofLabel}>SOURCE</span>
                          <span className={styles.proofTarget}>RUN_LOG.md via /api/studio/events</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
