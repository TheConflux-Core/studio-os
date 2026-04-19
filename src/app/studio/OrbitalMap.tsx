"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AGENTS,
  Agent,
  DIVISION_COLORS,
  DIVISION_LABELS,
  getAgentsByDivision,
} from "@/data/agentRoster";
import styles from "./OrbitalMap.module.css";

const CENTER_X = 500;
const CENTER_Y = 420;
const MAX_RADIUS = 360;

// Scale orbit radius from agent orbitRadius (0-115) to pixels
function toPixelRadius(orbitRadius: number): number {
  return (orbitRadius / 115) * MAX_RADIUS;
}

// Calculate SVG position from orbit angle and radius
function getPosition(radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad),
  };
}

// Division layout: agents spread around their orbit with even angular spacing
function getAgentAngle(division: string, index: number, total: number): number {
  // Base angles per division (spread around the circle)
  const divisionBases: Record<string, number> = {
    strategy: 270,       // top center
    intelligence: 330,   // top right
    product: 30,         // top-ish
    growth_creative: 130, // bottom right
    security: 200,       // bottom left
    business_ops: 60,    // right side
  };
  const base = divisionBases[division] ?? 180;
  const spread = 40; // max angular spread per division
  const offset = total === 1 ? 0 : (index - (total - 1) / 2) * (spread / Math.max(total - 1, 1));
  return base + offset;
}

interface OrbitalNodeProps {
  agent: Agent;
  angle: number;
  isSelected: boolean;
  onClick: (agent: Agent) => void;
}

function OrbitalNode({ agent, angle, isSelected, onClick }: OrbitalNodeProps) {
  const radius = toPixelRadius(agent.orbitRadius);
  const pos = getPosition(radius, angle);
  const colors = DIVISION_COLORS[agent.division];
  const size = isSelected ? 52 : 40;
  const energyColor =
    agent.energy > 80 ? "#4ade80" : agent.energy > 60 ? "#facc15" : "#ef4444";

  return (
    <motion.g
      key={agent.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: angle * 0.002, duration: 0.5, type: "spring" }}
      style={{ cursor: "pointer" }}
      onClick={() => onClick(agent)}
    >
      {/* Outer pulse ring (only for active agents) */}
      {agent.status !== "parked" && (
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={size / 2 + 8}
          fill="none"
          stroke={colors.primary}
          strokeWidth={1}
          opacity={0}
          animate={{
            r: [size / 2 + 4, size / 2 + 14],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <circle
          cx={pos.x}
          cy={pos.y}
          r={size / 2 + 6}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.8}
        />
      )}

      {/* Node background */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 2}
        fill={`url(#${agent.division}_gradient)`}
        stroke={colors.primary}
        strokeWidth={isSelected ? 2.5 : 1.5}
        opacity={agent.status === "parked" ? 0.4 : 0.9}
      />

      {/* Emoji */}
      <text
        x={pos.x}
        y={pos.y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isSelected ? 22 : 18}
        style={{ pointerEvents: "none" }}
      >
        {agent.emoji}
      </text>

      {/* Name label */}
      <text
        x={pos.x}
        y={pos.y + size / 2 + 14}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-mono)"
        fill={colors.primary}
        opacity={0.9}
        style={{ pointerEvents: "none" }}
      >
        {agent.name.toUpperCase()}
      </text>

      {/* Status dot */}
      <circle
        cx={pos.x + size / 2 - 4}
        cy={pos.y - size / 2 + 4}
        r={4}
        fill={agent.status === "active" ? "#4ade80" : agent.status === "busy" ? "#facc15" : agent.status === "parked" ? "#6b7280" : "#94a3b8"}
      />

      {/* Load indicator ring (thin arc) */}
      {agent.status !== "parked" && (
        <motion.circle
          cx={pos.x}
          cy={pos.y}
          r={size / 2 + 2}
          fill="none"
          stroke={energyColor}
          strokeWidth={2}
          strokeDasharray={`${(agent.load / 100) * (2 * Math.PI * (size / 2 + 2))} ${2 * Math.PI * (size / 2 + 2)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${pos.x} ${pos.y})`}
          opacity={0.6}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ pointerEvents: "none" }}
        />
      )}
    </motion.g>
  );
}

interface OrbitalMapProps {
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
  onAgentDoubleClick?: (agent: Agent) => void;
}

