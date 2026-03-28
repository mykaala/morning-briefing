# ☀️ Morning Briefing ☕️

i didn’t want to check 7 apps in the morning.  
i wanted one screen that tells me everything i need.
i hope to extend this project into a second brain.

feel free to play around with the demo. :)
visit at https://morning.mykaala.com/

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

## future features i can think of
- day score (workload, deadline, weather, workouts)
- garmin connect integration (plan day according to sleep amount, fatigue, etc.)
- night section (reflections, summary, habit tracking, next day preview)

---

## a few things worth knowing

- if something breaks (news, ticktick), the rest still works.
- gpt is opinionated on purpose (short nudges, no fluff, no linkedin quotes).
- quran verse is stable for the day (seeded randomness).
- cors handled server-side so frontend stays clean.
