"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MissionControl.module.css";

// ---- Types ----

interface MissionSummary {
  missionId: string;
  title: string;
  status: string;
  priority: string;
  due: string;
  progress: number;
  division: string;
  owners: string[];
  blockers: string[];
  lastUpdate: string;
}

// ---- Config ----

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  planning:      { label: "Planning",      color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  queued:        { label: "Queued",        color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
  in_progress:   { label: "In Progress",  color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  under_review:  { label: "Under Review", color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  ready_for_launch: { label: "Ready",     color: "#f472b6", bg: "rgba(244,114,182,0.1)" },
  launched:      { label: "Launched",     color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  complete:      { label: "Complete",     color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  failed:        { label: "Failed",       color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  archived:      { label: "Archived",     color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: "#ef4444", label: "CRIT" },
  high:     { color: "#f59e0b", label: "HIGH" },
  medium:   { color: "#22d3ee", label: "MED" },
  low:      { color: "#6b7280", label: "LOW" },
};

const DIVISION_COLORS: Record<string, string> = {
  strategy:    "#f59e0b",
  security:    "#ef4444",
  product:     "#8b5cf6",
  intelligence: "#06b6d4",
  ops:         "#10b981",
  growth:      "#ec4899",
};

// Map raw mission JSON → MissionSummary
function mapMission(raw: Record<string, unknown>): MissionSummary {
  const summary = raw.summary as Record<string, string> | undefined;
  const blockers = (raw.blockers as string[] | undefined) ?? [];
  const owners = (raw.owners as string[] | undefined) ?? [];
  const updatedAt = (raw.updated_at as string) ?? new Date().toISOString();

  // Compute progress from milestones if available
  let progress = 0;
  if (typeof raw.progress === "number") {
    progress = raw.progress;
  } else if (Array.isArray(raw.milestones)) {
    const done = (raw.milestones as Array<{status?: string}>).filter(m => m.status === "complete").length;
    progress = raw.milestones.length > 0 ? Math.round((done / raw.milestones.length) * 100) : 0;
  }

  // Due date
  let due = "—";
  if (typeof raw.due_date === "string") {
    due = raw.due_date;
  } else if (typeof raw.due === "string") {
    due = raw.due;
  }

  return {
    missionId: (raw.mission_id as string) ?? "",
    title: (raw.title as string) ?? summary?.problem?.slice(0, 60) ?? "Untitled",
    status: (raw.status as string) ?? "planning",
    priority: (raw.priority as string) ?? "medium",
    due,
    progress,
    division: (raw.division as string) ?? "product",
    owners,
    blockers,
    lastUpdate: updatedAt,
  };
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MissionControl() {
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/studio/missions", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const raw: Record<string, unknown>[] = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          setMissions(raw.map(mapMission));
        }
      } catch {
        // graceful degradation — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const active = missions.filter((m) => !["complete", "archived", "failed"].includes(m.status));
  const done = missions.filter((m) => ["complete", "archived"].includes(m.status));

  return (
    <div className={styles.container}>
      {/* Header stats */}
      <div className={styles.header}>
        <div className={styles.headerStat}>
          <span className={styles.headerNum} style={{ color: "#4ade80" }}>{active.length}</span>
          <span className={styles.headerLabel}>Active</span>
        </div>
        <div className={styles.headerStat}>
          <span className={styles.headerNum} style={{ color: "#a78bfa" }}>{done.length}</span>
          <span className={styles.headerLabel}>Done</span>
        </div>
        <div className={styles.headerStat}>
          <span className={styles.headerNum} style={{ color: "#ef4444" }}>
            {active.filter((m) => m.priority === "critical").length}
          </span>
          <span className={styles.headerLabel}>Critical</span>
        </div>
        <div className={styles.headerStat}>
          <span className={styles.headerNum} style={{ color: "#facc15" }}>
            {active.filter((m) => m.blockers.length > 0).length}
          </span>
          <span className={styles.headerLabel}>Blocked</span>
        </div>
      </div>

      {/* Active missions */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>ACTIVE MISSIONS</div>
        <div className={styles.missionList}>
          {loading && [1, 2].map((i) => (
            <div key={`skel-${i}`} className={styles.skeleton} />
          ))}
          {!loading && active.length === 0 && (
            <div className={styles.empty}>No active missions</div>
          )}
          {active.map((mission, i) => (
            <MissionCard
              key={mission.missionId}
              mission={mission}
              index={i}
              expanded={expanded === mission.missionId}
              onToggle={() => setExpanded(expanded === mission.missionId ? null : mission.missionId)}
            />
          ))}
        </div>
      </div>

      {/* Completed */}
      {done.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>COMPLETED</div>
          <div className={styles.missionList}>
            {done.map((mission, i) => (
              <MissionCard
                key={mission.missionId}
                mission={mission}
                index={i}
                expanded={expanded === mission.missionId}
                onToggle={() => setExpanded(expanded === mission.missionId ? null : mission.missionId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissionCard({
  mission,
  index,
  expanded,
  onToggle,
}: {
  mission: MissionSummary;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusCfg = STATUS_CONFIG[mission.status] ?? STATUS_CONFIG.archived;
  const priCfg = PRIORITY_CONFIG[mission.priority] ?? PRIORITY_CONFIG.low;
  const divColor = DIVISION_COLORS[mission.division] ?? "#6b7280";

  return (
    <motion.div
      className={styles.missionCard}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ borderLeftColor: statusCfg.color }}
    >
      <button className={styles.missionHeader} onClick={onToggle}>
        <div className={styles.missionLeft}>
          <div className={styles.missionTitle}>{mission.title}</div>
          <div className={styles.missionMeta}>
            <span className={styles.missionId}>{mission.missionId}</span>
            <span
              className={styles.priorityBadge}
              style={{ color: priCfg.color, borderColor: `${priCfg.color}40`, background: `${priCfg.color}10` }}
            >
              {priCfg.label}
            </span>
            <span
              className={styles.statusBadge}
              style={{ color: statusCfg.color, borderColor: `${statusCfg.color}40`, background: statusCfg.bg }}
            >
              {statusCfg.label}
            </span>
            <span className={styles.divisionDot} style={{ background: divColor }} />
            {mission.due && mission.due !== "—" && (
              <span className={styles.missionDue}>Due {mission.due}</span>
            )}
          </div>
        </div>
        <div className={styles.missionRight}>
          <div className={styles.progressColumn}>
            <span className={styles.progressNum}>{mission.progress}%</span>
            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                style={{ background: statusCfg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
              />
            </div>
          </div>
          <motion.span
            className={styles.expandChevron}
            animate={{ rotate: expanded ? 90 : 0 }}
          >
            ›
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className={styles.missionDetail}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.detailInner}>
              {/* Owners */}
              {mission.owners.length > 0 && (
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel}>OWNERS</span>
                  <div className={styles.owners}>
                    {mission.owners.map((o) => (
                      <span key={o} className={styles.ownerChip}>{o}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Blockers */}
              {mission.blockers.length > 0 && (
                <div className={styles.detailSection}>
                  <span className={styles.detailLabel} style={{ color: "#ef4444" }}>⚠️ BLOCKERS</span>
                  <ul className={styles.blockers}>
                    {mission.blockers.map((b, i) => (
                      <li key={i} className={styles.blocker}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Last update */}
              <div className={styles.detailSection}>
                <span className={styles.detailLabel}>LAST UPDATE</span>
                <span className={styles.lastUpdate}>{timeAgo(mission.lastUpdate)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
