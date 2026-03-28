# morning-briefing ☀️

my personal morning dashboard, built so i don't have to think before coffee. every day it pulls my calendar, to-do list, weather, news, prayer times, and a quran verse — throws it all at GPT-4o Mini — and spits out one clean JSON file. 

i didn’t want 5 apps in the morning.  
i wanted one screen that tells me everything i need.
i hope to extend this project into a second brain.

feel free to play around with the demo. :)

---

## what it does

six fetchers run in parallel on a google cloud function every morning:

```
Open-Meteo ─-─┐
NewsAPI ──────┤
Google Cal ───┤──► GPT-4o Mini ──► Cloudflare R2 ──► Next.js dashboard
TickTick ─────┤
Aladhan ──────┤
alquran.cloud ┘
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

**apis:** open-meteo (free 🙌), news api, google calendar v3, ticktick open api, aladhan, alquran.cloud

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
│       └── quran.py              # 📖 daily verse 
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
        └── Focus.tsx             # the daily sentence
```
---
## future features i can think of
- day score (workload, deadline, weather, workouts)
- garmin connect integration (plan day according to sleep amount, fatigue, etc.)
- night section (reflections, summary, habit tracking, next day preview)

---

## a few things worth knowing

- no caching. ever. always fresh.
- if something breaks (news, ticktick), the rest still works.
- gpt is opinionated on purpose (short nudges, no fluff, no linkedin quotes).
- quran verse is stable for the day (seeded randomness).
- cors handled server-side so frontend stays clean.
