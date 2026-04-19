"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./OrgHealth.module.css";

interface GaugeProps {
  label: string;
  value: number;
  color: string;
  glowColor: string;
}

function Gauge({ label, value, color, glowColor }: GaugeProps) {
  const circumference = 2 * Math.PI * 36;
  const filled = (value / 100) * circumference;

  return (
    <div className={styles.gauge}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {/* Track */}
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="6"
        />
        {/* Fill */}
        <motion.circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 44 44)"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${filled} ${circumference}` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
        {/* Value */}
        <text
          x="44"
          y="40"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fontFamily="var(--font-mono)"
          fontWeight="700"
          fill={color}
        >
          {value}
        </text>
        <text
          x="44"
          y="55"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fontFamily="var(--font-mono)"
          fill="rgba(240,240,255,0.4)"
          letterSpacing="0.1em"
        >
          / 100
        </text>
      </svg>
      <div className={styles.gaugeLabel}>{label}</div>
    </div>
  );
}

const LABEL_COLORS = {
  healthy: "#4ade80",
  strained: "#facc15",
  blocked: "#ef4444",
  idle: "#6b7280",
};

export default function OrgHealth() {
  const [health, setHealth] = useState({
    pulseIndex: 0, momentum: 0, health: 0, autonomy: 0, velocity: 0,
    label: "idle" as "healthy" | "strained" | "blocked" | "idle",
  });

  useEffect(() => {
    fetch("/api/studio/health")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setHealth(d); })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.container}>
      {/* Big pulse number */}
      <div className={styles.pulseBlock}>
        <div className={styles.pulseLabel}>ORG PULSE</div>
        <div
          className={styles.pulseValue}
          style={{
            color: LABEL_COLORS[health.label],
            textShadow: `0 0 30px ${LABEL_COLORS[health.label]}60`,
          }}
        >
          {health.pulseIndex}
        </div>
        <div
          className={styles.pulseBar}
          style={{ background: LABEL_COLORS[health.label] }}
        />
        <div className={styles.pulseStatus} style={{ color: LABEL_COLORS[health.label] }}>
          ● {health.label.toUpperCase()}
        </div>
      </div>

      {/* Sub-gauges */}
      <div className={styles.gauges}>
        <Gauge
          label="MOMENTUM"
          value={health.momentum}
          color="#4ade80"
          glowColor="rgba(74,222,128,0.4)"
        />
        <Gauge
          label="HEALTH"
          value={health.health}
          color="#22d3ee"
          glowColor="rgba(34,211,238,0.4)"
        />
        <Gauge
          label="AUTONOMY"
          value={health.autonomy}
          color="#a78bfa"
          glowColor="rgba(167,139,250,0.4)"
        />
        <Gauge
          label="VELOCITY"
          value={health.velocity}
          color="#f472b6"
          glowColor="rgba(244,114,182,0.4)"
        />
      </div>

      {/* Trend indicators */}
      <div className={styles.trends}>
        <TrendRow label="Momentum" value={health.momentum} delta={+8} />
        <TrendRow label="Health" value={health.health} delta={0} />
        <TrendRow label="Autonomy" value={health.autonomy} delta={+12} />
        <TrendRow label="Velocity" value={health.velocity} delta={-3} />
      </div>
    </div>
  );
}

function TrendRow({ label, value, delta }: { label: string; value: number; delta: number }) {
  return (
    <div className={styles.trendRow}>
      <span className={styles.trendLabel}>{label}</span>
      <div className={styles.trendBar}>
        <div
          className={styles.trendFill}
          style={{
            width: `${value}%`,
            background:
              delta > 0
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : delta < 0
                ? "linear-gradient(90deg, #f87171, #ef4444)"
                : "linear-gradient(90deg, #94a3b8, #64748b)",
          }}
        />
      </div>
      <span
        className={styles.trendDelta}
        style={{ color: delta > 0 ? "#4ade80" : delta < 0 ? "#ef4444" : "#6b7280" }}
      >
        {delta > 0 ? `↑ ${delta}` : delta < 0 ? `↓ ${Math.abs(delta)}` : "→"}
      </span>
    </div>
  );
}
