from gpt import build_briefing
from fetchers.ticktick import get_ticktick_tasks
from fetchers.calendar_gcal import get_google_calendar_events
from fetchers.quran import get_quran_verse
from fetchers.news import get_news_headlines
from fetchers.weather import get_weather_forecast
from fetchers.prayer import get_prayer_times
import json
import logging
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env.local")


logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

FETCHERS = {
    "prayer":   get_prayer_times,
    "weather":  get_weather_forecast,
    "news":     get_news_headlines,
    "quran":    get_quran_verse,
    "calendar": get_google_calendar_events,
    "tasks":    get_ticktick_tasks,
}


def run_fetchers():
    results = {}
    errors = {}

    with ThreadPoolExecutor(max_workers=len(FETCHERS)) as executor:
        future_to_name = {executor.submit(
            fn): name for name, fn in FETCHERS.items()}

        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                results[name] = future.result()
                log.info(f"[OK]  {name}")
            except Exception as e:
                results[name] = None
                errors[name] = str(e)
                log.error(f"[FAIL] {name}: {e}")

    return results, errors


def main():
    log.info("Running fetchers in parallel...")
    results, errors = run_fetchers()

    log.info("Calling GPT to build briefing...")
    try:
        briefing = build_briefing(
            weather=results["weather"],
            calendar=results["calendar"],
            news=results["news"],
            tasks=results["tasks"],
            prayer=results["prayer"],
            quran=results["quran"],
        )
    except Exception as e:
        log.error(f"build_briefing failed: {e}")
        sys.exit(1)

    output_path = "briefing_test.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(briefing, f, indent=2, ensure_ascii=False)

    print(json.dumps(briefing, indent=2, ensure_ascii=False))

    print("\n--- Fetcher summary ---")
    for name in FETCHERS:
        if name in errors:
            print(f"  FAIL  {name}: {errors[name]}")
        else:
            print(f"  OK    {name}")
    print(f"\nBriefing saved to {output_path}")


if __name__ == "__main__":
    main()
