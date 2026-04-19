"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMissionControlData, MissionSummary } from "@/data/businessCalendars";
import styles from "./MissionControl.module.css";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  planning:     { label: "Planning",     color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  in_progress:  { label: "In Progress",  color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  under_review: { label: "Under Review", color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  ready_for_launch: { label: "Ready",  color: "#f472b6", bg: "rgba(244,114,182,0.1)" },
  launched:     { label: "Launched",     color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  complete:    { label: "Complete",      color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  failed:      { label: "Failed",        color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  archived:    { label: "Archived",      color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: "#ef4444", label: "CRIT" },
  high:     { color: "#f59e0b", label: "HIGH" },
  medium:   { color: "#22d3ee", label: "MED" },
  low:      { color: "#6b7280", label: "LOW" },
};

const DIVISION_COLORS: Record<string, string> = {
  strategy: "#f59e0b",
  security: "#ef4444",
  product: "#8b5cf6",
  intelligence: "#06b6d4",
  business_ops: "#10b981",
  growth_creative: "#ec4899",
};

export default function MissionControl() {
  const [missions, setMissions] = useState<MissionSummary[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const data = getMissionControlData();
    setMissions(data.missions);
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
          <span className={styles.headerNum} style={{ color: "#ef4444" }}>{active.filter(m => m.priority === "critical").length}</span>
          <span className={styles.headerLabel}>Critical</span>
        </div>
        <div className={styles.headerStat}>
          <span className={styles.headerNum} style={{ color: "#facc15" }}>{active.filter(m => m.blockers.length > 0).length}</span>
          <span className={styles.headerLabel}>Blocked</span>
        </div>
      </div>

      {/* Active missions */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>ACTIVE MISSIONS</div>
        <div className={styles.missionList}>
          {active.map((mission, i) => (
            <MissionCard
              key={mission.missionId}
              mission={mission}
              index={i}
              expanded={expanded === mission.missionId}
              onToggle={() => setExpanded(expanded === mission.missionId ? null : mission.missionId)}
            />
          ))}
          {active.length === 0 && (
            <div className={styles.empty}>No active missions</div>
          )}
        </div>
      </div>

      {/* Completed */}
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
            <span className={styles.missionDue}>Due {mission.due}</span>
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
              <div className={styles.detailSection}>
                <span className={styles.detailLabel}>OWNERS</span>
                <div className={styles.owners}>
                  {mission.owners.map((o) => (
                    <span key={o} className={styles.ownerChip}>{o}</span>
                  ))}
                </div>
              </div>

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
                <span className={styles.lastUpdate}>{mission.lastUpdate}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
