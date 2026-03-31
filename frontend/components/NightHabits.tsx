"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Types ──────────────────────────────────────────────── */

interface Props {
  stepsGoalMet: boolean;
}

interface Habit {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/* ─── Icons ──────────────────────────────────────────────── */

function MoonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function FootstepsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0z" />
      <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── Habit card ─────────────────────────────────────────── */

function HabitCard({
  habit,
  checked,
  onToggle,
}: {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      animate={checked ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      aria-pressed={checked}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "1.25rem",
        borderRadius: "1rem",
        background: checked ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.10)",
        border: checked
          ? "1.5px solid var(--color-accent)"
          : "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxSizing: "border-box",
        width: "100%",
        transition: "background 0.25s ease, border-color 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Checkmark badge */}
      <AnimatePresence>
        {checked && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a0d2e",
              flexShrink: 0,
            }}
          >
            <CheckIcon />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon */}
      <span
        style={{
          color: checked ? "var(--color-accent)" : "rgba(255,255,255,0.45)",
          transition: "color 0.25s ease",
          lineHeight: 1,
        }}
      >
        {habit.icon}
      </span>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.01em",
          textTransform: "lowercase",
          color: checked ? "#1a0d2e" : "rgba(255,255,255,0.55)",
          transition: "color 0.25s ease",
          lineHeight: 1.2,
        }}
      >
        {habit.label}
      </span>
    </motion.button>
  );
}

/* ─── Component ──────────────────────────────────────────── */

export default function NightHabits({ stepsGoalMet }: Props) {
  const [salah, setSalah] = useState(false);
  const [workout, setWorkout] = useState(false);
  const [deepWork, setDeepWork] = useState(false);
  const [steps, setSteps] = useState(stepsGoalMet);

  const habits: (Habit & { checked: boolean; onToggle: () => void })[] = [
    {
      id: "salah",
      label: "salah",
      icon: <MoonIcon />,
      checked: salah,
      onToggle: () => setSalah((v) => !v),
    },
    {
      id: "workout",
      label: "workout",
      icon: <BoltIcon />,
      checked: workout,
      onToggle: () => setWorkout((v) => !v),
    },
    {
      id: "deepwork",
      label: "deep work",
      icon: <TargetIcon />,
      checked: deepWork,
      onToggle: () => setDeepWork((v) => !v),
    },
    {
      id: "steps",
      label: "steps",
      icon: <FootstepsIcon />,
      checked: steps,
      onToggle: () => setSteps((v) => !v),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.75rem",
      }}
    >
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          checked={habit.checked}
          onToggle={habit.onToggle}
        />
      ))}
    </div>
  );
}
