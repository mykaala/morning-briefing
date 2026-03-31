import functions_framework
import json
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")

from fetchers.prayer import get_prayer_times
from fetchers.weather import get_weather_forecast, get_tomorrow_weather
from fetchers.news import get_news_headlines
from fetchers.quran import get_quran_verse
from fetchers.calendar_gcal import get_google_calendar_events
from fetchers.night_calendar import get_tomorrow_calendar_events
from fetchers.ticktick import get_ticktick_tasks, get_tasks_due_tomorrow
from fetchers.garmin import get_garmin_data
from gpt import build_briefing
from night_gpt import build_night_briefing
from uploader import upload_briefing, upload_night_briefing

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

MORNING_FETCHERS = {
    "weather":  get_weather_forecast,
    "calendar": get_google_calendar_events,
    "news":     get_news_headlines,
    "tasks":    get_ticktick_tasks,
    "prayer":   get_prayer_times,
    "quran":    get_quran_verse,
    "garmin":   get_garmin_data,
}


def _run_fetchers(fetcher_map):
    results = {}
    with ThreadPoolExecutor(max_workers=len(fetcher_map)) as executor:
        future_to_name = {executor.submit(fn): name for name, fn in fetcher_map.items()}
        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                results[name] = future.result()
                log.info(f"[OK]   {name}")
            except Exception as e:
                results[name] = None
                log.error(f"[FAIL] {name}: {e}")
    return results


def _run_morning():
    results = _run_fetchers(MORNING_FETCHERS)

    briefing = build_briefing(
        weather=results["weather"],
        calendar=results["calendar"],
        news=results["news"],
        tasks=results["tasks"],
        prayer=results["prayer"],
        quran=results["quran"],
        garmin=results["garmin"],
    )

    # GPT outputs weather.summary only — merge raw daily/hourly back in
    raw_weather = results.get("weather") or {}
    if isinstance(raw_weather, dict) and isinstance(briefing.get("weather"), dict):
        briefing["weather"]["daily"] = raw_weather.get("daily", {})
        briefing["weather"]["hourly"] = raw_weather.get("hourly", [])

    url = upload_briefing(briefing, filename="briefing.json")
    return url


def _run_night():
    night_fetchers = {
        "today_calendar":    get_google_calendar_events,
        "tomorrow_calendar": get_tomorrow_calendar_events,
        "tomorrow_weather":  get_tomorrow_weather,
        "tomorrow_tasks":    get_tasks_due_tomorrow,
        "garmin":            lambda: get_garmin_data(date="today"),
    }

    results = _run_fetchers(night_fetchers)

    briefing = build_night_briefing(
        today_calendar=results["today_calendar"],
        tomorrow_calendar=results["tomorrow_calendar"],
        tomorrow_weather=results["tomorrow_weather"],
        tomorrow_tasks=results["tomorrow_tasks"],
        garmin=results["garmin"],
    )

    url = upload_night_briefing(briefing)
    return url


@functions_framework.http
def run(request):
    mode = request.args.get("mode", "morning")

    try:
        if mode == "night":
            log.info("Starting night briefing pipeline")
            url = _run_night()
        else:
            log.info("Starting morning briefing pipeline")
            url = _run_morning()

        log.info(f"Pipeline complete: {url}")
        return (json.dumps({"status": "ok", "url": url, "mode": mode}), 200, {"Content-Type": "application/json"})

    except Exception as e:
        log.exception(f"Unhandled error in {mode} pipeline")
        return (json.dumps({"status": "error", "message": str(e)}), 500, {"Content-Type": "application/json"})


if __name__ == "__main__":
    class FakeRequest:
        args = {"mode": "morning"}

    print(run(FakeRequest()))
