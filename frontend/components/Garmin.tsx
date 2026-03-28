"use client";

import { motion } from "motion/react";

export interface GarminData {
  body_battery_end: number | null;
  sleep_hours: number | null;
  sleep_score: number | null;
  stress_avg: number | null;
  steps: number | null;
  summary?: string | null;
}

interface Props {
  garmin: GarminData;
  // Card and Eyebrow are accepted for API compatibility but not used —
  // this component owns its own styling for the Health-app aesthetic.
  Card?: React.ComponentType<{ children: React.ReactNode; style?: React.CSSProperties }>;
  Eyebrow?: React.ComponentType<{ children: React.ReactNode }>;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const R = 54;
const CX = 60;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 339.3

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// Body Battery: >70 good, 40–70 moderate, <40 low
function batteryColor(v: number) {
  if (v > 70) return "#30d158";
  if (v >= 40) return "#ff9f0a";
  return "#ff453a";
}

// Sleep: ≥7h good, 6–7h okay, <6h poor
function sleepColor(h: number) {
  if (h >= 7) return "#30d158";
  if (h >= 6) return "#ff9f0a";
  return "#ff453a";
}

// Stress: <40 low (green), 40–65 moderate (amber), >65 high (red)
function stressColor(v: number) {
  if (v < 40) return "#30d158";
  if (v <= 65) return "#ff9f0a";
  return "#ff453a";
}

// Steps: ≥8k good, 5k–8k okay, <5k low
function stepsColor(v: number) {
  if (v >= 8000) return "#30d158";
  if (v >= 5000) return "#ff9f0a";
  return "#ff453a";
}

/* ─── Single metric ring ─────────────────────────────────── */

function Ring({
  progress,
  color,
  label,
  value,

  delay,
}: {
  progress: number;
  color: string;
  label: string;
  value: string;

  delay: number;
}) {
  const isNull = value === "—";
  const targetOffset = isNull
    ? CIRCUMFERENCE
    : CIRCUMFERENCE * (1 - clamp(progress, 0, 1));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      {/* Ring */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        >
          {/* Track */}
          <circle
            cx={CX}
            cy={CX}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={6}
          />
          {/* Glow layer — slightly wider, very faint */}
          {!isNull && (
            <motion.circle
              cx={CX}
              cy={CX}
              r={R}
              fill="none"
              stroke={color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              whileInView={{ strokeDashoffset: targetOffset }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease, delay }}
              style={{ opacity: 0.2, filter: `blur(4px)` }}
            />
          )}
          {/* Arc */}
          <motion.circle
            cx={CX}
            cy={CX}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            whileInView={{ strokeDashoffset: targetOffset }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease, delay }}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        </svg>

        {/* Center value */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 800,
              fontSize: isNull ? 28 : 26,
              lineHeight: 1,
              color: isNull ? "rgba(255,255,255,0.2)" : "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </span>
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Garmin card ────────────────────────────────────────── */

export default function Garmin({ garmin }: Props) {
  const bb = garmin.body_battery_end;
  const sh = garmin.sleep_hours;
  const sa = garmin.stress_avg;
  const st = garmin.steps;

  const rings = [
    {
      label: "Body Battery",
      progress: bb != null ? bb / 100 : 0,
      color: bb != null ? batteryColor(bb) : "#30d158",
      value: bb != null ? String(Math.round(bb)) : "—",
    },
    {
      label: "Sleep",
      progress: sh != null ? sh / 9 : 0,
      color: sh != null ? sleepColor(sh) : "#30d158",
      value: sh != null ? sh.toFixed(1) : "—",
    },
    {
      label: "Stress",
      progress: sa != null ? sa / 100 : 0,
      color: sa != null ? stressColor(sa) : "#30d158",
      value: sa != null ? String(Math.round(sa)) : "—",
    },
    {
      label: "Steps",
      progress: st != null ? st / 10000 : 0,
      color: st != null ? stepsColor(st) : "#30d158",
      value: st != null ? (st >= 1000 ? (st / 1000).toFixed(1) : String(st)) : "—",
    },
  ];

  return (
    <div>
      {/* Eyebrow */}
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "lowercase",
          color: "#ffffff",
          margin: "0 0 0.75rem",
        }}
      >
        Yesterday&apos;s Recovery
      </p>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.005, y: -3 }}
        transition={{ duration: 0.6, ease }}
        style={{
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: "1rem",
          padding: "2rem",
        }}
      >
        {/* 2×2 ring grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "2rem 1rem",
            justifyItems: "center",
          }}
        >
          {rings.map((ring, i) => (
            <Ring key={ring.label} {...ring} delay={i * 0.15} />
          ))}
        </div>

        {/* Summary */}
        {garmin.summary && (
          <>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.15)",
                margin: "1.5rem 0 0",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 16,
                fontWeight: 400,
                color: "#ffffff",
                textAlign: "center",
                textTransform: "lowercase",
                margin: "1rem 0 0",
                lineHeight: 1.5,
              }}
            >
              {garmin.summary}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
