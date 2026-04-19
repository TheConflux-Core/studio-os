"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MissionTracker.module.css";

interface Mission {
  mission_id: string;
  title: string;
  status: string;
  priority?: string;
  updated_at: string;
  created_at: string;
  summary?: {
    problem?: string;
    pricing?: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; glow: string }> = {
  planning:      { label: "Planning",      color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
  queued:        { label: "Queued",        color: "#22d3ee", glow: "rgba(34,211,238,0.3)" },
  in_progress:   { label: "In Progress",   color: "#4ade80", glow: "rgba(74,222,128,0.3)" },
  under_review:  { label: "Under Review",  color: "#facc15", glow: "rgba(250,204,21,0.3)" },
  ready_for_launch: { label: "Ready",      color: "#f472b6", glow: "rgba(244,114,182,0.3)" },
  launched:      { label: "Launched",      color: "#06b6d4", glow: "rgba(6,182,212,0.3)" },
  complete:      { label: "Complete",      color: "#10b981", glow: "rgba(16,185,129,0.3)" },
  failed:        { label: "Failed",        color: "#ef4444", glow: "rgba(239,68,68,0.3)" },
  archived:       { label: "Archived",      color: "#6b7280", glow: "rgba(107,114,128,0.3)" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MissionTracker() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filter, setFilter] = useState<"active" | "complete" | "all">("active");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/missions")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setMissions(data);
      })
      .catch(() => {});
  }, []);

  const filtered = missions.filter((m) => {
    if (filter === "active") return !["complete", "archived", "failed"].includes(m.status);
    if (filter === "complete") return ["complete", "archived"].includes(m.status);
    return true;
  });

  const activeCount = missions.filter((m) => !["complete", "archived", "failed"].includes(m.status)).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>MISSIONS</span>
        <div className={styles.filters}>
          {(["active", "complete", "all"] as const).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "active" && activeCount > 0 && (
                <span className={styles.filterCount}>{activeCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <span>No missions in this state</span>
            </div>
          )}
          {filtered.map((mission, i) => {
            const cfg = STATUS_CONFIG[mission.status] ?? STATUS_CONFIG.archived;
            const isExpanded = expanded === mission.mission_id;
            return (
              <motion.div
                key={mission.mission_id}
                className={`${styles.mission} ${isExpanded ? styles.missionExpanded : ""}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.04 }}
              >
                {/* Mission row */}
                <button
                  className={styles.missionRow}
                  onClick={() => setExpanded(isExpanded ? null : mission.mission_id)}
                >
                  <div className={styles.missionLeft}>
                    {/* Status indicator */}
                    <div
                      className={styles.statusDot}
                      style={{
                        background: cfg.color,
                        boxShadow: `0 0 8px ${cfg.glow}`,
                      }}
                    />
                    <div className={styles.missionInfo}>
                      <span className={styles.missionTitle}>{mission.title}</span>
                      <div className={styles.missionMeta}>
                        <span className={styles.missionId}>{mission.mission_id}</span>
                        {mission.priority && (
                          <span
                            className={styles.priority}
                            style={{
                              color:
                                mission.priority === "critical" ? "#ef4444" :
                                mission.priority === "high" ? "#f59e0b" :
                                mission.priority === "medium" ? "#22d3ee" : "#6b7280",
                            }}
                          >
                            {mission.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.missionRight}>
                    <span
                      className={styles.statusBadge}
                      style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}10` }}
                    >
                      {cfg.label}
                    </span>
                    <span className={styles.updated}>{timeAgo(mission.updated_at)}</span>
                    <motion.span
                      className={styles.chevron}
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ›
                    </motion.span>
                  </div>
                </button>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className={styles.detail}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className={styles.detailInner}>
                        {mission.summary?.problem && (
                          <div className={styles.detailSection}>
                            <div className={styles.detailLabel}>PROBLEM</div>
                            <p>{mission.summary.problem}</p>
                          </div>
                        )}
                        {mission.summary?.pricing && (
                          <div className={styles.detailSection}>
                            <div className={styles.detailLabel}>PRICING</div>
                            <p>{mission.summary.pricing}</p>
                          </div>
                        )}
                        <div className={styles.detailGrid}>
                          <div className={styles.detailItem}>
                            <span className={styles.detailKey}>Created</span>
                            <span className={styles.detailVal}>
                              {new Date(mission.created_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailKey}>Updated</span>
                            <span className={styles.detailVal}>{timeAgo(mission.updated_at)}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailKey}>Priority</span>
                            <span className={styles.detailVal}>{mission.priority ?? "—"}</span>
                          </div>
                          <div className={styles.detailItem}>
                            <span className={styles.detailKey}>Market</span>
                            <span className={styles.detailVal}>
                              {mission.mission_id.includes("1223") ? "AI Agent Desktop" :
                               mission.mission_id.includes("1224") ? "Cybersecurity" : "—"}
                            </span>
                          </div>
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
