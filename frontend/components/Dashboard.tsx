"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import QuranVerse from "@/components/QuranVerse";
import Garmin, { type GarminData } from "@/components/Garmin";
import Weather from "@/components/Weather";
import Calendar from "@/components/Calendar";
import News from "@/components/News";
import Tasks from "@/components/Tasks";
import Focus from "@/components/Focus";
import { protectAllah } from "@/lib/protectAllah";

/* ─── Types ──────────────────────────────────────────────── */

export interface PrayerTime {
  name: string;
  time: string;
  context?: string;
}

export interface CalendarEvent {
  title: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  prep_nudge?: string;
  location?: string;
}

export interface Briefing {
  date: string;
  greeting: string;
  prayer_times: PrayerTime[];
  quran: {
    arabic: string;
    translation: string;
    surah_name: string;
    ayah_number: number;
    surah_number: number;
  };
  weather: {
    summary: string;
    daily?: {
      temp_max_c: number;
      temp_min_c: number;
      feels_like_max_c: number;
      feels_like_min_c: number;
      precipitation_hours: number;
      wind_speed_max_kmh: number;
      wind_gusts_max_kmh: number;
    };
    hourly?: {
      time: string;
      temp_c: number;
      feels_like_c: number;
      precip_probability: number;
      precipitation_mm: number;
      rain_mm: number;
      snowfall_cm: number;
      cloud_cover_pct: number;
    }[];
  };
  calendar: {
    day_summary?: string;
    events: CalendarEvent[];
    has_events: boolean;
  };
  news: {
    title: string;
    source: string;
    url: string;
    summary: string;
  }[];
  tasks: {
    all_tasks: { title: string; priority: number; due_time?: string; project_name: string }[];
    focus_task: { title: string; priority: number; due_time?: string; project_name: string } | null;
    focus_reason: string;
  };
  focus: string;
  garmin?: GarminData | null;
}

/* ─── Daily accent colour ────────────────────────────────── */

const ACCENT_PALETTE = ["#ffffff", "#ffffff", "#ffffff"];

function getAccent(): string {
  const est = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const start = new Date(est.getFullYear(), 0, 0);
  const diff = est.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return ACCENT_PALETTE[dayOfYear % 3];
}

/* ─── Daily gradient variants ────────────────────────────── */

const GRADIENT_VARIANTS = [
  // 0 · warm — peach + violet + pink
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(251,146,60,.9) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(167,139,250,.9) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(244,114,182,.85) 0%, transparent 52%),
   #f0aac0`,

  // 1 · ocean — sky blue + indigo + cyan
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(14,165,233,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(67,56,202,.95) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(6,182,212,.9) 0%, transparent 52%),
   #4e8ac4`,

  // 2 · mint — emerald + teal + lime
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(16,185,129,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(13,148,136,.95) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(101,163,13,.85) 0%, transparent 52%),
   #4da898`,

  // 3 · golden — amber + orange + rose
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(217,119,6,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(234,88,12,.95) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(220,38,38,.8) 0%, transparent 52%),
   #c8863a`,

  // 4 · dusk — rose + fuchsia + purple
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(244,63,94,.8) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(192,38,211,.85) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(168,85,247,.8) 0%, transparent 52%),
   #c87aba`,

  // 5 · lavender — sky + periwinkle + lilac
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(125,211,252,.9) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(165,180,252,.9) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(196,181,253,.85) 0%, transparent 52%),
   #aabff0`,

  // 6 · sage — sage green + chartreuse + gold
  `radial-gradient(ellipse 100% 80% at -5% 70%, rgba(74,222,128,.95) 0%, transparent 52%),
   radial-gradient(ellipse 80% 90% at 105% 0%, rgba(202,138,4,.9) 0%, transparent 55%),
   radial-gradient(ellipse 80% 80% at 60% 110%, rgba(22,163,74,.9) 0%, transparent 52%),
   #6aad7a`,
];

function getDailyGradientIndex(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayNum = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000
  );
  return dayNum % GRADIENT_VARIANTS.length;
}


/* ─── Scroll progress bar ────────────────────────────────── */

function ScrollProgressBar({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50 });

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "0%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "rgba(255,255,255,0.7)",
        zIndex: 100,
      }}
    />
  );
}

/* ─── Parallax section ───────────────────────────────────── */

function ParallaxSection({
  children,
  containerRef,
  ghost,
  onLeaveView,
}: {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  ghost?: string;
  onLeaveView?: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    if (!onLeaveView || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) onLeaveView(); },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [onLeaveView]);
  const y = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const ghostY = useTransform(scrollYProgress, [0, 1], [70, -70]);

  return (
    <div
      ref={sectionRef}
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {ghost && (
        <motion.span
          aria-hidden
          style={{
            y: ghostY,
            position: "absolute",
            right: "2rem",
            bottom: "-1rem",
            fontFamily: "var(--font-inter)",
            fontWeight: 800,
            fontSize: "clamp(8rem, 20vw, 16rem)",
            lineHeight: 1,
            color: "rgba(255,255,255,0.025)",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {ghost}
        </motion.span>
      )}
      <motion.div
        style={{
          y,
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 960,
          padding: "0 1.5rem",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ─── Glass card ─────────────────────────────────────────── */

function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "2rem",
        borderRadius: "1rem",
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Eyebrow label ──────────────────────────────────────── */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-inter)",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "lowercase",
        color: "#ffffff",
      }}
    >
      {children}
    </span>
  );
}

