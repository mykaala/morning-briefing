import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Expected JSON schema returned by GPT-4o mini
# {
#   "date": "Thursday, March 26",
#   "greeting": "You've got ISA Meeting at 5pm — solid day ahead.",
#   "prayer_times": [
#     { "name": "Dhuhr", "time": "12:45 PM", "context": "after standup" },
#     { "name": "Asr",   "time": "3:30 PM",  "context": "before ISA" },
#     { "name": "Maghrib","time": "6:45 PM", "context": "after ISA" },
#     { "name": "Isha",  "time": "8:15 PM",  "context": "evening" }
#   ],
#   "quran": { "arabic": "...", "translation": "...", "surah_name": "...", "ayah_number": 1, "surah_number": 1 },
#   "weather": { "summary": "High of 19°C but it'll feel colder, rain picks up around 2pm. Bring a jacket." },
#   "calendar": {
#     "day_summary": "Light morning, two back-to-back commitments in the afternoon.",
#     "events": [ { "title": "...", "start_time": "...", "end_time": "...", "is_all_day": false, "prep_nudge": "..." } ],
#     "has_events": true
#   },
#   "news": [ { "title": "...", "source": "...", "url": "...", "summary": "..." } ],
#   "tasks": {
#     "all_tasks": [ { "title": "...", "priority": 3, "project_name": "..." } ],
#     "focus_task": { "title": "...", "priority": 3, "project_name": "..." } or null,
#     "focus_reason": "One sentence — never null, even if no tasks."
#   },
#   "focus": "One grounded, specific sentence for the day.",
#   "garmin": {
#     "body_battery_end": number or null,
#     "sleep_hours": number or null,
#     "sleep_score": number or null,
#     "stress_avg": number or null,
#     "steps": number or null
#   }
# }

SYSTEM_PROMPT = """You are a personal morning briefing assistant. Your job is to synthesize raw data into a structured, actionable daily briefing.

Return ONLY valid JSON — no markdown, no code fences, no explanation. The JSON must match this exact schema:

{
  "date": "string (e.g. 'Thursday, March 26')",
  "greeting": "string (one-liner tailored to what the day actually holds — see rule 1)",
  "prayer_times": [
    { "name": "Dhuhr",   "time": "string", "context": "string (optional short note)" },
    { "name": "Asr",     "time": "string", "context": "string" },
    { "name": "Maghrib", "time": "string", "context": "string" },
    { "name": "Isha",    "time": "string", "context": "string" }
  ],
  "quran": {
    "arabic": "string",
    "translation": "string",
    "surah_name": "string",
    "ayah_number": integer,
    "surah_number": integer
  },
  "weather": {
    "summary": "string (max 2 sentences, casual tone — see rule 3)"
  },
  "calendar": {
    "day_summary": "string (one casual sentence on the shape of the day — see rule 4)",
    "events": [
      {
        "title": "string",
        "start_time": "string",
        "end_time": "string",
        "is_all_day": boolean,
        "prep_nudge": "string"
      }
    ],
    "has_events": boolean
  },
  "news": [
    {
      "title": "string",
      "source": "string",
      "url": "string",
      "summary": "string (one punchy sentence, headline digest style)"
    }
  ],
  "tasks": {
    "all_tasks": [
      {
        "title": "string",
        "priority": integer,
        "project_name": "string"
      }
    ],
    "focus_task": { "title": "string", "priority": integer, "project_name": "string" } or null,
    "focus_reason": "string (never null — see rule 6)"
  },
  "focus": "string (one grounded sentence — see rule 7)",
  "garmin": {
    "body_battery_end": number or null,
    "sleep_hours": number or null,
    "sleep_score": number or null,
    "stress_avg": number or null,
    "steps": number or null,
    "summary": "string — one casual qualitative sentence, no numbers (see rule 10)"
  }
}

Rules — follow these exactly:

1. Greeting: 1–2 sentences, casual and human — like a friend who knows your day and how you slept. Let Garmin data shape the TONE (rested vs drained, high-energy vs recovery) and let calendar/tasks shape the CONTENT — but never quote any numbers, stats, or metrics. No body battery values, no sleep hours, no step counts, no stress scores. Express energy in feel: "slept well", "rough night", "running low", "good energy". Vary structure — sometimes lead with energy state, sometimes with the day's shape, sometimes with a specific event. Never generic ("Let's make today count"). Examples of the right register: "Slept well, light morning ahead — good day to get ahead of things." / "Rough night but ISA at 5 is the one thing that matters." / "Good energy and a clear schedule — no excuses today."

2. Prayer times: arrange Dhuhr, Asr, Maghrib, Isha as a timeline relative to calendar events. For context, use a short phrase that places the prayer relative to the schedule — e.g. "after standup", "between class and ISA", "after maghrib window", "evening wind-down". Keep context to 2–4 words. If no events nearby, use a time-of-day anchor like "midday", "afternoon", "sunset", "night".

3. Weather summary: write it like a friend texting you, not a weather report. Max 2 sentences. Use Celsius and km/h. Reference specific temps and times from the hourly data. E.g. "High of 19°C but it'll feel colder, rain picks up around 2pm. Bring a jacket." Do NOT include daily or hourly data in the output — summary only.

4. Calendar day_summary: one casual sentence on the overall shape of the day. E.g. "Light morning, two back-to-back commitments in the afternoon." or "Wide open day — no events." Base it on when events fall, how many there are, and how spread out they are.

5. Calendar prep nudges: short fragments, not full sentences. Match the vibe. For classes, they are formatted as [class number] - [room name], such as 508 - cs124.

6. Tasks focus_reason: NEVER return null. If there are tasks, explain why that task is the focus. If all_tasks is empty, write something useful like "No tasks due today — good day to get ahead on something." or "Clear plate — use it."

7. Focus sentence: one grounded, practical sentence. Think stoic mentor, not LinkedIn. Reference something specific from the day if possible — a meeting, the weather, a task. No exclamation points. E.g. "The window before ISA is your best shot at deep work." or "Rain's coming — get the hard thing done before 2."

8. News: return exactly 2 items. Summaries are punchy headline-digest style — one sentence, no fluff.

9. Keep all raw data intact: don't alter quran text or news URLs.

10. Garmin data (if present): use it to personalise the briefing.
    - Greeting: let energy state shape tone — see rule 1 for the no-numbers constraint.
    - Focus: factor in energy. Low battery or poor sleep → protect the morning. High battery → push.
    - Add a recovery note in focus if body_battery_end < 40 OR sleep_hours < 6.
    - garmin.summary: one casual qualitative sentence on overall recovery. No numbers, no metrics. E.g. "Well-rested and low stress — good day to push." / "Short night, take it easy this morning." / "Decent sleep but stress ran high yesterday — keep the morning light."
    - Echo all numeric values back exactly as received."""


