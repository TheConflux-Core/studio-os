"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrbitalMap from "./OrbitalMap";
import EventStream from "./EventStream";
import OrgHealth from "./OrgHealth";
import AgentDetail from "./AgentDetail";
import DecisionCortex from "./DecisionCortex";
import AutonomyDial from "./AutonomyDial";
import PriorityFluid from "./PriorityFluid";
import MissionTracker from "./MissionTracker";
import DayPlanner from "./DayPlanner";
import MetricsStrip from "./MetricsStrip";
import AgentComms from "./AgentComms";
import MissionControl from "./MissionControl";
import { AGENTS, Agent } from "@/data/agentRoster";
import styles from "./page.module.css";

type Tab = "today" | "missions" | "comms" | "the-org";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "today",    label: "Today",       icon: "📅" },
  { id: "missions", label: "Missions",    icon: "🎯" },
  { id: "comms",    label: "Comms",       icon: "⚡" },
  { id: "the-org",   label: "The Org",    icon: "🪐" },
];

function useCanonicalStats() {
  const [stats, setStats] = useState<{
    opportunities: { total: number };
    missions: { total: number };
    queue: { active: number };
  } | null>(null);
  useEffect(() => {
    async function load() {
      try {
        const r = await window.fetch("/api/studio");
        if (r.ok) {
          const d = await r.json();
          setStats({ opportunities: d.opportunities, missions: d.missions, queue: d.queue });
        }
      } catch { /* silent */ }
    }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);
  return stats;
}

export default function StudioOSPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [mounted, setMounted] = useState(false);
  const dashboardStats = useCanonicalStats();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>Initializing Studio OS…</p>
      </div>
    );
  }

  const activeAgents = AGENTS.filter((a) => a.status !== "parked");

  return (
    <div className={styles.shell}>

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoEmoji}>🏢</span>
            <div>
              <h1 className={styles.logoTitle}>STUDIO OS</h1>
              <p className={styles.logoSub}>The Conflux, LLC</p>
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navBtn} ${activeTab === tab.id ? styles.navBtnActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.liveStats}>
            <StatPill label="Agents" value={activeAgents.length} color="#4ade80" />
            {dashboardStats && (
              <>
                <StatPill label="Missions" value={dashboardStats.missions.total} color="#8b5cf6" />
                <StatPill label="Queue" value={dashboardStats.queue.active} color="#f59e0b" />
              </>
            )}
            <span className={styles.liveDot}>● LIVE</span>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">

          {/* ── TODAY ── */}
          {activeTab === "today" && (
            <motion.div
              key="today"
              className={styles.todayLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Metrics strip */}
              <div className={styles.metricsStrip}>
                <MetricsStrip />
              </div>
              {/* Day planner */}
              <div className={styles.dayPlanner}>
                <DayPlanner />
              </div>
            </motion.div>
          )}

          {/* ── MISSIONS ── */}
          {activeTab === "missions" && (
            <motion.div
              key="missions"
              className={styles.missionsLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.missionsMain}>
                <div className="glass-card" style={{ padding: 20, height: "100%", overflow: "auto" }}>
                  <MissionControl />
                </div>
              </div>
              <div className={styles.missionsSide}>
                <div className="glass-card" style={{ padding: 20 }}>
                  <PriorityFluid />
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <AutonomyDial />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── COMMS ── */}
          {activeTab === "comms" && (
            <motion.div
              key="comms"
              className={styles.commsLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.commsMain}>
                <div className="glass-card" style={{ padding: 20, height: "100%", overflow: "hidden" }}>
                  <AgentComms />
                </div>
              </div>
              <div className={styles.commsSide}>
                <div className="glass-card" style={{ padding: 20 }}>
                  <OrgHealth />
                </div>
                <div className="glass-card" style={{ padding: 20 }}>
                  <DecisionCortex />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── THE ORG ── */}
          {activeTab === "the-org" && (
            <motion.div
              key="the-org"
              className={styles.orgLayout}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Orbital map */}
              <div className={styles.orgMap}>
                <OrbitalMap
                  selectedAgent={selectedAgent}
                  onSelectAgent={setSelectedAgent}
                />
              </div>
              {/* Right sidebar */}
              <div className={styles.orgSide}>
                <div className="glass-card" style={{ padding: 20 }}>
                  <OrgHealth />
                </div>
                <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px 0", borderBottom: "1px solid var(--border-subtle)", marginBottom: 12 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-muted)" }}>
                      ⚡ LIVE ACTIVITY
                    </span>
                  </div>
                  <EventStream agents={AGENTS} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── AGENT DETAIL PANEL ── */}
      <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <span>The Conflux, LLC</span>
        <span className={styles.footerSep}>·</span>
        <span>Q2 Launch 2026</span>
        <span className={styles.footerSep}>·</span>
        <span>{AGENTS.length} agents</span>
        <span className={styles.footerSep}>·</span>
        <span>5 divisions</span>
        <span className={styles.footerSep}>·</span>
        <span style={{ color: "#4ade80" }}>● LIVE</span>
      </footer>

    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={styles.statPill}>
      <span className={styles.statPillValue} style={{ color }}>{value}</span>
      <span className={styles.statPillLabel}>{label}</span>
    </div>
  );
}
