# ☀️ Morning Briefing ☕️

i didn’t want 5+ apps in the morning.  
i wanted one screen that tells me everything i need.
i hope to extend this project into a second brain.

feel free to play around with the demo. :)

---

## what it does

seven fetchers run in parallel on a google cloud function every morning:

```
Open-Meteo ─-─┐
NewsAPI ──────┤
Google Cal ───┤
TickTick ─────┤──► GPT-4o Mini ──► Cloudflare R2 ──► Next.js dashboard
Aladhan ──────┤
alquran.cloud ─┤
Garmin ────────┘
```

gpt synthesizes everything into structured JSON, uploads it to R2 as `briefing.json`, and the frontend just fetches that. no database. no auth layer. one file, rebuilt daily. it's kind of beautiful in how simple it is.

---

## stack

| layer | tech |
|---|---|
| backend | google cloud functions (python) |
| ai | openai gpt-4o mini |
| storage | cloudflare r2 |
| frontend | next.js 14 + react + tailwind + typescript |
| deploy | gcf + vercel |

**apis:** open-meteo (free 🙌), news api, google calendar v3, ticktick open api, aladhan, alquran.cloud, garmin connect

---

## project structure

```
morning-briefing/
├── .env.local                    # secrets (backend, local only)
│
├── backend/
│   ├── main.py                   # ☁️ gcf entry point: run(request)
│   ├── gpt.py                    # 🤖 build_briefing() — the whole prompt thing
│   ├── uploader.py               # 📤 upload_briefing() — boto3 → r2
│   ├── test_pipeline.py          # 🧪 run everything locally end-to-end
│   ├── requirements.txt
│   └── fetchers/
│       ├── weather.py            # 🌤️  open-meteo hourly + daily (celsius)
│       ├── news.py               # 📰 top 5 us headlines
│       ├── calendar_gcal.py      # 📅 google calendar via oauth2 refresh token
│       ├── ticktick.py           # ✅ today's tasks via ticktick open api
│       ├── prayer.py             # 🕌 prayer times via aladhan
│       ├── quran.py              # 📖 daily verse
│       └── garmin.py             # 💚 yesterday's health data via garmin connect
│
└── frontend/
    ├── .env.local                # NEXT_PUBLIC_R2_URL
    ├── app/
    │   ├── page.tsx              # 🏠 main dashboard (skeleton → data)
    │   ├── layout.tsx
    │   └── api/briefing/
    │       └── route.ts          # 🔁 r2 proxy (handles cors)
    └── components/
        ├── PrayerTimes.tsx       # highlights next upcoming prayer
        ├── Weather.tsx           # gpt summary + scrollable hourly
        ├── Calendar.tsx          # events + gpt-generated prep nudges
        ├── Tasks.tsx             # focus task + everything else by project
        ├── News.tsx              # headlines with one-line summaries
        ├── QuranVerse.tsx        # arabic (rtl) + english translation
        ├── Focus.tsx             # the daily sentence
        └── Garmin.tsx            # recovery card — 4 animated rings
```
---
<<<<<<< HEAD

## briefing json schema

what gpt produces and the frontend consumes:

```json
{
  "date": "Thursday, March 26",
  "greeting": "Good morning.",
  "prayer_times": { "fajr": "5:32 AM", "dhuhr": "...", "asr": "...", "maghrib": "...", "isha": "..." },
  "quran": { "arabic": "...", "translation": "...", "surah_name": "Al-Fatihah", "ayah_number": 5, "surah_number": 1 },
  "weather": {
    "summary": "High of 14°C with rain after 3 PM — wrap up outdoor plans by 2.",
    "daily": { "temp_max_c": 14.2, "temp_min_c": 6.1, "wind_speed_max_kmh": 28.0 },
    "hourly": [{ "time": "9:00 AM", "temp_c": 11.0, "precip_probability": 10 }]
  },
  "calendar": {
    "has_events": true,
    "events": [{ "title": "Team standup", "start_time": "...", "prep_nudge": "anything blocking?" }]
  },
  "news": [{ "title": "...", "source": "Reuters", "url": "...", "summary": "One punchy sentence." }],
  "tasks": {
    "all_tasks": [{ "title": "...", "priority": 3, "project_name": "Work" }],
    "focus_task": { "title": "...", "priority": 3, "project_name": "Work" },
    "focus_reason": "Highest priority with a hard morning deadline."
  },
  "focus": "The hour before lunch decides the afternoon.",
  "garmin": {
    "body_battery_end": 72,
    "sleep_hours": 7.2,
    "sleep_score": 78,
    "stress_avg": 28,
    "steps": 8432,
    "summary": "Well-rested and low stress — good day to push."
  }
}
```
=======
## future features i can think of
- day score (workload, deadline, weather, workouts)
- garmin connect integration (plan day according to sleep amount, fatigue, etc.)
- night section (reflections, summary, habit tracking, next day preview)
>>>>>>> 9bcdd8d996a376166656a87e1016cb8132d92ad6

---

## a few things worth knowing

<<<<<<< HEAD
- **no caching, ever.** r2 file is `no-cache, no-store` and the next.js api route uses `cache: "no-store"`. always fresh.
- **fetcher failures don't crash the run.** if ticktick or news api is down, the rest still goes. gpt gets `null` for that section and handles it fine.
- **the gpt prompt is pretty opinionated.** weather summaries reference actual hours and temps. prep nudges are short fragments ("confirm the link", not a whole sentence). the focus quote is grounded — no linkedin energy allowed.
- **quran verse is the same all day.** `random.seed(today's date)` means it won't change on refresh. one verse, all day.
- **cors is handled server-side.** the next.js api route proxies the r2 fetch so the browser never makes a cross-origin request. no r2 cors config needed.
- **garmin tokens are cached.** `garminconnect` uses garth under the hood. tokens are dumped to `/tmp/garth_tokens` after the first full login and reused on subsequent runs — avoids garmin's rate limits. full re-auth only happens when tokens expire (~60 days).
- **garmin shapes the gpt output qualitatively.** body battery and sleep inform the greeting tone and focus sentence, but gpt never quotes raw numbers. it expresses energy in feel ("slept well", "running low") not data.
- **garmin section is skipped if unavailable.** if the fetcher fails or credentials aren't set, the recovery card simply doesn't render. everything else continues normally.
=======
- no caching. ever. always fresh.
- if something breaks (news, ticktick), the rest still works.
- gpt is opinionated on purpose (short nudges, no fluff, no linkedin quotes).
- quran verse is stable for the day (seeded randomness).
- cors handled server-side so frontend stays clean.
>>>>>>> 9bcdd8d996a376166656a87e1016cb8132d92ad6
