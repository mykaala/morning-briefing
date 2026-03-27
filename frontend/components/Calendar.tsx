"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Types ──────────────────────────────────────────────── */

interface CalendarEvent {
  title: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  prep_nudge?: string;
  location?: string;
}

interface CalendarData {
  day_summary?: string;
  events: CalendarEvent[];
  has_events: boolean;
}

interface PrayerTime {
  name: string;
  time: string;
  context?: string;
}

interface Props {
  calendar: CalendarData;
  prayers?: PrayerTime[];
  Card: React.ComponentType<{
    children: React.ReactNode;
    style?: React.CSSProperties;
  }>;
  Eyebrow: React.ComponentType<{ children: React.ReactNode }>;
  Ghost: React.ComponentType<{ n: string }>;
}

/* ─── Helpers ────────────────────────────────────────────── */

function fmtTime(s?: string): string {
  if (!s) return "";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return s;
  }
}

function toMin(s?: string): number {
  if (!s) return 0;
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return 0;
    return d.getHours() * 60 + d.getMinutes();
  } catch {
    return 0;
  }
}

function prayerToMin(timeStr: string): number {
  const cleaned = timeStr.trim();
  const ampm = cleaned.match(/am|pm/i);
  const parts = cleaned.replace(/am|pm/gi, "").trim().split(":");
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || "0", 10);
  if (ampm) {
    const p = ampm[0].toUpperCase();
    if (p === "PM" && h !== 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
  }
  return h * 60 + m;
}

