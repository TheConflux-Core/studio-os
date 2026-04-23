"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./GrowthPulse.module.css";

interface GrowthSnapshot {
  date: string;
  file: string;
  highlights: string[];
  productHunt?: { upvotes: number; comments: number; position: number };
}

export default function GrowthPulse() {
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/studio/growth", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.snapshots) setSnapshots(d.snapshots); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = snapshots[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>📣 GROWTH PULSE</span>
        <span className={styles.subtitle}>Pulse — 7:30 AM daily</span>
      </div>

      {loading && <div className={styles.loading}>Loading growth data…</div>}

      {!loading && snapshots.length === 0 && (
        <div className={styles.empty}>
          <span>No growth snapshots yet.</span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Pulse runs at 7:30 AM daily</span>
        </div>
      )}

      {latest && (
        <div className={styles.latestBanner}>
          <span className={styles.latestDate}>{latest.date}</span>
          {latest.productHunt && (
            <div className={styles.phStats}>
              <span className={styles.phUpvotes}>▲ {latest.productHunt.upvotes} upvotes</span>
              {latest.productHunt.comments > 0 && (
                <span className={styles.phComments}>{latest.productHunt.comments} comments</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className={styles.feed}>
        {snapshots.map((snap, i) => (
          <motion.div
            key={snap.date}
            className={styles.card}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ opacity: i === 0 ? 1 : 0.7 }}
          >
            <div className={styles.cardDate}>{snap.date}</div>
            {snap.highlights.slice(0, 3).map((h, j) => (
              <div key={j} className={styles.highlight}>• {h.slice(0, 100)}{h.length > 100 ? "…" : ""}</div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
