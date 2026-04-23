"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import EventDetailModal, { ScheduledEventDetail } from "./EventDetailModal";
import styles from "./DayPlanner.module.css";

const DIVISION_COLORS: Record<string, string> = {
  strategy:    "#f59e0b",
  security:     "#ef4444",
  product:      "#8b5cf6",
  intelligence: "#06b6d4",
  ops:          "#10b981",
  growth:       "#ec4899",
};

const TYPE_LABELS: Record<string, string> = {
  scan: "Security Scan", report: "Report", standup: "Standup",
  sync: "Team Sync", email: "Email", pipeline: "Pipeline",
  dream: "Dream Cycle", financial: "Finance", security: "Security",
  growth: "Growth", milestone: "Milestone", discover: "Research",
  build: "Build", verify: "Verification", decision: "Decision",
};

function getCurrentTimePosition(): number {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const startHour = 6; // 6 AM start
  const totalMinutes = (hour - startHour) * 60 + minute;
  return Math.max(0, Math.min(100, (totalMinutes / (18 * 60)) * 100));
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

export default function DayPlanner() {
  const [events, setEvents] = useState<ScheduledEventDetail[]>([]);
  const [nowPos, setNowPos] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEventDetail | null>(null);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetch("/api/studio/schedule", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        if (json.events) setEvents(json.events);
      } catch {
        // Fallback: will show empty (schedule route will provide defaults on error)
      }
    }
    loadSchedule();
    setNowPos(getCurrentTimePosition());

    const tick = setInterval(() => {
      setNowPos(getCurrentTimePosition());
    }, 60000);
    return () => clearInterval(tick);
  }, []);

  // Group events by hour
  const eventsByHour: Record<number, ScheduledEventDetail[]> = {};
  for (const ev of events) {
    const h = parseInt(ev.time.split(":")[0]);
    if (!eventsByHour[h]) eventsByHour[h] = [];
    eventsByHour[h].push(ev);
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  return (
    <>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.dateLabel}>
              {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <span className={styles.nowLabel}>
              {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
            </span>
          </div>
          <div className={styles.headerStats}>
            <Stat label="Scheduled" value={events.length} />
            <Stat label="Done" value={events.filter(e => e.status === "done").length} color="#4ade80" />
            <Stat label="Upcoming" value={events.filter(e => e.status === "pending").length} color="#f59e0b" />
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.timeline}>
          {/* Hour rows */}
          {HOURS.map((h) => {
            const hourEvents = eventsByHour[h] ?? [];
            const isCurrentHour = h === hour;
            const isPast = h < hour;

            return (
              <div
                key={h}
                className={`${styles.hourRow} ${isPast ? styles.hourPast : ""} ${isCurrentHour ? styles.hourCurrent : ""}`}
              >
                {/* Time label */}
                <div className={styles.timeLabel}>
                  <span className={styles.hourText}>{formatHour(h)}</span>
                </div>

                {/* Hour line */}
                <div className={styles.hourLine} />

                {/* Events for this hour */}
                <div className={styles.eventsCell}>
                  {hourEvents.map((ev) => (
                    <ScheduleCard key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          <motion.div
            className={styles.nowLine}
            style={{ top: `${nowPos}%` }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={styles.nowDot} />
            <div className={styles.nowBar} />
            <span className={styles.nowTime}>
              {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Event detail modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}

function Stat({ label, value, color = "#94a3b8" }: { label: string; value: number; color?: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue} style={{ color }}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function ScheduleCard({ event, onClick }: { event: ScheduledEventDetail; onClick: () => void }) {
  const color = DIVISION_COLORS[event.division] ?? "#8b5cf6";
  const isDone = event.status === "done";
  const isRunning = event.status === "running";

  return (
    <motion.button
      className={`${styles.card} ${isDone ? styles.cardDone : ""} ${isRunning ? styles.cardRunning : ""}`}
      style={{ borderLeftColor: color, width: "100%", textAlign: "left" }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      title="Click to view full details"
    >
      <div className={styles.cardLeft}>
        <span className={styles.cardTime}>{event.time}</span>
        <span className={styles.cardAgent} style={{ color }}>
          {event.agentEmoji} {event.agentName}
        </span>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardTitle}>{event.title}</span>
        <span className={styles.cardDesc}>{event.description}</span>
      </div>
      <div className={styles.cardRight}>
        <span
          className={styles.statusBadge}
          style={{
            color: isDone ? "#4ade80" : isRunning ? "#facc15" : "#6b7280",
            background: isDone ? "rgba(74,222,128,0.1)" : isRunning ? "rgba(250,204,21,0.1)" : "rgba(255,255,255,0.04)",
          }}
        >
          {isDone ? "✓ Done" : isRunning ? "● Now" : "○ Pending"}
        </span>
        <span className={styles.viewDetail}>→</span>
      </div>
    </motion.button>
  );
}
