"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Agent, DIVISION_LABELS } from "@/data/agentRoster";
import styles from "./AgentDetail.module.css";

const STATUS_LABELS = {
  active: "Active",
  busy: "Busy",
  idle: "Idle",
  blocked: "Blocked",
  parked: "Parked",
};

const AUTONOMY_LABELS = {
  full: "Full Autonomy",
  high: "High Autonomy",
  medium: "Medium",
  low: "Low",
};

interface AgentDetailProps {
  agent: Agent | null;
  onClose: () => void;
}

export default function AgentDetail({ agent, onClose }: AgentDetailProps) {
  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.panel}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={styles.header}
              style={{ borderColor: `${agent.color}40` }}
            >
              <div className={styles.headerTop}>
                <span className={styles.emoji}>{agent.emoji}</span>
                <div className={styles.headerMeta}>
                  <h2 className={styles.name}>{agent.name}</h2>
                  <p className={styles.role}>{agent.role}</p>
                </div>
                <button className={styles.closeBtn} onClick={onClose}>
                  ✕
                </button>
              </div>
              <div className={styles.badges}>
                <span
                  className={`badge ${agent.status === "active" ? "status-active" : agent.status === "busy" ? "status-busy" : agent.status === "parked" ? "status-parked" : "status-idle"}`}
                >
                  {STATUS_LABELS[agent.status]}
                </span>
                <span
                  className="badge"
                  style={{ background: `${agent.color}20`, color: agent.color }}
                >
                  {DIVISION_LABELS[agent.division]}
                </span>
                <span
                  className="badge"
                  style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}
                >
                  {AUTONOMY_LABELS[agent.schedule.autonomyLevel]}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {/* Summary */}
              <p className={styles.summary}>{agent.longDescription}</p>

              <div className={styles.divider} />

              {/* Stats grid */}
              <div className={styles.statsGrid}>
                <StatBox label="Load" value={agent.load} unit="%" color="#f59e0b" />
                <StatBox label="Energy" value={agent.energy} unit="%" color="#4ade80" />
                <StatBox label="Velocity" value={agent.velocity} unit="%" color="#22d3ee" />
                <StatBox label="Strength" value={agent.capabilities.strength} unit="%" color={agent.color} />
              </div>

              <div className={styles.divider} />

              {/* Current focus */}
              <div className={styles.section}>
                <div className={styles.sectionLabel}>CURRENT FOCUS</div>
                <p className={styles.focusText}>
                  {agent.currentFocus ?? "No active focus — waiting for assignment"}
                </p>
              </div>

              {/* Schedule */}
              <div className={styles.section}>
                <div className={styles.sectionLabel}>SCHEDULE</div>
                <div className={styles.scheduleGrid}>
                  <div className={styles.scheduleItem}>
                    <span className={styles.scheduleKey}>Hours</span>
                    <span className={styles.scheduleVal}>{agent.schedule.typicalHours}</span>
                  </div>
                  <div className={styles.scheduleItem}>
                    <span className={styles.scheduleKey}>Peak</span>
                    <span className={styles.scheduleVal}>{agent.schedule.peakPerformance}</span>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className={styles.section}>
                <div className={styles.sectionLabel}>CAPABILITIES</div>
                <p className={styles.specialty}>{agent.capabilities.specialty}</p>
                <div className={styles.tools}>
                  {agent.capabilities.tools.map((tool) => (
                    <span key={tool} className={styles.tool}>{tool}</span>
                  ))}
                </div>
              </div>

              {/* Collaborations */}
              <div className={styles.section}>
                <div className={styles.sectionLabel}>COLLABORATES WITH</div>
                <div className={styles.collabs}>
                  {agent.collaborationEdges.map((id) => (
                    <span key={id} className={styles.collabChip}>
                      {id}
                    </span>
                  ))}
                </div>
              </div>

              {/* Energy bar */}
              <div className={styles.section}>
                <div className={styles.sectionLabel}>ENERGY LEVEL</div>
                <div className="energy-bar">
                  <div
                    className="energy-fill"
                    style={{
                      width: `${agent.energy}%`,
                      background:
                        agent.energy > 80
                          ? "linear-gradient(90deg, #4ade80, #22c55e)"
                          : agent.energy > 60
                          ? "linear-gradient(90deg, #facc15, #eab308)"
                          : "linear-gradient(90deg, #ef4444, #dc2626)",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatBox({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className={styles.statBox}>
      <div className="stat-value" style={{ color }}>
        {value}
        <span style={{ fontSize: "0.7em", opacity: 0.6 }}>{unit}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div
        className={styles.statBar}
        style={{ background: `${color}30` }}
      >
        <div
          className={styles.statBarFill}
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
