import logging
import os
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv
from garminconnect import Garmin

load_dotenv(Path(__file__).parent.parent.parent / '.env.local')
logger = logging.getLogger(__name__)

GARTH_HOME = "/tmp/garth_tokens"


def get_garmin_client() -> Garmin:
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")

    client = Garmin(email, password)

    try:
        client.login(tokenstore=GARTH_HOME)
        logger.info("Garmin: resumed from cached tokens")
    except Exception:
        logger.info("Garmin: performing full login")
        try:
            client.login()
            client.garth.dump(GARTH_HOME)
        except Exception as e:
            logger.error("Garmin full error: %s", repr(e))
            raise RuntimeError(
                "Garmin login failed — check GARMIN_EMAIL and GARMIN_PASSWORD"
            ) from e

    return client


def get_garmin_data() -> dict:
    client = get_garmin_client()

    yesterday = (date.today() - timedelta(days=1)).strftime("%Y-%m-%d")

    # Body Battery
    body_battery = None
    try:
        bb_data = client.get_body_battery(yesterday)
        if bb_data:
            values = [entry.get("value")
                      for entry in bb_data if entry.get("value") is not None]
            end_of_day = values[-1] if values else None
            max_val = max(values) if values else None
            body_battery = {"end_of_day": end_of_day, "max": max_val}
    except Exception as e:
        logger.error("Failed to fetch body battery: %s", e)

    # Sleep
    sleep = None
    try:
        sleep_data = client.get_sleep_data(yesterday)
        daily = sleep_data.get("dailySleepDTO", {}) if sleep_data else {}
        sleep_score = None
        scores = sleep_data.get("sleepScores") if sleep_data else None
        if scores:
            sleep_score = scores.get("overall", {}).get("value") if isinstance(
                scores.get("overall"), dict) else scores.get("overall")
        sleep = {
            "total_hours": round(daily.get("sleepTimeSeconds", 0) / 3600, 1),
            "deep_hours": round(daily.get("deepSleepSeconds", 0) / 3600, 1),
            "rem_hours": round(daily.get("remSleepSeconds", 0) / 3600, 1),
            "awake_hours": round(daily.get("awakeSleepSeconds", 0) / 3600, 1),
            "score": sleep_score,
        }
    except Exception as e:
        logger.error("Failed to fetch sleep data: %s", e)

    # Stress
    stress = None
    try:
        stress_data = client.get_stress_data(yesterday)
        if stress_data:
            stress = {
                "avg": stress_data.get("avgStressLevel"),
                "max": stress_data.get("maxStressLevel"),
            }
    except Exception as e:
        logger.error("Failed to fetch stress data: %s", e)

    # Steps
    steps = None
    try:
        steps_data = client.get_steps_data(yesterday)
        if steps_data:
            steps = sum(entry.get("steps", 0) for entry in steps_data)
    except Exception as e:
        logger.error("Failed to fetch steps data: %s", e)

    return {
        "body_battery": body_battery,
        "sleep": sleep,
        "stress": stress,
        "steps": steps,
    }


if __name__ == "__main__":
    import json
    logging.basicConfig(level=logging.INFO)
    result = get_garmin_data()
    print(json.dumps(result, indent=2))
