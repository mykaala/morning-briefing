import { headers } from "next/headers";
import Dashboard, { type Briefing } from "@/components/Dashboard";
import LandingPage from "@/components/LandingPage";

/* ─── Demo data ──────────────────────────────────────────── */

const DEMO_BRIEFING: Briefing = {
  date: "Monday, March 30",
  greeting: "You've got a product review at 2pm — solid morning to prep.",
  prayer_times: [
    { name: "Dhuhr", time: "12:54", context: "after standup" },
    { name: "Asr",   time: "16:22", context: "before review" },
    { name: "Maghrib", time: "19:08", context: "after gym" },
    { name: "Isha",  time: "20:31", context: "" },
  ],
  quran: {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ",
    translation: "And whoever relies upon Allah — then He is sufficient for him.",
    surah_name: "At-Talaq",
    ayah_number: 3,
    surah_number: 65,
  },
  weather: {
    summary: "Crisp 14°C morning, clear skies all day. Perfect for a walk between meetings.",
    daily: {
      temp_max_c: 14,
      temp_min_c: 6,
      feels_like_max_c: 12,
      feels_like_min_c: 3,
      precipitation_hours: 0,
      wind_speed_max_kmh: 15,
      wind_gusts_max_kmh: 22,
    },
    hourly: [
      { time: "6 AM",  temp_c: 7,  feels_like_c: 3,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 20 },
      { time: "7 AM",  temp_c: 8,  feels_like_c: 4,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 15 },
      { time: "8 AM",  temp_c: 9,  feels_like_c: 5,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 10 },
      { time: "9 AM",  temp_c: 10, feels_like_c: 7,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 10 },
      { time: "10 AM", temp_c: 11, feels_like_c: 8,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 15 },
      { time: "11 AM", temp_c: 13, feels_like_c: 10, precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 20 },
      { time: "12 PM", temp_c: 14, feels_like_c: 11, precip_probability: 10, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 25 },
      { time: "1 PM",  temp_c: 14, feels_like_c: 12, precip_probability: 10, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 30 },
      { time: "2 PM",  temp_c: 14, feels_like_c: 12, precip_probability: 10, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 35 },
      { time: "3 PM",  temp_c: 13, feels_like_c: 11, precip_probability: 15, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 40 },
      { time: "4 PM",  temp_c: 12, feels_like_c: 9,  precip_probability: 15, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 45 },
      { time: "5 PM",  temp_c: 11, feels_like_c: 8,  precip_probability: 10, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 40 },
      { time: "6 PM",  temp_c: 10, feels_like_c: 7,  precip_probability: 10, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 35 },
      { time: "7 PM",  temp_c: 9,  feels_like_c: 6,  precip_probability: 10, precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 30 },
      { time: "8 PM",  temp_c: 8,  feels_like_c: 5,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 25 },
      { time: "9 PM",  temp_c: 7,  feels_like_c: 4,  precip_probability: 5,  precipitation_mm: 0, rain_mm: 0, snowfall_cm: 0, cloud_cover_pct: 20 },
    ],
  },
  calendar: {
    day_summary: "Light morning, one big review in the afternoon.",
    has_events: true,
    events: [
      {
        title: "Team Standup",
        start_time: "2026-03-30T10:00:00-04:00",
        end_time: "2026-03-30T10:30:00-04:00",
        is_all_day: false,
        prep_nudge: "check sprint board",
      },
      {
        title: "Product Review",
        start_time: "2026-03-30T14:00:00-04:00",
        end_time: "2026-03-30T15:30:00-04:00",
        is_all_day: false,
        prep_nudge: "slides ready?",
      },
      {
        title: "1:1 with Manager",
        start_time: "2026-03-30T17:00:00-04:00",
        end_time: "2026-03-30T17:30:00-04:00",
        is_all_day: false,
        prep_nudge: "anything to flag?",
      },
    ],
  },
  news: [
    {
      title: "Fed signals two rate cuts in 2026 as inflation cools",
      source: "Wall Street Journal",
      url: "#",
      summary: "Markets rally as Fed hints at easing cycle beginning mid-year.",
    },
    {
      title: "OpenAI releases new reasoning model beating o3 on benchmarks",
      source: "The Verge",
      url: "#",
      summary: "The new model shows significant gains on math and coding tasks.",
    },
  ],
  tasks: {
    all_tasks: [
      { title: "Finalize Q2 roadmap doc", priority: 5, due_time: "Today", project_name: "Work" },
      { title: "Reply to recruiter email",  priority: 3, due_time: "Today", project_name: "Inbox" },
    ],
    focus_task: { title: "Finalize Q2 roadmap doc", priority: 5, due_time: "Today", project_name: "Work" },
    focus_reason:
      "Product review is at 2pm — having the roadmap doc done before then sets you up well.",
  },
  focus: "The prep you do this morning will speak for you this afternoon.",
};

/* ─── Page (server component) ────────────────────────────── */

export default async function Home() {
  const headersList = await headers();
  const isDemo = headersList.get("x-demo-mode") === "true";

  let briefing: Briefing | null = null;
  let fetchError: string | null = null;

  if (isDemo) {
    // No valid cookie — show landing page with demo option
    return <LandingPage demoBriefing={DEMO_BRIEFING} />;
  }

  const url = process.env.R2_URL;
  if (!url) {
    fetchError = "R2_URL is not configured";
  } else {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      briefing = (await res.json()) as Briefing;
    } catch (e) {
      fetchError = e instanceof Error ? e.message : "unknown error";
    }
  }

  return <Dashboard briefing={briefing} isDemo={false} error={fetchError} />;
}
