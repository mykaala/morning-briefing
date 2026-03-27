import os
from datetime import datetime
from dotenv import load_dotenv
import pytz
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

load_dotenv()


def get_google_calendar_events():
    """Fetch today's Google Calendar events using OAuth2."""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        raise ValueError(
            "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN "
            "environment variables are required"
        )

    # Build credentials from refresh token (headless OAuth2)
    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret
    )

    # Refresh the access token
    request = Request()
    credentials.refresh(request)

    # Build the Calendar API service
    service = build("calendar", "v3", credentials=credentials)

    # Get today's date range in America/New_York
    eastern = pytz.timezone("America/New_York")
    now = datetime.now(eastern)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = now.replace(hour=23, minute=59, second=59, microsecond=0)

    # Fetch events from primary calendar
    events_result = service.events().list(
        calendarId="primary",
        timeMin=today_start.isoformat(),
        timeMax=today_end.isoformat(),
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = events_result.get("items", [])

    calendar_events = []
    for event in events:
        # Determine if it's an all-day event
        is_all_day = "date" in event["start"]

        # Get start and end times
        if is_all_day:
            start_time = event["start"]["date"]
            end_time = event["end"]["date"]
        else:
            start_time = event["start"]["dateTime"]
            end_time = event["end"]["dateTime"]

        # Get location if available
        location = event.get("location", None)

        calendar_events.append({
            "title": event.get("summary", "Untitled"),
            "start_time": start_time,
            "end_time": end_time,
            "is_all_day": is_all_day,
            "location": location
        })

    calendar_events.sort(key=lambda e: e["start_time"])
    return calendar_events


if __name__ == "__main__":
    result = get_google_calendar_events()
    for event in result:
        print(event)
