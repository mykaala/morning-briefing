"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface PrayerTime {
  name: string;
  time: string;
  context?: string;
}

type PrayerTimesRaw = PrayerTime[] | Record<string, string>;

interface Props {
  prayers: PrayerTimesRaw;
  Card: React.ComponentType<{ children: React.ReactNode; style?: React.CSSProperties }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
}

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function normalize(raw: PrayerTimesRaw): PrayerTime[] {
  if (Array.isArray(raw)) return raw;
  return PRAYER_ORDER
    .filter((k) => k in raw && k !== "fajr")
    .map((k) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), time: raw[k] }));
}

function parseTime(str: string): Date {
  const now = new Date();
  const cleaned = str.trim();
  const ampm = cleaned.match(/am|pm/i);
  const parts = cleaned.replace(/am|pm/gi, "").trim().split(":");
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || "0", 10);
  if (ampm) {
    const p = ampm[0].toUpperCase();
    if (p === "PM" && h !== 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
  }
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
}

function findNext(prayers: PrayerTime[]): string | null {
  const now = new Date();
  for (const p of prayers) {
    try {
      if (parseTime(p.time) > now) return p.name;
    } catch {
      /* skip */
    }
  }
  return null;
}

export default function PrayerTimes({ prayers: rawPrayers, Card, Eyebrow }: Props) {
  const prayers = normalize(rawPrayers);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);

  useEffect(() => {
    setNextPrayer(findNext(prayers));
    const id = setInterval(() => setNextPrayer(findNext(prayers)), 60_000);
    return () => clearInterval(id);
  }, [rawPrayers]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card style={{ height: "100%" }}>
      <Eyebrow>prayer times</Eyebrow>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
        {prayers.map((p, i) => {
          const isNext = p.name === nextPrayer;
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease, delay: i * 0.08 }}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.75rem",
                padding: "0.6rem 0",
                borderLeft: isNext
                  ? "2px solid #ffffff"
                  : "2px solid rgba(255,255,255,0.2)",
                paddingLeft: "0.75rem",
              }}
            >
              {/* Name */}
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "lowercase",
                  letterSpacing: "0.04em",
                  color: isNext ? "#ffffff" : "rgba(255,255,255,0.5)",
                  width: 64,
                  flexShrink: 0,
                }}
              >
                {p.name}
              </span>

              {/* Time */}
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 700,
                  fontSize: "clamp(1rem, 2vw, 1.2rem)",
                  color: isNext ? "#ffffff" : "rgba(255,255,255,0.8)",
                  textTransform: "lowercase",
                }}
              >
                {p.time}
              </span>

              {/* Context */}
              {p.context && (
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 11,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.35)",
                    marginLeft: "auto",
                    textTransform: "lowercase",
                  }}
                >
                  {p.context}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
