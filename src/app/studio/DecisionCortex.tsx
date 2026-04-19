"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./DecisionCortex.module.css";

interface Decision {
  decision_id: string;
  opportunity_id: string;
  decision: string;
  approved_by: string;
  created_at: string;
  rationale?: { summary: string };
}

export default function DecisionCortex() {
  const [decisions, setDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    fetch("/api/studio/decisions")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { if (Array.isArray(d)) setDecisions(d); })
      .catch(() => {});
  }, []);

  if (decisions.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <p>No decisions recorded yet</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>DECISION CORTEX</span>
        <span className={styles.count}>{decisions.length} recorded</span>
      </div>
      <div className={styles.list}>
        {decisions.map((d, i) => (
          <motion.div
            key={d.decision_id}
            className={styles.decision}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={styles.decisionTop}>
              <span
                className={`${styles.verdict} ${
                  d.decision.toLowerCase() === "approve"
                    ? styles.approve
                    : d.decision.toLowerCase() === "reject"
                    ? styles.reject
                    : styles.pending
                }`}
              >
                {d.decision.toUpperCase()}
              </span>
              <span className={styles.oppId}>{d.opportunity_id}</span>
              <span className={styles.date}>
                {new Date(d.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {d.rationale?.summary && (
              <p className={styles.rationale}>
                {d.rationale.summary.slice(0, 100)}
                {d.rationale.summary.length > 100 ? "..." : ""}
              </p>
            )}
            <div className={styles.decisionMeta}>
              <span>by {d.approved_by}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
