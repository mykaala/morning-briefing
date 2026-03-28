import functions_framework
import json
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")

from fetchers.prayer import get_prayer_times
from fetchers.weather import get_weather_forecast
from fetchers.news import get_news_headlines
from fetchers.quran import get_quran_verse
from fetchers.calendar_gcal import get_google_calendar_events
from fetchers.ticktick import get_ticktick_tasks
from fetchers.garmin import get_garmin_data
from gpt import build_briefing
from uploader import upload_briefing

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

FETCHERS = {
    "weather":  get_weather_forecast,
    "calendar": get_google_calendar_events,
    "news":     get_news_headlines,
    "tasks":    get_ticktick_tasks,
    "prayer":   get_prayer_times,
    "quran":    get_quran_verse,
    "garmin":   get_garmin_data,
}


def _run_fetchers():
    results = {}
    with ThreadPoolExecutor(max_workers=7) as executor:
        future_to_name = {executor.submit(fn): name for name, fn in FETCHERS.items()}
        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                results[name] = future.result()
                log.info(f"[OK]   {name}")
            except Exception as e:
                results[name] = None
                log.error(f"[FAIL] {name}: {e}")
    return results


@functions_framework.http
def run(request):
    try:
        log.info("Starting morning briefing pipeline")

        results = _run_fetchers()

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

        url = upload_briefing(briefing)

        log.info(f"Pipeline complete: {url}")
        return (json.dumps({"status": "ok", "url": url}), 200, {"Content-Type": "application/json"})

    except Exception as e:
        log.exception("Unhandled error in pipeline")
        return (json.dumps({"status": "error", "message": str(e)}), 500, {"Content-Type": "application/json"})


if __name__ == "__main__":
    class FakeRequest:
        pass

    print(run(FakeRequest()))