function fmtPrayerTime(timeStr: string): string {
  const min = prayerToMin(timeStr);
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type ScheduleItem =
  | { kind: "event"; data: CalendarEvent; sortMin: number }
  | { kind: "prayer"; data: PrayerTime; sortMin: number };

/* ─── Component ──────────────────────────────────────────── */

export default function Calendar({
  calendar,
  prayers,
  Card,
  Eyebrow,
  Ghost,
}: Props) {
  const now = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  const timedEvents = calendar.events.filter(
    (e) => !e.is_all_day && e.start_time
  );
  const allDayEvents = calendar.events.filter((e) => e.is_all_day);

  /* Build unified sorted schedule */
  const schedule: ScheduleItem[] = [];
  for (const e of timedEvents) {
    schedule.push({ kind: "event", data: e, sortMin: toMin(e.start_time) });
  }
  if (Array.isArray(prayers)) {
    for (const p of prayers) {
      schedule.push({ kind: "prayer", data: p, sortMin: prayerToMin(p.time) });
    }
  }
  schedule.sort((a, b) => a.sortMin - b.sortMin);

  /* Find the next upcoming event (not prayer) */
  const nextEventIdx = schedule.findIndex(
    (item) => item.kind === "event" && item.sortMin >= now
  );

  /* Find where "now" sits in the schedule for the now-indicator */
  let nowInsertIdx = -1;
  if (schedule.length > 0) {
    for (let i = 0; i < schedule.length; i++) {
      if (schedule[i].sortMin > now) {
        if (i > 0) nowInsertIdx = i;
        break;
      }
    }
  }

  const isEmpty =
    !calendar.has_events && schedule.length === 0 && allDayEvents.length === 0;

  return (
    <Card>
      <Ghost n="02" />

      {/* ── Header ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Eyebrow>today</Eyebrow>
        {calendar.day_summary && (
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: 16,
              color: "#ffffff",
              marginTop: "0.5rem",
              lineHeight: 1.6,
              textTransform: "lowercase",
            }}
          >
            {calendar.day_summary}
          </p>
        )}
      </div>

      {/* ── Empty state ── */}
      {isEmpty ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 0",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "#ffffff",
              opacity: 0.06,
              filter: "blur(40px)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 600,
              fontSize: 20,
              color: "#ffffff",
              position: "relative",
              textTransform: "lowercase",
            }}
          >
            clear day ahead.
          </span>
        </div>
      ) : (
        <>
          {/* ── All-day events ── */}
          {allDayEvents.length > 0 && (
            <div style={{ marginBottom: "1.25rem" }}>
              {allDayEvents.map((e, i) => (
                <motion.div
                  key={`allday-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease, delay: i * 0.1 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 1rem",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: i < allDayEvents.length - 1 ? "0.5rem" : 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "#ffffff",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    ALL DAY
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 500,
                      fontSize: 15,
                      color: "#ffffff",
                      textTransform: "lowercase",
                    }}
                  >
                    {e.title}
                  </span>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Timeline ── */}
          <div style={{ position: "relative", paddingLeft: 48 }}>
            {/* The thread — vertical line */}
            <div
              style={{
                position: "absolute",
                left: 19,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(255,255,255,0.08)",
              }}
            />

            {/* Glowing portion (from now onward) */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                left: 17,
                top: 0,
                bottom: 0,
                width: 1,
                background:
                  "linear-gradient(to bottom, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)",
                boxShadow: "0 0 6px #ffffff",
                opacity: 0.7,
              }}
            />

            {/* Schedule items */}
            {schedule.map((item, i) => {
              const isPast = item.sortMin < now;
              const isNext =
                item.kind === "event" && i === nextEventIdx;

              return (
                <div key={i}>
                  {/* Now indicator — inserted before the first future item */}
                  {i === nowInsertIdx && (
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        margin: "0.75rem 0",
                        marginLeft: -48,
                        paddingLeft: 48,
                      }}
                    >
                      {/* Pulsing now dot */}
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          left: 17,
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#ffffff",
                          transform: "translateX(-2px)",
                        }}
                      />
                      {/* Dashed line */}
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          borderTop: "1px dashed #ffffff",
                          opacity: 0.4,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#ffffff",
                          marginLeft: 8,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        NOW
                      </span>
                    </div>
                  )}

                  {/* The schedule row */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      ease,
                    }}
                    style={{
                      position: "relative",
                      marginBottom:
                        i < schedule.length - 1 ? "1rem" : 0,
                    }}
                  >
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: -48 + 15,
                        top: item.kind === "event" ? 20 : 10,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: isPast
                          ? "rgba(255,255,255,0.15)"
                          : isNext
                          ? "#ffffff"
                          : "rgba(255,255,255,0.06)",
                        border:
                          isPast || isNext
                            ? "none"
                            : "1px solid #ffffff",
                        boxShadow: isNext
                          ? "0 0 8px #ffffff"
                          : "none",
                        transform: "translateX(-3.5px)",
                        zIndex: 2,
                      }}
                    />

                    {/* Time label — left of dot */}
                    <span
                      style={{
                        position: "absolute",
                        left: -48,
                        top: item.kind === "event" ? 18 : 8,
                        fontFamily: "var(--font-inter)",
                        fontSize: 11,
                        fontWeight: 400,
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        transform: "translateX(-100%)",
                        paddingRight: 10,
                        display: "none",
                      }}
                    >
                      {item.kind === "event"
                        ? fmtTime(item.data.start_time)
                        : fmtPrayerTime(item.data.time)}
                    </span>

                    {item.kind === "event" ? (
                      /* ── Event card ── */
                      <motion.div
                        whileHover={{
                          scale: 1.01,
                          y: -2,
                        }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: "relative",
                          background: isNext
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(255,255,255,0.04)",
                          border: isNext
                            ? "1px solid rgba(255,255,255,0.2)"
                            : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 16,
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter: "blur(20px)",
                          padding: "1.25rem 1.5rem",
                          overflow: "hidden",
                          cursor: "default",
                        }}
                      >
                        {/* Left accent bar */}
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: "#ffffff",
                            opacity: isPast ? 0.15 : isNext ? 0.9 : 0.4,
                            borderRadius: "2px 0 0 2px",
                          }}
                        />

                        {/* Pulsing dot for "up next" */}
                        {isNext && (
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#ffffff",
                            }}
                          />
                        )}

                        {/* UP NEXT label */}
                        {isNext && (
                          <span
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              color: "#ffffff",
                              textTransform: "uppercase",
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            UP NEXT
                          </span>
                        )}

                        {/* Top row: title + time */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: "1rem",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#ffffff",
                              textTransform: "lowercase",
                              lineHeight: 1.3,
                            }}
                          >
                            {item.data.title}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontSize: 13,
                              fontWeight: 400,
                              color: "#ffffff",
                              flexShrink: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {fmtTime(item.data.start_time)}
                            {item.data.end_time &&
                              ` \u2013 ${fmtTime(item.data.end_time)}`}
                          </span>
                        </div>

                        {/* Prep nudge */}
                        {item.data.prep_nudge && (
                          <p
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontSize: 13,
                              fontWeight: 400,
                              fontStyle: "italic",
                              color: "#ffffff",
                              marginTop: 8,
                              lineHeight: 1.5,
                              textTransform: "lowercase",
                            }}
                          >
                            → {item.data.prep_nudge}
                          </p>
                        )}
                      </motion.div>
                    ) : (
                      /* ── Prayer row ── */
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "0.75rem",
                          padding: "0.5rem 0",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontWeight: 600,
                            fontSize: 15,
                            color: "#ffffff",
                            textTransform: "lowercase",
                            opacity: isPast ? 0.4 : 0.9,
                          }}
                        >
                          {item.data.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: 12,
                            fontWeight: 400,
                            color: "#ffffff",
                          }}
                        >
                          {fmtPrayerTime(item.data.time)}
                        </span>
                        {item.data.context && (
                          <span
                            style={{
                              fontFamily: "var(--font-inter)",
                              fontSize: 12,
                              fontStyle: "italic",
                              fontWeight: 400,
                              color: "#ffffff",
                              textTransform: "lowercase",
                            }}
                          >
                            {item.data.context}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
