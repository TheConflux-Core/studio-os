"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SecurityWatch.module.css";

interface SecurityFinding {
  source: "aegis" | "viper";
  date: string;
  title: string;
  status: "clean" | "warning" | "critical";
  severity?: "low" | "medium" | "high" | "critical";
  items: string[];
  rawFile: string;
}

const STATUS_COLOR: Record<string, string> = {
  clean: "#4ade80",
  warning: "#facc15",
  critical: "#ef4444",
};

const SOURCE_EMOJI: Record<string, string> = {
  aegis: "🛡️",
  viper: "🐍",
};

export default function SecurityWatch() {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/security", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.findings) setFindings(d.findings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const criticalCount = findings.filter((f) => f.status === "critical").length;
  const cleanCount = findings.filter((f) => f.status === "clean").length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>🛡️ SECURITY WATCH</span>
        <div className={styles.stats}>
          {criticalCount > 0 && (
            <span className={styles.criticalBadge}>{criticalCount} CRITICAL</span>
          )}
          <span className={styles.totalBadge}>{findings.length} scans</span>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>Scanning canonical files…</div>
      )}

      {!loading && findings.length === 0 && (
        <div className={styles.empty}>
          <span>No security scans recorded yet.</span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Aegis + Viper run daily at 6 AM and 7:45 AM</span>
        </div>
      )}

      <div className={styles.feed}>
        <AnimatePresence>
          {findings.map((f, i) => {
            const id = `${f.source}-${f.date}`;
            const isExpanded = expanded === id;
            const color = STATUS_COLOR[f.status] ?? "#6b7280";

            return (
              <motion.div
                key={id}
                className={styles.card}
                style={{ borderLeftColor: color }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <button className={styles.cardHeader} onClick={() => setExpanded(isExpanded ? null : id)}>
                  <div className={styles.cardLeft}>
                    <span className={styles.sourceEmoji}>{SOURCE_EMOJI[f.source]}</span>
                    <div>
                      <div className={styles.cardTitle}>{f.title}</div>
                      <div className={styles.cardMeta}>
                        <span className={styles.date}>{f.date}</span>
                        <span
                          className={styles.statusBadge}
                          style={{ color, background: `${color}20` }}
                        >
                          {f.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.span
                    className={styles.chevron}
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                  >
                    ›
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className={styles.detail}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className={styles.detailInner}>
                        {f.items.length > 0 ? (
                          <ul className={styles.itemList}>
                            {f.items.map((item, j) => (
                              <li key={j} className={styles.item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className={styles.noItems}>No items extracted — expand raw file</span>
                        )}
                        <div className={styles.fileRef}>
                          📄 {f.rawFile}
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