/* ─── No-op Ghost (ghost handled at section level) ───────── */

const NoGhost = () => null;

/* ─── Refresh button ─────────────────────────────────────── */

function RefreshButton() {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function handleRefresh() {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/refresh");
      if (res.ok) {
        window.location.reload();
      } else {
        setState("error");
        setTimeout(() => setState("idle"), 2000);
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const label = state === "error" ? "failed" : "refresh";

  return (
    <button
      onClick={handleRefresh}
      aria-label="refresh briefing"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "8rem",
        zIndex: 200,
        height: 36,
        borderRadius: "1rem",
        border: "1px solid rgba(255,255,255,0.35)",
        background: state === "loading" ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        cursor: state === "loading" ? "default" : "pointer",
        color: state === "error" ? "rgba(255,120,120,0.9)" : "#ffffff",
        fontFamily: "var(--font-inter)",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.03em",
        textTransform: "lowercase",
        display: "flex",
        alignItems: "center",
        padding: "0 0.75rem",
        transition: "background 0.3s, opacity 0.2s, color 0.2s",
        overflow: "hidden",
      }}
    >
      {state === "loading" ? (
        <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#ffffff",
                display: "inline-block",
                animation: `claudeDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </span>
      ) : (
        label
      )}
      <style>{`
        @keyframes claudeDot {
          0%, 60%, 100% { opacity: 0.25; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </button>
  );
}

/* ─── Lock icon SVG ──────────────────────────────────────── */

function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Lock widget (icon + modal) ─────────────────────────── */

function LockWidget({ isDemo }: { isDemo: boolean }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        setErrorMsg("incorrect key");
        setShakeKey((k) => k + 1);
        setPassword("");
      }
    } catch {
      setErrorMsg("something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <>
      {/* Fixed lock icon — bottom right, left of the › wallpaper button */}
      <button
        onClick={() => setOpen(true)}
        aria-label={isDemo ? "unlock" : "auth settings"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "5rem",
          zIndex: 200,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.35)",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          cursor: "pointer",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <LockIcon />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "1rem",
              padding: "2rem",
              width: "100%",
              maxWidth: 380,
              margin: "0 1rem",
            }}
          >
            {isDemo ? (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "#ffffff",
                    margin: "0 0 0.4rem",
                    textTransform: "lowercase",
                  }}
                >
                  your morning.
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    margin: "0 0 1.5rem",
                    lineHeight: 1.6,
                    textTransform: "lowercase",
                  }}
                >
                  this is a preview. enter your key to see the real thing.
                </p>
                <form onSubmit={handleSubmit}>
                  <motion.div
                    key={shakeKey}
                    animate={shakeKey > 0 ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="access key"
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.85rem",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        fontFamily: "var(--font-inter)",
                        fontSize: 15,
                        outline: "none",
                        marginBottom: errorMsg ? 6 : 12,
                        boxSizing: "border-box",
                      }}
                    />
                  </motion.div>
                  {errorMsg && (
                    <p
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 13,
                        color: "#f87171",
                        margin: "0 0 10px",
                        textTransform: "lowercase",
                      }}
                    >
                      {errorMsg}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !password}
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.2)",
                      color: "#ffffff",
                      fontFamily: "var(--font-inter)",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: submitting || !password ? "not-allowed" : "pointer",
                      opacity: submitting || !password ? 0.5 : 1,
                      textTransform: "lowercase",
                    }}
                  >
                    {submitting ? "checking..." : "unlock"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#ffffff",
                    margin: "0 0 1.25rem",
                    textTransform: "lowercase",
                  }}
                >
                  logged in
                </p>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    fontFamily: "var(--font-inter)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    textTransform: "lowercase",
                  }}
                >
                  lock this device
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Dashboard ──────────────────────────────────────────── */

interface Props {
  briefing: Briefing | null;
  isDemo: boolean;
  error: string | null;
  onBack?: () => void;
  heroSection?: React.ReactNode;
  onHeroHide?: () => void;
}

