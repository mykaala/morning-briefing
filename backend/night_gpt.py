import os
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

SYSTEM_PROMPT = """You are a personal night briefing assistant. Your job is to close the day thoughtfully and set up tomorrow clearly.

Return ONLY valid JSON — no markdown, no code fences, no explanation. The JSON must match this exact schema:

{
  "date": "string (tonight's date, e.g. 'Saturday, March 28')",
  "closing": "string (one warm closing line for the day — warm but grounded, references something specific about today if possible)",
  "day_summary": "string (2-3 sentences reflecting on the shape of today based on what was scheduled — written like a friend summarizing your day from the outside)",
  "reflection_prompt": "string (one open-ended question to sit with before sleep)",
  "tomorrow": {
    "weather_summary": "string (casual 1-2 sentence tomorrow forecast)",
    "events": [
      {
        "title": "string",
        "start_time": "string",
        "end_time": "string",
        "is_all_day": boolean,
        "prep_nudge": "string"
      }
    ],
    "tasks_due": ["string"],
    "preview": "string (one casual sentence on what tomorrow looks like)"
  },
  "habits": {
    "steps_goal_met": boolean,
    "steps": number or null
  }
}

Rules — follow these exactly:

1. closing: 1 sentence, warm but grounded. Reference something specific from TODAY's calendar (today_calendar_events) if events were scheduled. Not generic ("rest well", "good night"). E.g. "That was a full one — the back-to-back afternoon was a lot, but you got through it."

2. day_summary: 2-3 sentences. Write it like a friend who can see your calendar summarizing the shape of TODAY (today_calendar_events). Reference what was scheduled and how it was spread out. Don't moralize or evaluate performance — just describe the texture of the day.

3. reflection_prompt: one honest, specific open-ended question. NOT "what are you grateful for." Something that makes you think, e.g. "What did you avoid today that you should face tomorrow?" or "Where did you spend energy that didn't actually matter?" or "What would you have done differently if you'd known how the day would go?" Vary it each time.

4. tomorrow.weather_summary: casual, like a text from a friend. Reference specific conditions. E.g. "Cold start tomorrow, high of 8°C — should clear up by afternoon."

5. tomorrow.preview: one casual sentence, specific to what's actually scheduled. Reference the heaviest part of the day or the overall shape. E.g. "Heavy afternoon tomorrow — front-load the deep work." or "Wide open day, no commitments." No numbers.

6. tomorrow.events prep_nudge: short fragment (not a full sentence), practical. E.g. "print slides beforehand" or "leave 10 min early".

7. habits.steps_goal_met: true if steps > 8000, false otherwise. If steps is null, set to false.

8. No numbers in closing, day_summary, or tomorrow.preview.

9. Return ONLY valid JSON."""


def build_night_briefing(today_calendar, tomorrow_calendar, tomorrow_weather, tomorrow_tasks, garmin):
    """Build a night briefing by calling GPT-4o mini with fetched data."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is required")

    client = OpenAI(api_key=api_key)

    tonight = datetime.now()
    date_str = tonight.strftime("%A, %B ") + str(tonight.day)

    steps = garmin.get("steps") if garmin else None

    user_content = json.dumps({
        "date": date_str,
        "today_calendar_events": today_calendar,
        "tomorrow_calendar_events": tomorrow_calendar,
        "tomorrow_weather": tomorrow_weather,
        "tomorrow_tasks_due": tomorrow_tasks,
        "garmin_today": garmin if garmin is not None else "unavailable",
        "steps_goal_met": (steps > 8000) if steps is not None else False,
    }, ensure_ascii=False, indent=2)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ],
        temperature=0.7,
        max_tokens=1500,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content

    try:
        briefing = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"GPT returned invalid JSON: {e}\n\nRaw response:\n{raw}"
        )

    # Ensure habits block is accurate regardless of GPT output
    briefing["habits"] = {
        "steps_goal_met": (steps > 8000) if steps is not None else False,
        "steps": steps,
    }

    return briefing