def build_briefing(weather, calendar, news, tasks, prayer, quran, garmin=None):
    """Build a morning briefing by calling GPT-4o mini with all fetcher data."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")

    client = OpenAI(api_key=api_key)

    today = datetime.now()
    date_str = today.strftime("%A, %B ") + str(today.day)  # e.g., "Thursday, March 26"

    hour = today.hour
    if hour < 12:
        time_of_day = "morning"
    elif hour < 17:
        time_of_day = "afternoon"
    else:
        time_of_day = "evening"

    user_content = json.dumps({
        "date": date_str,
        "time_of_day": time_of_day,
        "prayer_times": prayer,
        "quran": quran,
        "weather": weather,
        "calendar_events": calendar,
        "news_headlines": news,
        "tasks": tasks,
        "garmin": garmin if garmin is not None else "unavailable"
    }, ensure_ascii=False, indent=2)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        temperature=0.7,
        max_tokens=3000,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content

    try:
        briefing = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"GPT returned invalid JSON: {e}\n\nRaw response:\n{raw}"
        )

    return briefing


if __name__ == "__main__":
    sample_weather = {
        "daily": {
            "temp_max_c": 23.4,
            "temp_min_c": 14.6,
            "feels_like_max_c": 22.2,
            "feels_like_min_c": 12.8,
            "precipitation_hours": 3.0,
            "wind_speed_max_kmh": 23.2,
            "wind_gusts_max_kmh": 35.4,
        },
        "hourly": [
            {"time": "8:00 AM", "temp_c": 17.8, "feels_like_c": 16.4, "precip_probability": 5, "precipitation_mm": 0.0, "rain_mm": 0.0, "snowfall_cm": 0.0, "cloud_cover_pct": 10},
            {"time": "11:00 AM", "temp_c": 21.8, "feels_like_c": 20.9, "precip_probability": 15, "precipitation_mm": 0.0, "rain_mm": 0.0, "snowfall_cm": 0.0, "cloud_cover_pct": 35},
            {"time": "2:00 PM", "temp_c": 23.4, "feels_like_c": 22.2, "precip_probability": 60, "precipitation_mm": 1.2, "rain_mm": 1.2, "snowfall_cm": 0.0, "cloud_cover_pct": 80},
            {"time": "5:00 PM", "temp_c": 20.3, "feels_like_c": 19.0, "precip_probability": 80, "precipitation_mm": 3.5, "rain_mm": 3.5, "snowfall_cm": 0.0, "cloud_cover_pct": 95},
            {"time": "8:00 PM", "temp_c": 17.3, "feels_like_c": 16.0, "precip_probability": 40, "precipitation_mm": 0.5, "rain_mm": 0.5, "snowfall_cm": 0.0, "cloud_cover_pct": 70},
        ]
    }

    sample_calendar = [
        {
            "title": "Team Standup",
            "start_time": "2024-03-26T09:00:00",
            "end_time": "2024-03-26T09:30:00",
            "is_all_day": False,
            "location": None
        },
        {
            "title": "Lunch with Sarah",
            "start_time": "2024-03-26T12:30:00",
            "end_time": "2024-03-26T13:30:00",
            "is_all_day": False,
            "location": "Cafe Nero on Main St"
        },
    ]

    sample_news = [
        {"title": "Fed signals rate cuts unlikely before summer", "source": "WSJ", "url": "https://wsj.com/example", "published_at": "2024-03-26T07:00:00Z"},
        {"title": "Apple unveils new AI features for iPhone", "source": "Reuters", "url": "https://reuters.com/example", "published_at": "2024-03-26T08:00:00Z"},
    ]

    sample_tasks = [
        {"title": "Finish Q1 report", "priority": 3, "due_time": "10:00 AM", "project_name": "Work"},
        {"title": "Reply to client emails", "priority": 2, "due_time": None, "project_name": "Work"},
        {"title": "Call the dentist", "priority": 1, "due_time": None, "project_name": "Personal"},
    ]

    sample_prayer = {
        "dhuhr": "12:45 PM",
        "asr": "3:30 PM",
        "maghrib": "6:45 PM",
        "isha": "8:15 PM"
    }

    sample_quran = {
        "arabic": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        "translation": "You alone do we worship, and You alone do we ask for help.",
        "surah_name": "Al-Fatihah",
        "ayah_number": 5,
        "surah_number": 1
    }

    result = build_briefing(
        weather=sample_weather,
        calendar=sample_calendar,
        news=sample_news,
        tasks=sample_tasks,
        prayer=sample_prayer,
        quran=sample_quran
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
