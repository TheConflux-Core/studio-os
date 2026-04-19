"use client";

import React from "react";
import { motion } from "framer-motion";
import { getCompanyMetrics } from "@/data/businessCalendars";
import styles from "./MetricsStrip.module.css";

export default function MetricsStrip() {
  const m = getCompanyMetrics();

  return (
    <div className={styles.container}>
      <div className={styles.metric} style={{ borderTopColor: "#ef4444" }}>
        <div className={styles.metricTop}>
          <span className={styles.metricLabel}>SECURITY LAYER</span>
          <span className={styles.metricBadge} style={{ color: m.securityDaysRemaining <= 7 ? "#ef4444" : "#facc15" }}>
            {m.securityDaysRemaining === 0 ? "DUE TODAY" : `${m.securityDaysRemaining}d left`}
          </span>
        </div>
        <div className={styles.metricBar}>
          <motion.div
            className={styles.metricFill}
            style={{ background: "#ef4444" }}
            initial={{ width: 0 }}
            animate={{ width: `${m.securityProgress}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <div className={styles.metricBottom}>
          <span className={styles.metricValue}>{m.securityProgress}%</span>
          <span className={styles.metricSub}>mission-1224</span>
        </div>
      </div>

      <div className={styles.metric} style={{ borderTopColor: "#ec4899" }}>
        <div className={styles.metricTop}>
          <span className={styles.metricLabel}>PRODUCT HUNT LAUNCH</span>
          <span className={styles.metricBadge} style={{ color: m.launchDaysRemaining <= 7 ? "#ec4899" : "#94a3b8" }}>
            {m.launchDaysRemaining === 0 ? "LAUNCH DAY" : `${m.launchDaysRemaining}d left`}
          </span>
        </div>
        <div className={styles.metricBar}>
          <motion.div
            className={styles.metricFill}
            style={{ background: "#ec4899" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (1 - m.launchDaysRemaining / 60) * 100)}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <div className={styles.metricBottom}>
          <span className={styles.metricValue} style={{ color: "#ec4899" }}>May 22</span>
          <span className={styles.metricSub}>Target</span>
        </div>
      </div>

      <div className={styles.metric} style={{ borderTopColor: "#10b981" }}>
        <div className={styles.metricTop}>
          <span className={styles.metricLabel}>MRR</span>
          <span className={styles.metricBadge} style={{ color: "#6b7280" }}>
            {m.revenue > 0 ? "Growing" : "Pre-launch"}
          </span>
        </div>
        <div className={styles.metricBar}>
          <motion.div
            className={styles.metricFill}
            style={{ background: "#10b981" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(2, (m.revenue / m.revenueTarget) * 100)}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <div className={styles.metricBottom}>
          <span className={styles.metricValue} style={{ color: "#10b981" }}>
            ${m.revenue.toLocaleString()}
          </span>
          <span className={styles.metricSub}>of ${m.revenueTarget}/mo</span>
        </div>
      </div>

      <div className={styles.metric} style={{ borderTopColor: "#8b5cf6" }}>
        <div className={styles.metricTop}>
          <span className={styles.metricLabel}>Q2 QUARTER</span>
          <span className={styles.metricBadge}>{m.q2DaysRemaining}d left</span>
        </div>
        <div className={styles.metricBar}>
          <motion.div
            className={styles.metricFill}
            style={{ background: "linear-gradient(90deg, #8b5cf6, #a78bfa)" }}
            initial={{ width: 0 }}
            animate={{ width: `${m.q2Progress}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <div className={styles.metricBottom}>
          <span className={styles.metricValue}>{m.q2Progress}%</span>
          <span className={styles.metricSub}>complete</span>
        </div>
      </div>

      <div className={styles.metric} style={{ borderTopColor: "#f59e0b" }}>
        <div className={styles.metricTop}>
          <span className={styles.metricLabel}>USERS</span>
          <span className={styles.metricBadge}>{m.paidUsers} paid · {m.betaUsers} beta</span>
        </div>
        <div className={styles.metricBar}>
          <div className={styles.metricFill} style={{ background: "#f59e0b", width: "0%", opacity: 0 }} />
        </div>
        <div className={styles.metricBottom}>
          <span className={styles.metricValue} style={{ color: "#f59e0b" }}>{m.paidUsers + m.betaUsers}</span>
          <span className={styles.metricSub}>total</span>
        </div>
      </div>

      <div className={styles.metric} style={{ borderTopColor: "#06b6d4" }}>
        <div className={styles.metricTop}>
          <span className={styles.metricLabel}>FINAL AUDIT</span>
          <span className={styles.metricBadge}>May 15</span>
        </div>
        <div className={styles.metricBar}>
          <motion.div
            className={styles.metricFill}
            style={{ background: "#06b6d4" }}
            initial={{ width: 0 }}
            animate={{ width: `${m.auditProgress}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
        <div className={styles.metricBottom}>
          <span className={styles.metricValue}>{m.auditProgress}%</span>
          <span className={styles.metricSub}>Quanta leads</span>
        </div>
      </div>
    </div>
  );
}
