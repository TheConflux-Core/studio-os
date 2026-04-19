"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./AutonomyDial.module.css";

type DialLevel = "supervised" | "oversight" | "delegated" | "autonomous";

const DIAL_CONFIG: Record<
  DialLevel,
  {
    label: string;
    description: string;
    color: string;
    glow: string;
    position: number; // 0-100
    current_mode: string;
  }
> = {
  supervised: {
    label: "🔒 Supervised",
    description: "Agents suggest. Don approves everything.",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.3)",
    position: 10,
    current_mode: "phase_1_controlled_factory",
  },
  oversight: {
    label: "👁️ Oversight",
    description: "Agents act. Don monitors.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    position: 38,
    current_mode: "phase_1_controlled_factory",
  },
  delegated: {
    label: "🤖 Delegated",
    description: "Agents act. Don intervenes on exceptions only.",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    position: 65,
    current_mode: "phase_2_delegated",
  },
  autonomous: {
    label: "⚡ Autonomous",
    description: "Agents run 24/7. Don gets status summaries.",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.3)",
    position: 92,
    current_mode: "phase_3_autonomous",
  },
};

const DIAL_LEVELS: DialLevel[] = [
  "supervised",
  "oversight",
  "delegated",
  "autonomous",
];

// Reverse lookup: current_mode → DialLevel
function modeToLevel(mode: string): DialLevel {
  for (const [lvl, cfg] of Object.entries(DIAL_CONFIG)) {
    if (cfg.current_mode === mode) return lvl as DialLevel;
  }
  return "oversight";
}

export default function AutonomyDial() {
  const [level, setLevel] = useState<DialLevel>("oversight");
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount, fetch current mode from the API
  useEffect(() => {
    fetch("/api/studio/autonomy")
      .then((r) => r.json())
      .then((data) => {
        if (data.mode) {
          setActiveMode(data.mode);
          setLevel(modeToLevel(data.mode));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (lvl: DialLevel) => {
    if (lvl === "autonomous") return; // Not implemented yet
    if (lvl === level) return;

    setLevel(lvl);
    try {
      const res = await fetch("/api/studio/autonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: lvl }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveMode(data.mode);
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      }
    } catch (_) {}
  };

  const config = DIAL_CONFIG[level];
  const isAutonomousDisabled = level === "autonomous" || activeMode === "phase_3_autonomous";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>AUTONOMY DIAL</span>
        {!loading && activeMode && (
          <span className={styles.activeBadge}>
            {activeMode.replace("phase_1_controlled_factory", "Controlled").replace("phase_2_delegated", "Delegated").replace("phase_3_autonomous", "Autonomous")}
          </span>
        )}
        {saved && (
          <motion.span
            className={styles.savedBadge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            saved ✓
          </motion.span>
        )}
      </div>

      {/* Dial track */}
      <div className={styles.dialTrack}>
        <div className={styles.trackBg}>
          <motion.div
            className={styles.trackFill}
            animate={{
              width: `${config.position}%`,
              background: config.color,
              boxShadow: `0 0 16px ${config.glow}`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {/* Tick marks */}
        {DIAL_LEVELS.map((lvl) => (
          <button
            key={lvl}
            className={`${styles.tick} ${level === lvl ? styles.tickActive : ""}`}
            style={{ left: `${DIAL_CONFIG[lvl].position}%` }}
            onClick={() => handleSelect(lvl)}
            title={
              lvl === "autonomous"
                ? "Not implemented yet"
                : DIAL_CONFIG[lvl].description
            }
            disabled={lvl === "autonomous"}
          >
            <motion.div
              className={`${styles.tickDot} ${lvl === "autonomous" && isAutonomousDisabled ? styles.tickDisabled : ""}`}
              animate={{
                scale: level === lvl ? 1.4 : 1,
                background:
                  level === lvl
                    ? DIAL_CONFIG[lvl].color
                    : lvl === "autonomous" && isAutonomousDisabled
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.2)",
                boxShadow: level === lvl ? `0 0 12px ${DIAL_CONFIG[lvl].glow}` : "none",
              }}
              transition={{ duration: 0.3 }}
            />
          </button>
        ))}
      </div>

      {/* Labels */}
      <div className={styles.labels}>
        {DIAL_LEVELS.map((lvl) => (
          <span
            key={lvl}
            className={`${styles.label} ${level === lvl ? styles.labelActive : ""} ${lvl === "autonomous" && isAutonomousDisabled ? styles.labelDisabled : ""}`}
            style={{ color: level === lvl ? DIAL_CONFIG[lvl].color : undefined }}
            onClick={() => handleSelect(lvl)}
            title={lvl === "autonomous" ? "Not implemented yet" : undefined}
          >
            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
          </span>
        ))}
      </div>

      {/* Description */}
      <motion.div
        key={level}
        className={styles.description}
        style={{ borderColor: `${config.color}30`, color: config.color }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {config.description}
      </motion.div>

      {/* What changes at each level */}
      <div className={styles.capabilities}>
        {level !== "autonomous" && (
          <CapabilityRow label="Strategy" enabled={level === "delegated"} agent="Helix" />
        )}
        <CapabilityRow label="Builds" enabled={level === "delegated" || level === "autonomous"} agent="Forge" />
        <CapabilityRow label="Security" enabled={level === "autonomous"} agent="Viper/Aegis" />
        <CapabilityRow label="Growth" enabled={level === "oversight" || level === "delegated"} agent="Pulse" />
        <CapabilityRow label="Legal" enabled={level === "supervised"} agent="Lex" />
      </div>
    </div>
  );
}

function CapabilityRow({
  label,
  enabled,
  agent,
}: {
  label: string;
  enabled: boolean;
  agent: string;
}) {
  return (
    <div className={`${styles.capRow} ${enabled ? styles.capEnabled : ""}`}>
      <span className={styles.capDot} style={{ background: enabled ? "#4ade80" : "#374151" }} />
      <span className={styles.capLabel}>{label}</span>
      <span className={styles.capAgent}>{agent}</span>
    </div>
  );
}