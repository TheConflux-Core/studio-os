"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./EmailInbox.module.css";

interface EmailSummary {
  date: string;
  period: "AM" | "PM";
  file: string;
  flags: string[];
  total: number;
  urgent: string[];
}

export default function EmailInbox() {
  const [summaries, setSummaries] = useState<EmailSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studio/email-inbox", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.summaries) setSummaries(d.summaries); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalUrgent = summaries.reduce((sum, s) => sum + s.urgent.length, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>📧 EMAIL INBOX</span>
        <div className={styles.headerRight}>
          {totalUrgent > 0 && (
            <span className={styles.urgentBadge}>{totalUrgent} URGENT</span>
          )}
          <span className={styles.schedule}>Aegis — 9:30 AM & 3:30 PM</span>
        </div>
      </div>

      {loading && <div className={styles.loading}>Scanning inbox…</div>}

      {!loading && summaries.length === 0 && (
        <div className={styles.empty}>
          <span>No email summaries yet.</span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Aegis checks Don's inbox at 9:30 AM and 3:30 PM</span>
        </div>
      )}

      <div className={styles.feed}>
        {summaries.map((summary, i) => (
          <motion.div
            key={`${summary.date}-${summary.period}`}
            className={styles.card}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardLeft}>
                <span className={styles.periodBadge}>{summary.period}</span>
                <span className={styles.cardDate}>{summary.date}</span>
              </div>
              <div className={styles.cardRight}>
                {summary.total > 0 && (
                  <span className={styles.totalBadge}>{summary.total} emails</span>
                )}
                {summary.urgent.length > 0 && (
                  <span className={styles.urgentCount}>{summary.urgent.length} ⚠️</span>
                )}
              </div>
            </div>

            {summary.urgent.length > 0 && (
              <div className={styles.urgentSection}>
                {summary.urgent.map((u, j) => (
                  <div key={j} className={styles.urgentItem}>🚨 {u}</div>
                ))}
              </div>
            )}

            {summary.flags.length > 0 && (
              <div className={styles.flags}>
                {summary.flags.slice(0, 4).map((f, j) => (
                  <div key={j} className={styles.flagItem}>• {f.slice(0, 120)}{f.length > 120 ? "…" : ""}</div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
