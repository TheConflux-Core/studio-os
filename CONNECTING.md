# Connecting Studio OS to Live Canonical State

> **Purpose:** Turn the Studio OS from a beautiful dashboard with simulated data into a real-time mirror of The Conflux, LLC's actual operations.
> **Who does this:** ZigBot (this session), with Don approving the strategy.

---

## The Goal

Every piece of data on the Studio OS should reflect what's actually happening **right now** — not what was manually written into a JSON file 3 hours ago.

When Aegis finishes a security scan at 7 AM, Don opens the Studio OS and sees it happened. When Forge pushes a commit, it appears in the Event Stream. When Helix completes a market report, it shows up in Comms.

---

## What Currently Works (Real Data ✓)

| Component | Source | Status |
|-----------|--------|--------|
| Mission Tracker | `shared/missions/*.json` | ✅ Real |
| Decision Cortex | `shared/decisions/*.json` | ✅ Real |
| Org Health | Computed from shared files | ✅ Real |
| Priority Fluid | Queue + missions + opportunities | ✅ Real |
| Studio state | `studio_state.json` | ✅ Real |
| Autonomy Dial | `studio_state.json` (read/write) | ✅ Real |
| Orbital Map | `agentRoster.ts` (static) | ⚠️ Needs live updates |

---

## What Needs Connecting

### 1. Today's Schedule (DayPlanner) — Medium Priority
**Currently:** Reads from `businessCalendars.ts` — hardcoded static schedule from `calendar.md`.
**Should be:** Dynamically reads from today's actual schedule entries.

**What to do:**
- Create `GET /api/studio/schedule` that reads today's planned events from `calendar.md`
- Each event should have: time, agentId, title, description, type, status
- Status computed from: current time vs event time + last run log entry for that agent
- "Running" if agent's last activity was within the last 60 minutes

### 2. Agent Activity Feed (EventStream / AgentComms) — HIGH Priority
**Currently:** Simulated events with amber "SIMULATED" badge.
**Should be:** Real entries from `RUN_LOG.md`.

**What to do:**
- The `/api/studio/events` route already exists and parses `RUN_LOG.md`
- When agents run (via cron, sub-agent spawn, or manual), they write entries to `RUN_LOG.md`
- Each entry format needed:
  ```
  [YYYY-MM-DD HH:MM:SS] AgentName | ACTION | Details
  --- (separator) ---
  ```
- ZigBot needs to write its own heartbeat/activity to `RUN_LOG.md` on cadence
- Forge, Aegis, Pulse, etc. all need hooks to write their activity

**Immediate action:** Write a simple function every agent can call:
```
log_activity(agentId, action, details) → appends to RUN_LOG.md
```

### 3. Division Status (DayPlanner + MetricsStrip) — Medium Priority
**Currently:** `businessCalendars.ts` returns static/hardcoded division statuses.
**Should be:** Dynamically computed from recent `RUN_LOG.md` entries.

**What to do:**
- Count RUN_LOG entries per agent in last 4 hours → "active"
- Count RUN_LOG entries per agent in last 24 hours → "quiet"
- 0 entries in 24 hours → "silent"
- Last activity time = timestamp of most recent RUN_LOG entry for that agent

### 4. Revenue / Users (MetricsStrip) — Low Priority (Pre-launch)
**Currently:** Hardcoded $0 MRR, 0 users.
**Should be:** Pulls from Stripe dashboard or `shared/finance/` state.

**Note:** This only becomes real once the first user pays. Currently pre-launch.

### 5. Security CVEs (MetricsStrip) — Medium Priority
**Currently:** Hardcoded 47% for mission-1224.
**Should be:** Computed from actual mission-1224 milestone progress.

**What to do:**
- Parse `shared/missions/mission-1224.json` for phase completion rates
- Alternatively: write progress directly to `shared/missions/mission-1224.json` when Forge completes a phase

---

## The Agent Writing Protocol

The core problem: agents need to **write to the canonical state** when they do things. Currently they don't.

### Standard Log Format (RUN_LOG.md)
```
[2026-04-19 07:00:00] aegis | SECURITY_SCAN | Overnight scan complete. 0 anomalies detected. auth module: clean. | /shared/security/audits/daily-2026-04-19.md
---
[2026-04-19 07:30:00] bolt | BUILD_REPORT | CI/CD pipeline: 3 builds green, 0 failures. All platforms nominal. | /shared/builds/status-2026-04-19.json
---
[2026-04-19 08:00:00] helix | MARKET_SCAN | Overnight: 2 competitor launches detected, 1 funding round ($40M Series B), AI desktop app category +12% search volume. | /shared/intelligence/reports/2026-04-19-research-intel.md
---
[2026-04-19 09:00:00] prism | STANDUP | 2 active missions. mission-1224: 47% (2 blockers). mission-1223: 100% complete. 1 item escalated to Vector. | /shared/missions/standup-2026-04-19.md
---
[2026-04-19 09:15:00] forge | BUILD | +247 lines. Permission gates phase 1 complete. auth.rs updated. | commit: a3f9c21
---
[2026-04-19 15:00:00] catalyst | EMAIL_TO_DON | Daily report: Security layer 47%, 3 phases done, 4 remaining. CVE coordination pending Aegis/Viper sync. Tomorrow: anomaly detection phase. | Email sent: shift2bass@gmail.com
---
```

### Required Agent Hooks

Every agent should call these on their schedule:

**Aegis (7 AM daily):**
```
Write: shared/security/audits/daily-YYYY-MM-DD.md
Log: RUN_LOG.md with SECURITY_SCAN action
```

**Bolt (7:30 AM daily):**
```
Write: shared/builds/status-YYYY-MM-DD.json
Log: RUN_LOG.md with BUILD_REPORT action
```

**Helix (8 AM daily):**
```
Write: shared/intelligence/reports/YYYY-MM-DD-research-intel.md
Log: RUN_LOG.md with MARKET_SCAN action
```

**Prism (9 AM daily):**
```
Write: shared/missions/standup-YYYY-MM-DD.md
Log: RUN_LOG.md with STANDUP action
```

**Forge (after every commit):**
```
Write: git commit hash + line count to RUN_LOG.md
```

**Catalyst (3 PM daily):**
```
Write: email to Don
Log: RUN_LOG.md with EMAIL_TO_DON action
```

**ZigBot (11:30 PM daily):**
```
Write: Dream cycle output (memory consolidation)
Log: RUN_LOG.md with DREAM_CYCLE action
```

---

## Next Session Prompt

**"Connect Studio OS to live canonical state."**

Specifically:
1. Build a `log_activity()` helper that appends to `RUN_LOG.md`
2. Update the `/api/studio/events` route to properly parse the standard log format
3. Have ZigBot write its own daily heartbeat to `RUN_LOG.md` on a cron
4. Update the schedule API to dynamically compute event status from RUN_LOG timestamps
5. Make the division status compute from recent RUN_LOG entries per agent

Once complete: the Event Stream shows a LIVE badge (green) and every agent's real activity flows through automatically.

---

## Files to Modify

| File | Change |
|------|--------|
| `shared/RUN_LOG.md` | Will become the live activity feed |
| `src/app/api/studio/events/route.ts` | Better parsing of standard log format |
| `src/app/api/studio/schedule/route.ts` | New — dynamic schedule + status |
| `src/data/businessCalendars.ts` | Remove hardcoded schedule, use API |
| `src/app/studio/DayPlanner.tsx` | Fetch from API |
| `src/app/studio/MetricsStrip.tsx` | Fetch from API |

---

*Briefing prepared by ZigBot — 2026-04-19*