export default function Dashboard({ briefing, isDemo, error, onBack, heroSection, onHeroHide }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gradientIndex, setGradientIndex] = useState(
    () => (isDemo ? 0 : getDailyGradientIndex())
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", getAccent());
    document.body.style.background = GRADIENT_VARIANTS[gradientIndex];
    document.body.style.backgroundAttachment = "fixed";
  }, [gradientIndex]);

  /* ── Error ── */
  if (error || !briefing) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <Card style={{ maxWidth: 420, textAlign: "center" }}>
          <p
            style={{
              color: "#ffffff",
              fontWeight: 600,
              marginBottom: 8,
              fontFamily: "var(--font-inter)",
              textTransform: "lowercase",
            }}
          >
            failed to load briefing
          </p>
          <p
            style={{
              color: "#ffffff",
              fontSize: 13,
              marginBottom: 20,
              fontFamily: "var(--font-inter)",
              textTransform: "lowercase",
            }}
          >
            {error || "unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "var(--font-inter)",
              textTransform: "lowercase",
            }}
          >
            retry
          </button>
        </Card>
      </div>
    );
  }

  const prevGradient = () =>
    setGradientIndex(
      (i) => (i - 1 + GRADIENT_VARIANTS.length) % GRADIENT_VARIANTS.length
    );
  const nextGradient = () =>
    setGradientIndex((i) => (i + 1) % GRADIENT_VARIANTS.length);

  const wallpaperBtnStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "1.5rem",
    zIndex: 200,
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#ffffff",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  /* ── Render ── */
  return (
    <>
      <ScrollProgressBar
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
      />

      {/* ── Back to landing (demo only) ── */}
      {isDemo && onBack && (
        <button
          onClick={onBack}
          style={{
            position: "fixed",
            top: "1.25rem",
            left: "1.25rem",
            zIndex: 200,
            padding: "0.4rem 0.85rem",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#ffffff",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            textTransform: "lowercase",
          }}
        >
          ← back
        </button>
      )}

      {/* ── Wallpaper controls ── */}
      <button
        style={{ ...wallpaperBtnStyle, left: "1.5rem" }}
        onClick={prevGradient}
        aria-label="previous wallpaper"
      >
        ‹
      </button>
      <button
        style={{ ...wallpaperBtnStyle, right: "1.5rem" }}
        onClick={nextGradient}
        aria-label="next wallpaper"
      >
        ›
      </button>

      {/* ── Refresh button (real mode only) ── */}
      {!isDemo && <RefreshButton />}

      {/* ── Lock widget ── */}
      <LockWidget isDemo={isDemo} />

      {/* ── Scrollable snap container ── */}
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          background: "transparent",
        }}
      >
        {/* ─── 0. HERO (optional, e.g. landing page) ── */}
        {heroSection && (
          <ParallaxSection
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            onLeaveView={onHeroHide}
          >
            {heroSection}
          </ParallaxSection>
        )}

        {/* ─── 1. HEADER ──────────────────────────── */}
        <ParallaxSection
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          ghost="00"
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 15,
                fontWeight: 400,
                color: "#ffffff",
                marginBottom: 12,
                marginTop: 0,
                textTransform: "lowercase",
              }}
            >
              {briefing.date}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                margin: 0,
                textTransform: "lowercase",
              }}
            >
              {protectAllah(briefing.greeting)}
            </h1>
            <motion.p
              animate={{ opacity: [0.35, 0.7, 0.35], y: [0, 5, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                marginTop: "3rem",
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                fontWeight: 400,
                color: "#ffffff",
                letterSpacing: "0.06em",
                textTransform: "lowercase",
              }}
            >
              scroll ↓
            </motion.p>
          </div>
        </ParallaxSection>

        {/* ─── 2. QURAN VERSE ─────────────────────── */}
        <ParallaxSection
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          ghost="01"
        >
          <QuranVerse
            quran={briefing.quran}
            Card={Card}
            Eyebrow={Eyebrow}
            Ghost={NoGhost}
          />
        </ParallaxSection>

        {/* ─── 3. GARMIN RECOVERY ─────────────────── */}
        {briefing.garmin && (
          <ParallaxSection
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            ghost="02"
          >
            <Garmin garmin={briefing.garmin} />
          </ParallaxSection>
        )}

        {/* ─── 4. WEATHER ─────────────────────────── */}
        <ParallaxSection
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          ghost="03"
        >
          <Weather weather={briefing.weather} Card={Card} Eyebrow={Eyebrow} />
        </ParallaxSection>

        {/* ─── 5. SCHEDULE (calendar + prayers) ───── */}
        <ParallaxSection
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          ghost="04"
        >
          <Calendar
            calendar={briefing.calendar}
            prayers={briefing.prayer_times}
            Card={Card}
            Eyebrow={Eyebrow}
            Ghost={NoGhost}
          />
        </ParallaxSection>

        {/* ─── 6. NEWS ────────────────────────────── */}
        <ParallaxSection
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          ghost="05"
        >
          <News
            news={briefing.news}
            Card={Card}
            Eyebrow={Eyebrow}
            Ghost={NoGhost}
          />
        </ParallaxSection>

        {/* ─── 7. FOCUS + TASKS ───────────────────── */}
        <ParallaxSection
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          ghost="06"
        >
          <div
            className="two-col-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
            }}
          >
            <Focus
              focus={briefing.focus}
              Card={Card}
              Eyebrow={Eyebrow}
              Ghost={NoGhost}
            />
            <Tasks
              tasks={briefing.tasks}
              Card={Card}
              Eyebrow={Eyebrow}
              Ghost={NoGhost}
            />
          </div>
        </ParallaxSection>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .two-col-grid {
            grid-template-columns: 1fr !important;
          }
          .garmin-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
