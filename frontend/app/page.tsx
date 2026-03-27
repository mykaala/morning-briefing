"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import QuranVerse from "@/components/QuranVerse";
import Weather from "@/components/Weather";
import Calendar from "@/components/Calendar";
import News from "@/components/News";
import Tasks from "@/components/Tasks";
import Focus from "@/components/Focus";

/* ─── Types ──────────────────────────────────────────────── */

interface PrayerTime {
  name: string;
  time: string;
  context?: string;
}

interface CalendarEvent {
  title: string;
  start_time?: string;
  end_time?: string;
  is_all_day?: boolean;
  prep_nudge?: string;
  location?: string;
}

interface Briefing {
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
    all_tasks: { title: string; priority: number; project_name: string }[];
    focus_task: { title: string; priority: number; project_name: string } | null;
    focus_reason: string;
  };
  focus: string;
}

/* ─── Daily accent colour (rotates by EST day-of-year) ─── */

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

/* ─── Weekly gradient variants ───────────────────────────── */
/*
  Each gradient is 3 layered radial-gradient "orbs" (soft ellipses with
  transparent stops) placed at different viewport corners, over a base colour.
  The result is that dreamy, blurred colour-wash look — no images needed.
*/

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

/* ─── Shared ease ────────────────────────────────────────── */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
}: {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  ghost?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });
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

/* ─── Main page ──────────────────────────────────────────── */

function getWeeklyGradientIndex(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 86_400_000)
  );
  return weekNum % GRADIENT_VARIANTS.length;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradientIndex, setGradientIndex] = useState(getWeeklyGradientIndex);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", getAccent());
    document.body.style.background = GRADIENT_VARIANTS[gradientIndex];
    document.body.style.backgroundAttachment = "fixed";
  }, [gradientIndex]);

  useEffect(() => {
    fetch("/api/briefing", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: Briefing) => {
        setBriefing(d);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.08em",
            textTransform: "lowercase",
          }}
        >
          loading briefing...
        </motion.div>
      </div>
    );
  }

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
    setGradientIndex(i => (i - 1 + GRADIENT_VARIANTS.length) % GRADIENT_VARIANTS.length);
  const nextGradient = () =>
    setGradientIndex(i => (i + 1) % GRADIENT_VARIANTS.length);

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
      <ScrollProgressBar containerRef={containerRef as React.RefObject<HTMLDivElement>} />

      {/* ── Wallpaper controls ── */}
      <button style={{ ...wallpaperBtnStyle, left: "1.5rem" }} onClick={prevGradient} aria-label="previous wallpaper">‹</button>
      <button style={{ ...wallpaperBtnStyle, right: "1.5rem" }} onClick={nextGradient} aria-label="next wallpaper">›</button>

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
        {/* ─── 1. HEADER ──────────────────────────── */}
        <ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost="00">
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
              {briefing.greeting}
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
        <ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost="01">
          <QuranVerse
            quran={briefing.quran}
            Card={Card}
            Eyebrow={Eyebrow}
            Ghost={NoGhost}
          />
        </ParallaxSection>

        {/* ─── 3. WEATHER ─────────────────────────── */}
        <ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost="02">
          <Weather
            weather={briefing.weather}
            Card={Card}
            Eyebrow={Eyebrow}
          />
        </ParallaxSection>

        {/* ─── 4. SCHEDULE (calendar + prayers) ───── */}
        <ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost="03">
          <Calendar
            calendar={briefing.calendar}
            prayers={briefing.prayer_times}
            Card={Card}
            Eyebrow={Eyebrow}
            Ghost={NoGhost}
          />
        </ParallaxSection>

        {/* ─── 5. NEWS ────────────────────────────── */}
        <ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost="04">
          <News
            news={briefing.news}
            Card={Card}
            Eyebrow={Eyebrow}
            Ghost={NoGhost}
          />
        </ParallaxSection>

        {/* ─── 6. FOCUS + TASKS ───────────────────── */}
        <ParallaxSection containerRef={containerRef as React.RefObject<HTMLDivElement>} ghost="05">
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
        }
      `}</style>
    </>
  );
}
