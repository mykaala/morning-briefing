import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from garminconnect import Garmin
from garminconnect import GarminConnectAuthenticationError
from garth.exc import GarthHTTPError

# Load environment variables
load_dotenv(Path(__file__).parent.parent.parent / '.env.local')
logger = logging.getLogger(__name__)

# Persistent token storage (home directory, survives reboots / ephemeral containers)
GARTH_HOME = Path.home() / ".garminconnect"
GARTH_HOME.mkdir(exist_ok=True)


def get_garmin_client() -> Garmin:
    """
    Initialize Garmin client safely.
    - Reuse cached tokens if available.
    - Login with credentials only if necessary.
    - Avoid repeated logins to prevent 429 errors.
    """
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")

    # Step 1: Initialize empty client (no login yet)
    client = Garmin()

    # Step 2: Try to login with tokenstore
    try:
        client.login(tokenstore=GARTH_HOME)
        logger.info("Garmin: resumed session from cached tokens")
        return client
    except (FileNotFoundError, GarminConnectAuthenticationError, GarthHTTPError) as e:
        logger.info("Garmin: token reuse failed, performing full login")

    # Step 3: Full login with email/password
    if not email or not password:
        raise RuntimeError(
            "GARMIN_EMAIL and GARMIN_PASSWORD must be set for first-time login")

    client = Garmin(email=email, password=password)
    try:
        client.login()
        # Persist tokens for future runs
        client.garth.dump(GARTH_HOME)
        logger.info(
            "Garmin: full login successful, tokens stored at %s", GARTH_HOME)
    except Exception as e:
        logger.error("Garmin full login failed: %s", repr(e))
        raise RuntimeError(
            "Garmin login failed — check GARMIN_EMAIL and GARMIN_PASSWORD"
        ) from e

    return client


def get_garmin_data(date: str = "yesterday") -> dict:
    """
    Fetch Garmin daily stats for the given date.

    Args:
        date: "yesterday" (default, for morning briefing) or "today" (for night briefing).

    Returns a dict with steps, sleep_hours, sleep_score, body_battery_end, stress_avg.
    Any value that can't be fetched is returned as None.
    """
    from datetime import datetime, timedelta

    if date == "today":
        target = datetime.now().date()
    else:
        target = (datetime.now() - timedelta(days=1)).date()

    date_str = target.strftime("%Y-%m-%d")

    try:
        client = get_garmin_client()
    except Exception as e:
        logger.error("Garmin: client init failed: %s", e)
        return {"steps": None, "sleep_hours": None, "sleep_score": None,
                "body_battery_end": None, "stress_avg": None}

    result = {"steps": None, "sleep_hours": None, "sleep_score": None,
              "body_battery_end": None, "stress_avg": None}

    # Daily stats (steps, stress)
    try:
        stats = client.get_stats(date_str)
        result["steps"] = stats.get("totalSteps")
        avg_stress = stats.get("averageStressLevel")
        result["stress_avg"] = avg_stress if avg_stress and avg_stress > 0 else None
    except Exception as e:
        logger.warning("Garmin: stats fetch failed: %s", e)

    # Sleep data
    try:
        sleep = client.get_sleep_data(date_str)
        daily_sleep = sleep.get("dailySleepDTO", {})
        sleep_secs = daily_sleep.get("sleepTimeSeconds")
        if sleep_secs:
            result["sleep_hours"] = round(sleep_secs / 3600, 1)
        result["sleep_score"] = daily_sleep.get("sleepScores", {}).get("overall", {}).get("value")
    except Exception as e:
        logger.warning("Garmin: sleep fetch failed: %s", e)

    # Body battery
    try:
        bb_data = client.get_body_battery(date_str)
        if bb_data and isinstance(bb_data, list):
            values = [
                entry.get("value")
                for entry in bb_data
                if entry.get("value") is not None
            ]
            if values:
                result["body_battery_end"] = values[-1]
    except Exception as e:
        logger.warning("Garmin: body battery fetch failed: %s", e)

    return result