export default function OrbitalMap({
  selectedAgent,
  onSelectAgent,
  onAgentDoubleClick,
}: OrbitalMapProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  // Build division groups with angular positions
  const divisionAgents: Record<string, Agent[]> = {};
  for (const agent of AGENTS) {
    if (!divisionAgents[agent.division]) {
      (divisionAgents as Record<string, Agent[]>)[agent.division] = [];
    }
    (divisionAgents as Record<string, Agent[]>)[agent.division].push(agent);
  }

  return (
    <div className={styles.container}>
      <svg
        viewBox="0 0 1000 840"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Division gradients */}
          {Object.entries(DIVISION_COLORS).map(([div, colors]) => (
            <radialGradient
              key={div}
              id={`${div}_gradient`}
              cx="40%"
              cy="35%"
              r="65%"
            >
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.25} />
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0.05} />
            </radialGradient>
          ))}

          {/* Center glow */}
          <radialGradient id="center_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.05} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </radialGradient>

          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(139,92,246,0.04)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Scanline filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <rect width="1000" height="840" fill="url(#grid)" />

        {/* Center glow */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={200} fill="url(#center_glow)" />

        {/* Orbital rings (static) */}
        {[25, 50, 75, 100].map((r) => (
          <circle
            key={r}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={(r / 115) * MAX_RADIUS}
            fill="none"
            stroke="rgba(139,92,246,0.08)"
            strokeWidth={1}
            strokeDasharray={r % 50 === 0 ? "0" : "2 6"}
          />
        ))}

        {/* Division orbit paths */}
        {Object.entries(DIVISION_COLORS).map(([div, colors]) => (
          <circle
            key={div}
            cx={CENTER_X}
            cy={CENTER_Y}
            r={(getAgentAngle(div, 0, 1) === 270 ? 0 : 0) + 1}
            fill="none"
            stroke={colors.primary}
            strokeWidth={0.5}
            opacity={0.12}
          />
        ))}

        {/* Center node — Vector */}
        {(() => {
          const v = AGENTS.find((a) => a.id === "vector")!;
          return (
            <g>
              {/* Animated pulse rings */}
              {[60, 80, 100].map((delay, i) => (
                <motion.circle
                  key={i}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={i === 0 ? 48 : i === 1 ? 60 : 72}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  opacity={0}
                  animate={{
                    r: [i === 0 ? 48 : i === 1 ? 60 : 72, i === 0 ? 80 : i === 1 ? 95 : 110],
                    opacity: [0.5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: "easeOut",
                  }}
                />
              ))}
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={42}
                fill="rgba(245,158,11,0.1)"
                stroke="#f59e0b"
                strokeWidth={2}
              />
              <text
                x={CENTER_X}
                y={CENTER_Y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={26}
                style={{ pointerEvents: "none" }}
              >
                🎯
              </text>
              <text
                x={CENTER_X}
                y={CENTER_Y + 62}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-mono)"
                fill="#f59e0b"
                letterSpacing="0.15em"
              >
                VECTOR
              </text>
              <text
                x={CENTER_X}
                y={CENTER_Y + 76}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-body)"
                fill="rgba(240,240,255,0.5)"
              >
                CEO / GATEKEEPER
              </text>
            </g>
          );
        })()}

        {/* Connection lines (collaboration edges) */}
        {AGENTS.map((agent) => {
          const radius = toPixelRadius(agent.orbitRadius);
          const total = AGENTS.filter((a) => a.division === agent.division).length;
          const index = total;
          const angle = getAgentAngle(agent.division, index, total);
          const pos = getPosition(radius, angle);
          return agent.collaborationEdges.map((targetId) => {
            const target = AGENTS.find((a) => a.id === targetId);
            if (!target || target.id <= agent.id) return null;
            const targetRadius = toPixelRadius(target.orbitRadius);
            const targetTotal = AGENTS.filter((a) => a.division === target.division).length;
            const targetIndex = targetTotal;
            const targetAngle = getAgentAngle(target.division, targetIndex, targetTotal);
            const targetPos = getPosition(targetRadius, targetAngle);
            return (
              <motion.line
                key={`${agent.id}-${targetId}`}
                x1={pos.x}
                y1={pos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke="rgba(139,92,246,0.15)"
                strokeWidth={1}
                strokeDasharray="4 8"
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            );
          });
        })}

        {/* Agent nodes */}
        {(() => {
          const divisionOrder = [
            "strategy",
            "intelligence",
            "product",
            "growth_creative",
            "security",
            "business_ops",
          ];
          return divisionOrder.flatMap((div) => {
            const agents = AGENTS.filter((a) => a.division === div);
            return agents.map((agent, i) => {
              const angle = getAgentAngle(div, i, agents.length);
              return (
                <OrbitalNode
                  key={agent.id}
                  agent={agent}
                  angle={angle}
                  isSelected={selectedAgent?.id === agent.id}
                  onClick={(a) =>
                    onSelectAgent(selectedAgent?.id === a.id ? null : a)
                  }
                />
              );
            });
          });
        })()}

        {/* Ambient floating particles */}
        {Array.from({ length: 20 }).map((_, i) => {
          const seed = i * 137.508;
          const baseX = 100 + ((seed * 7) % 800);
          const baseY = 80 + ((seed * 13) % 680);
          return (
            <motion.circle
              key={i}
              cx={baseX}
              cy={baseY}
              r={1.5}
              fill="rgba(139,92,246,0.4)"
              animate={{
                y: [baseY, baseY - 20 - (i % 15), baseY],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 4 + (i % 4),
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
