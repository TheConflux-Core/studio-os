"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./MorningIntel.module.css";

interface MorningBrief {
  date: string;
  file: string;
  content: string;
  highlights: string[];
  fundingRounds: string[];
  competitorNews: string[];
}

export default function MorningIntel() {
  const [briefs, setBriefs] = useState<MorningBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio/morning-intel", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.briefs) setBriefs(d.briefs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>🔍 MORNING INTEL</span>
        <span className={styles.subtitle}>Helix — 6:30 AM daily</span>
      </div>

      {loading && <div className={styles.loading}>Loading Helix briefs…</div>}

      {!loading && briefs.length === 0 && (
        <div className={styles.empty}>
          <span>No market intel briefs yet.</span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>Helix scans overnight at 6:30 AM</span>
        </div>
      )}

      <div className={styles.feed}>
        {briefs.map((brief, i) => {
          const isExpanded = expanded === brief.date;
          return (
            <motion.div
              key={brief.date}
              className={styles.card}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button className={styles.cardHeader} onClick={() => setExpanded(isExpanded ? null : brief.date)}>
                <div className={styles.cardLeft}>
                  <span className={styles.briefDate}>{brief.date}</span>
                  <span className={styles.briefSrc}>Helix Research</span>
                </div>
                <motion.span
                  className={styles.chevron}
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                >
                  ›
                </motion.span>
              </button>

              {/* Always-visible highlights */}
              <div className={styles.highlights}>
                {brief.highlights.slice(0, 3).map((h, j) => (
                  <div key={j} className={styles.highlight}>• {h}</div>
                ))}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className={styles.detail}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className={styles.detailInner}>
                      {brief.highlights.slice(3).map((h, j) => (
                        <div key={j} className={styles.highlight}>• {h}</div>
                      ))}
                      {brief.fundingRounds.length > 0 && (
                        <div className={styles.section}>
                          <span className={styles.sectionLabel}>💰 FUNDING ROUNDS</span>
                          {brief.fundingRounds.map((r, j) => (
                            <div key={j} className={styles.fundingItem}>• {r}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
