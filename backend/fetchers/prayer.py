import os
from datetime import datetime
import requests
from dotenv import load_dotenv

load_dotenv()


def get_prayer_times():
    """Fetch today's prayer times using the Aladhan API."""
    latitude = os.getenv("LATITUDE")
    longitude = os.getenv("LONGITUDE")

    if not latitude or not longitude:
        raise ValueError("LATITUDE and LONGITUDE environment variables are required")

    # Format today's date as DD-MM-YYYY
    today = datetime.now().strftime("%d-%m-%Y")

    url = "http://api.aladhan.com/v1/timings"
    params = {
        "date": today,
        "latitude": latitude,
        "longitude": longitude,
        "method": 2
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    timings = data["data"]["timings"]

    # Extract the prayer times (fajr excluded — handled separately before the app is used)
    prayer_times = {
        "dhuhr": timings["Dhuhr"],
        "asr": timings["Asr"],
        "maghrib": timings["Maghrib"],
        "isha": timings["Isha"]
    }

    return prayer_times


if __name__ == "__main__":
    result = get_prayer_times()
    print(result)
