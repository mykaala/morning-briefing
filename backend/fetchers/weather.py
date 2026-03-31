from datetime import datetime
import pytz
import requests


LATITUDE = 42.38654694973823
LONGITUDE = -72.52582349925908
TIMEZONE = "America/New_York"


def get_weather_forecast():
    """Fetch today's hourly and daily weather forecast using the Open-Meteo API."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max",
        "hourly": "temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,snowfall,cloud_cover",
        "timezone": TIMEZONE,
        "forecast_days": 1
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    hourly_data = data["hourly"]
    daily_data = data["daily"]

    # Get current hour in ET (matches the naive datetimes Open-Meteo returns)
    eastern = pytz.timezone(TIMEZONE)
    now_et = datetime.now(eastern).replace(tzinfo=None)
    current_hour = now_et.replace(minute=0, second=0, microsecond=0)

    hourly = []
    for i, time_str in enumerate(hourly_data["time"]):
        hour_dt = datetime.fromisoformat(time_str)

        # Only include hours from now onward
        if hour_dt < current_hour:
            continue

        hourly.append({
            "time": hour_dt.strftime("%-I %p"),  # e.g. "9 AM"
            "temp_c": round(hourly_data["apparent_temperature"][i], 1),  # feels_like
            "feels_like_c": round(hourly_data["apparent_temperature"][i], 1),
            "precip_probability": hourly_data["precipitation_probability"][i],
            "precipitation_mm": hourly_data["precipitation"][i],
            "rain_mm": hourly_data["rain"][i],
            "snowfall_cm": hourly_data["snowfall"][i],
            "cloud_cover_pct": hourly_data["cloud_cover"][i],
        })

    daily = {
        "temp_max_c": round(daily_data["temperature_2m_max"][0], 1),
        "temp_min_c": round(daily_data["temperature_2m_min"][0], 1),
        "feels_like_max_c": round(daily_data["apparent_temperature_max"][0], 1),
        "feels_like_min_c": round(daily_data["apparent_temperature_min"][0], 1),
        "precipitation_hours": daily_data["precipitation_hours"][0],
        "wind_speed_max_kmh": round(daily_data["wind_speed_10m_max"][0], 1),
        "wind_gusts_max_kmh": round(daily_data["wind_gusts_10m_max"][0], 1),
    }

    return {"daily": daily, "hourly": hourly}


def get_tomorrow_weather():
    """Fetch tomorrow's daily and hourly weather forecast using the Open-Meteo API."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "daily": "temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max",
        "hourly": "temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,snowfall,cloud_cover",
        "timezone": TIMEZONE,
        "forecast_days": 2,
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    hourly_data = data["hourly"]
    daily_data = data["daily"]

    # Tomorrow's daily is index 1
    daily = {
        "temp_max_c": round(daily_data["temperature_2m_max"][1], 1),
        "temp_min_c": round(daily_data["temperature_2m_min"][1], 1),
        "feels_like_max_c": round(daily_data["apparent_temperature_max"][1], 1),
        "feels_like_min_c": round(daily_data["apparent_temperature_min"][1], 1),
        "precipitation_hours": daily_data["precipitation_hours"][1],
        "wind_speed_max_kmh": round(daily_data["wind_speed_10m_max"][1], 1),
        "wind_gusts_max_kmh": round(daily_data["wind_gusts_10m_max"][1], 1),
    }

    # Open-Meteo returns 48 hourly entries for forecast_days=2;
    # tomorrow's hours are indices 24–47.
    tomorrow_hours = []
    for i in range(24, 48):
        hour_dt = datetime.fromisoformat(hourly_data["time"][i])
        tomorrow_hours.append({
            "time": hour_dt.strftime("%-I %p"),
            "temp_c": round(hourly_data["apparent_temperature"][i], 1),
            "feels_like_c": round(hourly_data["apparent_temperature"][i], 1),
            "precip_probability": hourly_data["precipitation_probability"][i],
            "precipitation_mm": hourly_data["precipitation"][i],
            "rain_mm": hourly_data["rain"][i],
            "snowfall_cm": hourly_data["snowfall"][i],
            "cloud_cover_pct": hourly_data["cloud_cover"][i],
        })

    return {"daily": daily, "hourly": tomorrow_hours}


if __name__ == "__main__":
    import json
    result = get_weather_forecast()
    print(json.dumps(result, indent=2))
