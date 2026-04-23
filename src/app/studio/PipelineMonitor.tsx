"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./PipelineMonitor.module.css";

interface Platform {
  name: string;
  status: "pass" | "fail" | "unknown";
  notes: string;
}

interface PipelineData {
  status: string;
  platforms: Platform[];
  lastChecked: string | null;
  error?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Windows: "#06b6d4",
  Linux: "#10b981",
  "macOS x86_64": "#ef4444",
  "macOS aarch64": "#10b981",
  Android: "#22c55e",
  iOS: "#6b7280",
  Web: "#8b5cf6",
};

export default function PipelineMonitor() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studio/pipeline", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d as PipelineData); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const passCount = data?.platforms.filter((p) => p.status === "pass").length ?? 0;
  const failCount = data?.platforms.filter((p) => p.status === "fail").length ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>⚡ PIPELINE MONITOR</span>
        <div className={styles.headerRight}>
          {data && (
            <div className={styles.headerStats}>
              <span style={{ color: "#4ade80" }}>{passCount} ✅</span>
              {failCount > 0 && <span style={{ color: "#ef4444" }}>{failCount} ❌</span>}
            </div>
          )}
          {data?.lastChecked && (
            <span className={styles.lastChecked}>Checked {data.lastChecked}</span>
          )}
        </div>
      </div>

      {loading && <div className={styles.loading}>Reading Bolt's pipeline report…</div>}

      {!loading && !data && (
        <div className={styles.empty}>No pipeline data yet — Bolt runs at 6:15 AM</div>
      )}

      {data && (
        <>
          {/* Status banner */}
          <div
            className={styles.statusBanner}
            style={{
              background:
                data.status === "healthy"
                  ? "rgba(74,222,128,0.08)"
                  : data.status === "degraded"
                  ? "rgba(239,68,68,0.08)"
                  : "rgba(255,255,255,0.03)",
              borderColor:
                data.status === "healthy"
                  ? "#4ade8040"
                  : data.status === "degraded"
                  ? "#ef444440"
                  : "#ffffff10",
            }}
          >
            <span
              className={styles.statusDot}
              style={{
                color:
                  data.status === "healthy" ? "#4ade80" : data.status === "degraded" ? "#ef4444" : "#6b7280",
              }}
            >
              ●
            </span>
            <span
              style={{
                color:
                  data.status === "healthy" ? "#4ade80" : data.status === "degraded" ? "#ef4444" : "#6b7280",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {data.status === "healthy" ? "ALL SYSTEMS GO" : data.status === "degraded" ? "DEGRADED — ACTION REQUIRED" : "UNKNOWN"}
            </span>
          </div>

          {/* Platform grid */}
          <div className={styles.platformGrid}>
            {data.platforms.map((platform) => (
              <motion.div
                key={platform.name}
                className={styles.platformCard}
                style={{ borderTopColor: PLATFORM_COLORS[platform.name] ?? "#6b7280" }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className={styles.platformHeader}>
                  <span className={styles.platformName}>{platform.name}</span>
                  <span
                    className={styles.platformStatus}
                    style={{ color: platform.status === "pass" ? "#4ade80" : platform.status === "fail" ? "#ef4444" : "#6b7280" }}
                  >
                    {platform.status === "pass" ? "✅ PASS" : platform.status === "fail" ? "❌ FAIL" : "⚪ —"}
                  </span>
                </div>
                {platform.notes && (
                  <div className={styles.platformNotes}>{platform.notes}</div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
