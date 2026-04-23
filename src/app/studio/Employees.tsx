"use client";

import React, { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { AGENTS, Agent, DIVISION_LABELS, DIVISION_COLORS, Division } from "@/data/agentRoster";
import styles from "./Employees.module.css";

const STORAGE_KEY = "studio-os-agent-order";

function getStoredOrder(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveOrder(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

interface AgentRowProps {
  agent: Agent;
  isDragging: boolean;
}

function StatusDot({ status }: { status: Agent["status"] }) {
  const map: Record<Agent["status"], { color: string; label: string }> = {
    active:  { color: "#4ade80", label: "Active" },
    idle:    { color: "#fbbf24", label: "Idle" },
    busy:    { color: "#f87171", label: "Busy" },
    blocked: { color: "#a78bfa", label: "Blocked" },
    parked:  { color: "#6b7280", label: "Parked" },
  };
  const { color, label } = map[status];
  return (
    <span className={styles.statusDot} style={{ background: color }} title={label} />
  );
}

function DivisionBadge({ division }: { division: Division }) {
  const { primary } = DIVISION_COLORS[division];
  return (
    <span className={styles.divisionBadge} style={{ borderColor: primary, color: primary }}>
      {DIVISION_LABELS[division]}
    </span>
  );
}

function AgentRow({ agent, isDragging }: AgentRowProps) {
  return (
    <motion.div
      className={`${styles.agentRow} ${isDragging ? styles.dragging : ""}`}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Drag handle */}
      <div className={styles.dragHandle} title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="4" cy="3" r="1.2" fill="currentColor" opacity="0.5"/>
          <circle cx="4" cy="7" r="1.2" fill="currentColor" opacity="0.5"/>
          <circle cx="4" cy="11" r="1.2" fill="currentColor" opacity="0.5"/>
          <circle cx="10" cy="3" r="1.2" fill="currentColor" opacity="0.5"/>
          <circle cx="10" cy="7" r="1.2" fill="currentColor" opacity="0.5"/>
          <circle cx="10" cy="11" r="1.2" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>

      {/* Agent emoji */}
      <div className={styles.avatar} style={{ borderColor: agent.color }}>
        <span>{agent.emoji}</span>
      </div>

      {/* Name + Role */}
      <div className={styles.nameBlock}>
        <span className={styles.agentName}>{agent.name}</span>
        <span className={styles.agentRole}>{agent.role}</span>
      </div>

      {/* Division */}
      <div className={styles.cell}>
        <DivisionBadge division={agent.division} />
      </div>

      {/* Schedule */}
      <div className={`${styles.cell} ${styles.scheduleCell}`}>
        <span className={styles.scheduleLabel}>Typical Hours</span>
        <span className={styles.scheduleValue}>{agent.schedule.typicalHours}</span>
      </div>

      {/* Peak performance */}
      <div className={`${styles.cell} ${styles.peakCell}`}>
        <span className={styles.scheduleLabel}>Peak</span>
        <span className={styles.scheduleValue}>{agent.schedule.peakPerformance}</span>
      </div>

      {/* Autonomy */}
      <div className={`${styles.cell} ${styles.autonomyCell}`}>
        <span className={`${styles.autonomyBadge} ${styles[`autonomy_${agent.schedule.autonomyLevel}`]}`}>
          {agent.schedule.autonomyLevel}
        </span>
      </div>

      {/* Status */}
      <div className={`${styles.cell} ${styles.statusCell}`}>
        <StatusDot status={agent.status} />
        <span className={styles.statusLabel}>{agent.status}</span>
      </div>

      {/* Load bar */}
      <div className={`${styles.cell} ${styles.loadCell}`}>
        <div className={styles.loadBar}>
          <div
            className={styles.loadFill}
            style={{
              width: `${agent.load}%`,
              background: agent.load > 80 ? "#f87171" : agent.load > 50 ? "#fbbf24" : "#4ade80",
            }}
          />
        </div>
        <span className={styles.loadValue}>{agent.load}%</span>
      </div>

      {/* Energy */}
      <div className={`${styles.cell} ${styles.energyCell}`}>
        <span
          className={styles.energyValue}
          style={{ color: agent.energy > 70 ? "#4ade80" : agent.energy > 40 ? "#fbbf24" : "#f87171" }}
        >
          {agent.energy}%
        </span>
        <span className={styles.energyLabel}>energy</span>
      </div>

      {/* Current focus */}
      <div className={`${styles.cell} ${styles.focusCell}`}>
        <span className={styles.focusText}>{agent.currentFocus ?? "—"}</span>
      </div>
    </motion.div>
  );
}

export default function Employees() {
  // Build ordered list from localStorage or default
  const stored = getStoredOrder();
  const defaultOrder = stored && stored.length === AGENTS.length
    ? stored
    : AGENTS.map((a) => a.id);

  const [orderedIds, setOrderedIds] = useState<string[]>(defaultOrder);
  const [activeId, setActiveId] = useState<string | null>(null);

  const orderedAgents = orderedIds
    .map((id) => AGENTS.find((a) => a.id === id))
    .filter(Boolean) as Agent[];

  function handleReorder(newOrder: string[]) {
    setOrderedIds(newOrder);
    saveOrder(newOrder);
  }

  function resetOrder() {
    const defaultIds = AGENTS.map((a) => a.id);
    setOrderedIds(defaultIds);
    saveOrder(defaultIds);
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.title}>Employees</h2>
          <span className={styles.count}>{orderedAgents.length} agents</span>
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.resetBtn} onClick={resetOrder} title="Reset to default order">
            ↺ Reset
          </button>
          <span className={styles.hint}>← Drag rows to reorder →</span>
        </div>
      </div>

      {/* Header row */}
      <div className={styles.tableHeader}>
        <div className={styles.dragHandleCol} />
        <div className={styles.avatarCol} />
        <div className={styles.nameCol}>Name / Role</div>
        <div className={styles.cellCol}>Division</div>
        <div className={styles.cellCol}>Hours</div>
        <div className={styles.cellCol}>Peak</div>
        <div className={styles.cellCol}>Autonomy</div>
        <div className={styles.cellCol}>Status</div>
        <div className={styles.cellCol}>Load</div>
        <div className={styles.cellCol}>Energy</div>
        <div className={styles.focusCol}>Current Focus</div>
      </div>

      {/* Draggable body */}
      <Reorder.Group
        axis="y"
        values={orderedIds}
        onReorder={handleReorder}
        className={styles.tableBody}
      >
        {orderedAgents.map((agent) => (
          <Reorder.Item
            key={agent.id}
            value={agent.id}
            onDragStart={() => setActiveId(agent.id)}
            onDragEnd={() => setActiveId(null)}
            className={styles.reorderItem}
          >
            <AgentRow
              agent={agent}
              isDragging={activeId === agent.id}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Division summary footer */}
      <div className={styles.divisionSummary}>
        {Object.entries(DIVISION_LABELS).map(([div, label]) => {
          const count = orderedAgents.filter((a) => a.division === div).length;
          const { primary } = DIVISION_COLORS[div as Division];
          return (
            <div key={div} className={styles.divisionPill} style={{ borderColor: primary, color: primary }}>
              <span>{label}</span>
              <span className={styles.divisionCount}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
