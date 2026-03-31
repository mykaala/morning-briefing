# ☀️ morning briefing

i didn't want to check 7 apps every morning.
i wanted one screen that tells me everything.

so i built it.

live at **[morning.mykaala.com](https://morning.mykaala.com)** — feel free to poke around the demo. :)

---

## what it does

two pipelines run on a schedule. one in the morning, one at night.

**morning** — seven fetchers hit their APIs in parallel, GPT synthesizes everything into structured JSON, that JSON gets uploaded to Cloudflare R2, and the Next.js frontend fetches it. no database. no auth layer. one file, rebuilt daily. it's kind of beautiful in how simple it is.

**night** — same idea. fetches today's calendar (for reflection context) + tomorrow's calendar, weather, and tasks. GPT closes out the day and sets up tomorrow. uploads to a second R2 file at 9pm ET.

```
morning pipeline:
Open-Meteo ─-─┐
NewsAPI ──────┤
Google Cal ───┤
TickTick ─────┤──► GPT-4o Mini ──► Cloudflare R2 ──► Next.js
Aladhan ──────┤
alquran.cloud ─┤
Garmin ────────┘

night pipeline:
Google Cal (today) ──┐
Google Cal (tmrw) ───┤
Open-Meteo (tmrw) ───┤──► GPT-4o Mini ──► Cloudflare R2 ──► Next.js
TickTick (tmrw) ─────┤
Garmin (today) ───────┘
```

---

## what you actually see

**morning tab** ☀️
- gpt-written focus sentence for the day
- weather — summary + scrollable hourly + daily forecast
- calendar events with AI-generated prep nudges
- today's tasks, grouped by project
- prayer times (next one highlighted)
- daily quran verse in arabic + english
- garmin recovery data — steps, sleep, body battery, stress

**night tab** 🌙 — unlocks at 9pm ET
- warm closing line for the day (references something specific from your calendar)
- 2-3 sentence reflection on the shape of your day
- one honest reflection prompt to sit with before sleep
- tomorrow's weather, events, tasks, and a one-line preview
- habit tracker — salah, workout, deep work, steps

---

## stack

| layer | tech |
|---|---|
| backend | google cloud functions (python) |
| ai | openai gpt-4o mini |
| storage | cloudflare r2 (static JSON, no db) |
| frontend | next.js 16 + typescript + framer motion |
| deploy | cloud scheduler → gcf + vercel |

**apis:** open-meteo (free 🙌), newsapi, google calendar v3, ticktick open api, aladhan, alquran.cloud, garmin connect

---

## project structure

```
morning-briefing/
├── .env.local                       # secrets (not committed)
│
├── backend/
│   ├── main.py                      # ☁️ gcf entry — handles ?mode=morning|night
│   ├── gpt.py                       # 🤖 morning briefing prompt + json schema
│   ├── night_gpt.py                 # 🌙 night briefing prompt + json schema
│   ├── uploader.py                  # 📤 boto3 → cloudflare r2
│   ├── requirements.txt
│   └── fetchers/
│       ├── weather.py               # 🌤️  open-meteo hourly + daily + tomorrow
│       ├── news.py                  # 📰 top 5 us headlines via newsapi
│       ├── calendar_gcal.py         # 📅 google calendar (oauth2 refresh token)
│       ├── night_calendar.py        # 📅 tomorrow's calendar events
│       ├── ticktick.py              # ✅ today's + tomorrow's tasks
│       ├── prayer.py                # 🕌 prayer times via aladhan
│       ├── quran.py                 # 📖 daily quran verse (seeded)
│       └── garmin.py                # 💚 steps, sleep, body battery, stress
│
└── frontend/
    ├── app/
    │   ├── page.tsx                 # server component — fetches both briefings in parallel
    │   ├── layout.tsx
    │   └── api/
    │       ├── auth/route.ts        # cookie-based access control
    │       └── refresh/route.ts     # proxies trigger to cloud function
    └── components/
        ├── TabSwitcher.tsx          # sun/moon tab bar, night locks til 9pm ET
        ├── Dashboard.tsx            # morning layout + refresh button
        ├── NightDashboard.tsx       # night layout + habit tracker wrapper
        ├── NightHabits.tsx          # interactive habit checkboxes (animated)
        ├── LandingPage.tsx          # demo mode hero + password form
        ├── Weather.tsx              # gpt summary + scrollable hourly
        ├── Calendar.tsx             # events with prep nudges
        ├── Tasks.tsx                # focus task + grouped task list
        ├── News.tsx                 # headlines + one-liners
        ├── QuranVerse.tsx           # arabic (rtl) + english translation
        ├── PrayerTimes.tsx          # next prayer highlighted
        ├── Focus.tsx                # the daily sentence
        └── Garmin.tsx               # recovery card — 4 animated rings
```

---

## a few things worth knowing

- if a fetcher fails (news api, ticktick, garmin), the rest of the pipeline still runs — nothing hard-crashes
- gpt is opinionated on purpose: short nudges, no fluff, no linkedin-style motivational quotes
- the night GPT gets today's calendar for reflection context AND tomorrow's calendar for the preview section — they're fetched separately so it doesn't confuse what's happened vs. what's coming
- quran verse is stable for the day (seeded by date so it doesn't change on refresh)
- cors handled server-side so the frontend stays clean
- the whole thing is personal — it's designed around one person's actual life (mine)
