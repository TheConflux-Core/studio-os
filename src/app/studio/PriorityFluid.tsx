"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./PriorityFluid.module.css";

interface PriorityItem {
  id: string;
  label: string;
  type: "opportunity" | "mission" | "task" | "security" | "growth";
  buoyancy: number; // 0-100, affects vertical position (higher = more urgent)
  density: number;  // increases when deferred
  assignee?: string;
  color: string;
  lastMoved?: string;
}

const LOADING_PLACEHOLDERS: PriorityItem[] = [
  { id: "loading-1", label: "Loading priorities…", type: "mission", buoyancy: 80, density: 0, color: "#8b5cf650" },
  { id: "loading-2", label: "Loading priorities…", type: "opportunity", buoyancy: 70, density: 0, color: "#f59e0b50" },
  { id: "loading-3", label: "Loading priorities…", type: "task", buoyancy: 60, density: 0, color: "#06b6d450" },
  { id: "loading-4", label: "Loading priorities…", type: "security", buoyancy: 90, density: 0, color: "#ef444450" },
];

const FALLBACK_ITEMS: PriorityItem[] = [
  { id: "sec-1", label: "Cybersecurity Layer (Aegis/Viper)", type: "security", buoyancy: 94, density: 10, assignee: "Aegis", color: "#ef4444" },
  { id: "sec-2", label: "Rotate API Keys — emergency", type: "security", buoyancy: 98, density: 5, assignee: "Bolt", color: "#ef4444" },
  { id: "growth-1", label: "Product Hunt Launch — Day 3", type: "growth", buoyancy: 87, density: 15, assignee: "Pulse", color: "#ec4899" },
  { id: "mission-1", label: "mission-1223: Conflux Home v0.1.73", type: "mission", buoyancy: 76, density: 20, assignee: "Prism", color: "#8b5cf6" },
  { id: "opp-1", label: "Q2 Roadmap Priorities", type: "opportunity", buoyancy: 82, density: 12, assignee: "Vector", color: "#f59e0b" },
  { id: "task-1", label: "Agent avatar regeneration", type: "task", buoyancy: 65, density: 25, assignee: "Vanta", color: "#06b6d4" },
  { id: "growth-2", label: "SEO content pipeline", type: "growth", buoyancy: 58, density: 30, assignee: "Pulse", color: "#ec4899" },
  { id: "opp-2", label: "Enterprise tier pricing review", type: "opportunity", buoyancy: 72, density: 18, assignee: "Ledger", color: "#f59e0b" },
  { id: "task-2", label: "Canonical state cleanup", type: "task", buoyancy: 44, density: 40, assignee: "ZigBot", color: "#06b6d4" },
  { id: "task-3", label: "CI/CD pipeline optimization", type: "task", buoyancy: 38, density: 45, assignee: "Bolt", color: "#06b6d4" },
];

const TYPE_LABELS: Record<PriorityItem["type"], string> = {
  security: "🛡️ Security",
  mission: "🔷 Mission",
  opportunity: "🎯 Opportunity",
  task: "⚙️ Task",
  growth: "📣 Growth",
};

async function fetchPriorities(): Promise<PriorityItem[]> {
  const res = await fetch("/api/studio/priorities", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items as PriorityItem[];
}

export default function PriorityFluid() {
  const [items, setItems] = useState<PriorityItem[]>(LOADING_PLACEHOLDERS);
  const [filter, setFilter] = useState<PriorityItem["type"] | "all">("all");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch real data on mount and poll every 15 seconds
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchPriorities();
        if (!cancelled) {
          setItems(data.length > 0 ? data : FALLBACK_ITEMS);
          setHasLoaded(true);
        }
      } catch {
        if (!cancelled && !hasLoaded) {
          // Only fall back on the first failure so real data takes precedence
          setItems(FALLBACK_ITEMS);
          setHasLoaded(true);
        }
      }
    }

    load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simulate organic movement
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          buoyancy: Math.max(
            5,
            Math.min(100, item.buoyancy + (Math.random() - 0.5) * 4)
          ),
          lastMoved: Math.random() > 0.6 ? new Date().toISOString() : item.lastMoved,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...items]
    .filter((i) => filter === "all" || i.type === filter)
    .sort((a, b) => b.buoyancy - a.buoyancy);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>PRIORITY FLUID</span>
        <div className={styles.filters}>
          {(["all", "security", "mission", "opportunity", "task", "growth"] as const).map(
            (t) => (
              <button
                key={t}
                className={`${styles.filterBtn} ${filter === t ? styles.filterActive : ""}`}
                onClick={() => setFilter(t)}
              >
                {t === "all" ? "All" : TYPE_LABELS[t]}
              </button>
            )
          )}
        </div>
      </div>

      <div className={styles.tank}>
        {/* Buoyancy lines */}
        {[100, 75, 50, 25].map((line) => (
          <div
            key={line}
            className={styles.buoyancyLine}
            style={{ bottom: `${line}%` }}
          >
            <span className={styles.buoyancyLabel}>{line}</span>
          </div>
        ))}

        {/* Items as floating bubbles */}
        <AnimatePresence>
          {sorted.map((item) => (
            <motion.div
              key={item.id}
              className={styles.bubble}
              style={{
                bottom: `${item.buoyancy}%`,
                borderColor: `${item.color}50`,
                background: `radial-gradient(circle at 30% 30%, ${item.color}20, transparent)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: item.buoyancy > 90 ? 1 : item.buoyancy > 60 ? 0.85 : 0.65,
                x: [0, (Math.random() - 0.5) * 8, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 0.3 },
                opacity: { duration: 0.5 },
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                bottom: { duration: 2, ease: "easeInOut" },
              }}
              layout
              title={`${item.label}\nBuoyancy: ${Math.round(item.buoyancy)}\nAssignee: ${item.assignee ?? "unassigned"}`}
            >
              <span className={styles.bubbleLabel} style={{ color: item.color }}>
                {item.label.length > 22 ? item.label.slice(0, 20) + "…" : item.label}
              </span>
              {item.buoyancy > 90 && (
                <motion.span
                  className={styles.priorityBadge}
                  style={{ background: item.color }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  HOT
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Surface line */}
        <div className={styles.surface} />
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span style={{ color: "#4ade80" }}>↑ HIGH</span>
          <span className={styles.legendSep}>→</span>
          <span style={{ color: "#6b7280" }}>LOW ↓</span>
          <span className={styles.legendSep}>|</span>
          <span className={styles.legendNote}>Higher = more urgent</span>
        </div>
      </div>
    </div>
  );
}
