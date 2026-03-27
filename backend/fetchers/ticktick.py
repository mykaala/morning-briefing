import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent.parent / ".env.local")

INBOX_ID = "inbox115445014"  # Intentional: TickTick inbox project IDs are static per account
BASE_URL = "https://api.ticktick.com/open/v1"

# TickTick priority values → keep as-is (0=none, 1=low, 3=medium, 5=high)


def _fmt_due(due_raw: str, today_utc, tomorrow_utc) -> str | None:
    """Return a human-readable due label, or None if due_raw is empty."""
    if not due_raw:
        return None
    try:
        # dueDate is like "2026-03-27T00:00:00+0000"
        dt = datetime.fromisoformat(due_raw.replace("+0000", "+00:00"))
        d = dt.date()
        if d == today_utc:
            return "Today"
        if d == tomorrow_utc:
            return "Tomorrow"
        return d.strftime("%b %-d")  # e.g. "Mar 29"
    except ValueError:
        return due_raw[:10] or None


def get_ticktick_tasks():
    access_token = os.getenv("TICKTICK_ACCESS_TOKEN")
    if not access_token:
        raise ValueError("TICKTICK_ACCESS_TOKEN environment variable is required")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    resp = requests.get(
        f"{BASE_URL}/project/{INBOX_ID}/data",
        headers=headers,
        timeout=10,
    )

    if resp.status_code == 401:
        raise ValueError(
            "TickTick access token expired. Re-run the OAuth script to get a new one."
        )

    resp.raise_for_status()
    data = resp.json()

    raw_tasks = data.get("tasks", []) if isinstance(data, dict) else data

    today_utc = datetime.now(timezone.utc).date()
    tomorrow_utc = today_utc + timedelta(days=1)

    pool = []
    for task in raw_tasks:
        if task.get("status") != 0:
            continue
        due_raw = task.get("dueDate") or ""
        if not due_raw:
            continue
        try:
            d = datetime.fromisoformat(due_raw.replace("+0000", "+00:00")).date()
        except ValueError:
            continue
        if d == today_utc:
            pool.append(task)

    def sort_key(t):
        priority = t.get("priority", 0)
        due_raw = t.get("dueDate") or ""
        due_sort = due_raw[:10] if due_raw else "9999-99-99"
        return (-priority, due_sort)

    pool.sort(key=sort_key)

    tasks = []
    for t in pool:
        due_raw = t.get("dueDate") or ""
        tasks.append({
            "title": t.get("title", ""),
            "priority": t.get("priority", 0),
            "due_time": _fmt_due(due_raw, today_utc, tomorrow_utc),
            "project_name": "Inbox",
        })

    return tasks


if __name__ == "__main__":
    result = get_ticktick_tasks()
    if not result:
        print("No tasks returned.")
    for task in result:
        print(task)
