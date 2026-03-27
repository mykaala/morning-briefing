import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()


def upload_briefing(briefing_dict):
    """Upload briefing JSON to Cloudflare R2."""
    account_id = os.getenv("CF_R2_ACCOUNT_ID")
    access_key = os.getenv("CF_R2_ACCESS_KEY")
    secret_key = os.getenv("CF_R2_SECRET_KEY")
    bucket_name = os.getenv("CF_R2_BUCKET_NAME")

    if not all([account_id, access_key, secret_key, bucket_name]):
        raise ValueError(
            "CF_R2_ACCOUNT_ID, CF_R2_ACCESS_KEY, CF_R2_SECRET_KEY, and CF_R2_BUCKET_NAME "
            "environment variables are required"
        )

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"

    s3_client = boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name="auto"
    )

    briefing_json = json.dumps(briefing_dict, ensure_ascii=False, indent=2)

    s3_client.put_object(
        Bucket=bucket_name,
        Key="briefing.json",
        Body=briefing_json,
        ContentType="application/json",
        CacheControl="no-cache, no-store, must-revalidate"
    )

    # CF_R2_PUBLIC_URL is the intentionally public read URL for the R2 bucket (no auth required).
    public_url = f"{os.getenv('CF_R2_PUBLIC_URL')}/briefing.json"
    print(f"Briefing uploaded to {public_url}")

    return public_url


if __name__ == "__main__":
    sample_briefing = {
        "date": "Thursday, March 26",
        "greeting": "Good morning.",
        "prayer_times": {
            "fajr": "5:32 AM",
            "dhuhr": "12:45 PM",
            "asr": "3:30 PM",
            "maghrib": "6:45 PM",
            "isha": "8:15 PM"
        },
        "quran": {
            "arabic": "إِيَّاكَ نَعْبُدُ",
            "translation": "You alone do we worship",
            "surah_name": "Al-Fatihah",
            "ayah_number": 5,
            "surah_number": 1
        },
        "weather": {
            "summary": "Clear morning, high of 22°C.",
            "daily": {
                "temp_max_c": 22.0,
                "temp_min_c": 15.0,
                "feels_like_max_c": 21.0,
                "feels_like_min_c": 14.0,
                "precipitation_hours": 0.0,
                "wind_speed_max_kmh": 10.0,
                "wind_gusts_max_kmh": 15.0
            },
            "hourly": []
        },
        "calendar": {"events": [], "has_events": False},
        "news": [],
        "tasks": {"all_tasks": [], "focus_task": None, "focus_reason": None},
        "focus": "Focus on the task at hand."
    }

    upload_briefing(sample_briefing)
