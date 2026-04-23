"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./EventDetailModal.module.css";

export interface ScheduledEventDetail {
  id: string;
  time: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  agentColor: string;
  division: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "running" | "done" | "missed";
  completedAt?: string;
  priority: string;
  schedule_description: string;
  window_minutes: number;
  depends_on: string[];
  output_ref?: string;
  circuit_breaker_threshold: number;
  rate_limit_max: number;
  job_id: string;
}

const TYPE_LABELS: Record<string, string> = {
  scan: "Security Scan", report: "CI/CD Report", standup: "Team Standup",
  sync: "Team Sync", email: "Email / Digest", pipeline: "Pipeline",
  dream: "Dream Cycle", financial: "Finance", security: "Security Ops",
  growth: "Growth Sprint", milestone: "Milestone", discover: "Market Intelligence",
  build: "Build Sprint", verify: "QA Gate", decision: "Strategic Decision",
  ops: "Operations",
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f59e0b",
  MEDIUM: "#22d3ee",
  LOW: "#6b7280",
};

const DIVISION_LABELS: Record<string, string> = {
  strategy: "Strategy & Vision",
  security: "Security Operations",
  product: "Product Engineering",
  intelligence: "Market Intelligence",
  ops: "DevOps & Infrastructure",
  growth: "Growth & Marketing",
};

interface EventDetailModalProps {
  event: ScheduledEventDetail | null;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [event, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (event) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [event]);

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className={styles.modalHeader} style={{ borderBottomColor: `${event.agentColor}30` }}>
              <div className={styles.headerLeft}>
                {/* Agent avatar */}
                <div
                  className={styles.agentAvatar}
                  style={{
                    borderColor: event.agentColor,
                    boxShadow: `0 0 16px ${event.agentColor}40`,
                  }}
                >
                  <span className={styles.agentEmoji}>{event.agentEmoji}</span>
                </div>
                <div className={styles.headerInfo}>
                  <div className={styles.agentName} style={{ color: event.agentColor }}>
                    {event.agentName}
                  </div>
                  <div className={styles.division}>
                    {DIVISION_LABELS[event.division] ?? event.division}
                  </div>
                </div>
              </div>

              <div className={styles.headerRight}>
                {/* Status badge */}
                <span
                  className={styles.statusBadge}
                  style={{
                    color: event.status === "done" ? "#4ade80" : event.status === "running" ? "#facc15" : "#6b7280",
                    background: event.status === "done" ? "rgba(74,222,128,0.1)" : event.status === "running" ? "rgba(250,204,21,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${event.status === "done" ? "rgba(74,222,128,0.3)" : event.status === "running" ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {event.status === "done" ? "✓ Completed" : event.status === "running" ? "● Running" : event.status === "missed" ? "✗ Missed" : "○ Scheduled"}
                </span>

                {/* Priority badge */}
                <span
                  className={styles.priorityBadge}
                  style={{
                    color: PRIORITY_COLORS[event.priority] ?? "#6b7280",
                    background: `${PRIORITY_COLORS[event.priority] ?? "#6b7280"}15`,
                    border: `1px solid ${PRIORITY_COLORS[event.priority] ?? "#6b7280"}40`,
                  }}
                >
                  {event.priority}
                </span>

                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              {/* Title section */}
              <div className={styles.titleSection}>
                <h2 id="modal-title" className={styles.eventTitle}>{event.title}</h2>
                <span className={styles.typeBadge}>{TYPE_LABELS[event.type] ?? event.type}</span>
              </div>

              {/* Meta grid */}
              <div className={styles.metaGrid}>
                <MetaRow icon="🕐" label="Schedule" value={event.schedule_description} />
                <MetaRow icon="⏱️" label="Window" value={`${event.window_minutes} min execution window`} />
                <MetaRow
                  icon="⚡"
                  label="Rate Limit"
                  value={`${event.rate_limit_max} API calls max`}
                />
                <MetaRow
                  icon="🔄"
                  label="Circuit Breaker"
                  value={`Opens after ${event.circuit_breaker_threshold} consecutive failures`}
                />
              </div>

              {/* What this agent does */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>📋</span>
                  <span className={styles.sectionTitle}>What This Agent Does</span>
                </div>
                <div className={styles.descriptionBox}>
                  <p className={styles.descriptionText}>{event.description}</p>
                </div>
              </div>

              {/* Dependencies */}
              {event.depends_on.length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}>🔗</span>
                    <span className={styles.sectionTitle}>Depends On</span>
                  </div>
                  <div className={styles.dependsList}>
                    {event.depends_on.map((dep) => (
                      <span key={dep} className={styles.dependsChip}>
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Output */}
              {event.output_ref && event.output_ref !== "commits + RUN_LOG" && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}>📁</span>
                    <span className={styles.sectionTitle}>Output File</span>
                  </div>
                  <code className={styles.outputRef}>
                    /home/calo/.openclaw/shared/{event.output_ref.replace("/shared/", "")}
                  </code>
                </div>
              )}

              {/* Execution window info */}
              <div className={styles.timingBox}>
                <div className={styles.timingItem}>
                  <span className={styles.timingLabel}>FIRES AT</span>
                  <span className={styles.timingValue} style={{ color: event.agentColor }}>
                    {event.time}
                  </span>
                </div>
                <div className={styles.timingDivider} />
                <div className={styles.timingItem}>
                  <span className={styles.timingLabel}>WINDOW</span>
                  <span className={styles.timingValue}>
                    {event.window_minutes} min
                  </span>
                </div>
                <div className={styles.timingDivider} />
                <div className={styles.timingItem}>
                  <span className={styles.timingLabel}>JOB ID</span>
                  <span className={styles.timingValue} style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    {event.job_id}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={styles.metaRow}>
      <span className={styles.metaIcon}>{icon}</span>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value}</span>
    </div>
  );
}
