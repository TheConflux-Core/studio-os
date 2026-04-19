"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAgentCommsData, getRecentActivity, timeAgo, AgentActivity } from "@/data/businessCalendars";
import styles from "./AgentComms.module.css";

const TYPE_CONFIG = {
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
  dream:    { emoji: "🌙", color: "#f59e0b", label: "Dream Cycle" },
} as const satisfies Record<string, { emoji: string; color: string; label: string }>;

type Tab = "activity" | "outbound" | "escalations";

export default function AgentComms() {
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [tab, setTab] = useState<Tab>("activity");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setActivity(getRecentActivity());
    const id = setInterval(() => {
      setActivity(getRecentActivity());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const outboundMessages = activity.filter((a) => a.type === "email" || a.target === "Don");
  const escalations = activity.filter(
    (a) => a.action.toLowerCase().includes("block") ||
           a.action.toLowerCase().includes("escalat") ||
           a.action.toLowerCase().includes("urgent") ||
           a.action.toLowerCase().includes("failed")
  );

  return (
    <div className={styles.container}>
      {/* Tab bar */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "activity" ? styles.tabActive : ""}`}
          onClick={() => setTab("activity")}
        >
          ⚡ Agent Activity
          <span className={styles.tabCount}>{activity.length}</span>
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

      {/* Activity feed */}
      <div className={styles.feed}>
        <AnimatePresence initial={false}>
          {(tab === "activity" ? activity : tab === "outbound" ? outboundMessages : escalations).map((item, i) => {
            const cfg = TYPE_CONFIG[item.type];
            const isExpanded = expanded === `${item.agentId}-${i}`;
            return (
              <motion.div
                key={`${item.agentId}-${i}`}
                className={styles.activityCard}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Card header */}
                <button
                  className={styles.cardHeader}
                  onClick={() => setExpanded(isExpanded ? null : `${item.agentId}-${i}`)}
                >
                  <div className={styles.cardLeft}>
                    <span
                      className={styles.agentAvatar}
                      style={{ borderColor: item.agentColor }}
                    >
                      {item.agentEmoji}
                    </span>
                    <div className={styles.cardMeta}>
                      <span className={styles.agentName} style={{ color: item.agentColor }}>
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

                {/* Expanded proof */}
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
                          <span className={styles.proofLabel}>PROOF</span>
                          <p className={styles.proofText}>{item.proof}</p>
                        </div>
                        <div className={styles.proofSection}>
                          <span className={styles.proofLabel}>EVIDENCE</span>
                          <code className={styles.proofEvidence}>{item.evidence}</code>
                        </div>
                        {item.target && (
                          <div className={styles.proofSection}>
                            <span className={styles.proofLabel}>TO</span>
                            <span className={styles.proofTarget}>{item.target}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {escalations.length === 0 && tab === "escalations" && (
          <div className={styles.empty}>
            <span>🟢 No escalations — things are running clean</span>
          </div>
        )}
      </div>
    </div>
  );
}
