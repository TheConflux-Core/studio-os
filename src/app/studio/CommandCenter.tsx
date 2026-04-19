"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getCommandCenterData,
  getCompanyMetrics,
  getDivisionPulses,
  getTodaySchedule,
  timeAgo,
  DivisionPulse,
  ScheduledEvent,
} from "@/data/businessCalendars";
import styles from "./CommandCenter.module.css";

export default function CommandCenter() {
  const [metrics, setMetrics] = useState(getCompanyMetrics);
  const [divisions, setDivisions] = useState<DivisionPulse[]>([]);
  const [schedule, setSchedule] = useState<ScheduledEvent[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const data = getCommandCenterData();
    setDivisions(data.divisions);
    setSchedule(data.schedule);

    const tick = setInterval(() => {
      setNow(new Date());
      setDivisions(getDivisionPulses());
    }, 60000);
    return () => clearInterval(tick);
  }, []);

  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 60 + minute;

  const completedEvents = schedule.filter((e) => {
    const [eh, em] = e.time.split(":").map(Number);
    const eventMin = eh * 60 + em;
    return currentTime >= eventMin || e.status === "done";
  });
  const upcomingEvents = schedule.filter((e) => {
    const [eh, em] = e.time.split(":").map(Number);
    const eventMin = eh * 60 + em;
    return currentTime < eventMin && e.status !== "done";
  });

  return (
    <div className={styles.container}>
      {/* Top row: Countdown + Revenue */}
      <div className={styles.topRow}>
        {/* Q2 Countdown */}
        <div className={styles.countdownCard}>
          <div className={styles.countdownLabel}>Q2 2026 — LAUNCH QUARTER</div>
          <div className={styles.countdownNumbers}>
            <div className={styles.countdownItem}>
              <span className={styles.countdownValue}>{metrics.q2DaysRemaining}</span>
              <span className={styles.countdownUnit}>days left</span>
            </div>
            <div className={styles.countdownDivider}>·</div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownValue} style={{ color: "#4ade80" }}>
                {metrics.q2Progress}%
              </span>
              <span className={styles.countdownUnit}>complete</span>
            </div>
          </div>
          <div className={styles.countdownBar}>
            <motion.div
              className={styles.countdownFill}
              initial={{ width: 0 }}
              animate={{ width: `${metrics.q2Progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Launch countdown */}
        <div className={styles.launchCard}>
          <div className={styles.launchLabel}>PRODUCT HUNT LAUNCH</div>
          <div className={styles.launchDate}>May 22, 2026</div>
          <div className={styles.launchCountdown}>
            <span className={styles.launchNumber}>{metrics.launchDaysRemaining}</span>
            <span className={styles.launchUnit}> days to launch</span>
          </div>
          <div className={styles.launchTarget}>$500 MRR target</div>
        </div>

        {/* Revenue */}
        <div className={styles.revenueCard}>
          <div className={styles.revenueLabel}>REVENUE</div>
          <div className={styles.revenueValue}>
            <span className={styles.revenueDollar}>$</span>
            <span className={styles.revenueAmount}>{metrics.revenue.toLocaleString()}</span>
          </div>
          <div className={styles.revenueProgress}>
            <div className={styles.revenueBar}>
              <div
                className={styles.revenueFill}
                style={{ width: `${Math.min(100, (metrics.revenue / metrics.revenueTarget) * 100)}%` }}
              />
            </div>
            <span className={styles.revenueTarget}>of ${metrics.revenueTarget}/mo</span>
          </div>
          <div className={styles.revenueUsers}>
            <span className={styles.usersPaid}>{metrics.paidUsers} paid</span>
            <span className={styles.usersBeta}>{metrics.betaUsers} beta</span>
          </div>
        </div>
      </div>

      {/* Second row: Security + Audit + Division Pulses */}
      <div className={styles.secondRow}>
        {/* Security mission */}
        <div className={styles.missionCard}>
          <div className={styles.missionHeader}>
            <span className={styles.missionBadge} style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
              🔒 SECURITY LAYER
            </span>
            <span className={styles.missionDue}>Due {metrics.securityDaysRemaining === 0 ? "TODAY" : `${metrics.securityDaysRemaining}d`}</span>
          </div>
          <div className={styles.missionTitle}>mission-1224: Permission Gates + Monitoring</div>
          <div className={styles.missionProgress}>
            <div className={styles.missionProgressBar}>
              <motion.div
                className={styles.missionProgressFill}
                style={{ background: "#ef4444" }}
                initial={{ width: 0 }}
                animate={{ width: `${metrics.securityProgress}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>
            <span className={styles.missionPercent}>{metrics.securityProgress}%</span>
          </div>
          <div className={styles.missionOwners}>
            <span className={styles.owner}>🛡️ Aegis</span>
            <span className={styles.owner}>🐍 Viper</span>
            <span className={styles.owner}>🔨 Forge</span>
          </div>
          <div className={styles.missionPhases}>
            <PhasePill label="Auth" done />
            <PhasePill label="RBAC" done />
            <PhasePill label="Monitoring" active />
            <PhasePill label="Anomaly" pending />
            <PhasePill label="SIEM" pending />
            <PhasePill label="QA" pending />
          </div>
        </div>

        {/* Audit progress */}
        <div className={styles.auditCard}>
          <div className={styles.missionHeader}>
            <span className={styles.missionBadge} style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
              ✓ FINAL AUDIT
            </span>
            <span className={styles.missionDue}>May 15, 2026</span>
          </div>
          <div className={styles.missionTitle}>Conflux Home v0.1 — Launch Readiness</div>
          <div className={styles.missionProgress}>
            <div className={styles.missionProgressBar}>
              <motion.div
                className={styles.missionProgressFill}
                style={{ background: "#8b5cf6" }}
                initial={{ width: 0 }}
                animate={{ width: `${metrics.auditProgress}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>
            <span className={styles.missionPercent}>{metrics.auditProgress}%</span>
          </div>
          <div className={styles.missionOwners}>
            <span className={styles.owner}>✓ Quanta</span>
            <span className={styles.owner}>🔨 Forge</span>
          </div>
          <div className={styles.auditPhases}>
            <PhasePill label="Phase 1" done />
            <PhasePill label="Phase 2" pending />
            <PhasePill label="Phase 3" pending />
            <PhasePill label="Code Sign" pending />
            <PhasePill label="Launch" pending />
          </div>
        </div>

        {/* Division Pulses */}
        <div className={styles.divisionsCard}>
          <div className={styles.divisionsTitle}>DIVISIONS</div>
          <div className={styles.divisionsList}>
            {divisions.map((div) => (
              <div key={div.division} className={styles.divisionRow}>
                <span
                  className={styles.divisionDot}
                  style={{
                    background: div.color,
                    boxShadow: div.status === "active" ? `0 0 6px ${div.color}60` : "none",
                    opacity: div.status === "active" ? 1 : 0.4,
                  }}
                />
                <span className={styles.divisionEmoji}>
                  {div.emoji}
                </span>
                <span className={styles.divisionName}>{div.label}</span>
                <span className={styles.divisionTask} title={div.currentTask}>
                  {div.currentTask.length > 30 ? div.currentTask.slice(0, 28) + "…" : div.currentTask}
                </span>
                <span className={styles.divisionTime}>{div.lastActivity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third row: Today's Schedule */}
      <div className={styles.scheduleCard}>
        <div className={styles.scheduleHeader}>
          <span className={styles.scheduleTitle}>TODAY'S SCHEDULE</span>
          <span className={styles.scheduleTime}>
            {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")} MDT
          </span>
        </div>

        <div className={styles.scheduleTimeline}>
          {schedule.map((event, i) => {
            const [eh, em] = event.time.split(":").map(Number);
            const eventMin = eh * 60 + em;
            const isPast = currentTime >= eventMin;
            const isCurrent = isPast && i === schedule.findIndex((e) => {
              const [th, tm] = e.time.split(":").map(Number);
              return currentTime >= th * 60 + tm && e.status !== "done";
            }) || (isPast && event.status === "done");

            return (
              <motion.div
                key={event.id}
                className={`${styles.scheduleEvent} ${isPast ? styles.eventPast : ""} ${isCurrent ? styles.eventCurrent : ""}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className={styles.eventTime}>{event.time}</span>
                <span
                  className={styles.eventAgent}
                  style={{ color: event.agentColor }}
                >
                  {event.agentEmoji} {event.agentName}
                </span>
                <span className={styles.eventTitle}>{event.title}</span>
                <span
                  className={styles.eventStatus}
                  style={{
                    color:
                      event.status === "done" ? "#4ade80" :
                      isCurrent ? "#facc15" :
                      "#6b7280",
                  }}
                >
                  {event.status === "done" ? "✓ Done" :
                   isCurrent ? "● Running" :
                   "○ Pending"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PhasePill({ label, done, active, pending }: { label: string; done?: boolean; active?: boolean; pending?: boolean }) {
  const isPending = !done && !active && !pending;
  return (
    <span
      className={styles.phasePill}
      style={{
        background: done ? "rgba(74,222,128,0.15)" : active ? "rgba(250,204,21,0.15)" : "rgba(255,255,255,0.05)",
        color: done ? "#4ade80" : active ? "#facc15" : "#6b7280",
        borderColor: done ? "rgba(74,222,128,0.3)" : active ? "rgba(250,204,21,0.3)" : "rgba(255,255,255,0.08)",
      }}
    >
      {done ? "✓" : active ? "●" : "○"} {label}
    </span>
  );
}
