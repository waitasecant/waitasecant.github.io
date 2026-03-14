"""Fetch running activities from Strava API and merge into running/data.json."""

import json
import os
import sys
from dotenv import load_dotenv
from calendar import monthrange
from datetime import datetime, timezone
import requests

load_dotenv()

STRAVA_TOKEN_URL = "https://www.strava.com/api/v3/oauth/token"
STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities"


def get_access_token(client_id: str, client_secret: str, refresh_token: str) -> str:
    """Exchange refresh token for a short-lived access token."""
    resp = requests.post(
        STRAVA_TOKEN_URL,
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def fetch_run_activities(access_token: str, year: int) -> list[dict]:
    """Fetch all Run activities for a given year (handles pagination)."""
    after = int(datetime(year, 1, 1, tzinfo=timezone.utc).timestamp())
    before = int(datetime(year + 1, 1, 1, tzinfo=timezone.utc).timestamp())

    activities: list[dict] = []
    page = 1
    per_page = 200

    while True:
        resp = requests.get(
            STRAVA_ACTIVITIES_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            params={
                "after": after,
                "before": before,
                "page": page,
                "per_page": per_page,
            },
            timeout=30,
        )
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break
        activities.extend(batch)
        if len(batch) < per_page:
            break
        page += 1

    return [a for a in activities if a.get("type") == "Run"]


def build_year_data(year: int, activities: list[dict]) -> dict:
    """Build myListYY/dateLinksYY object for the given year."""
    by_date: dict[str, list[dict]] = {}
    for activity in activities:
        dt = datetime.fromisoformat(activity["start_date_local"].replace("Z", "+00:00"))
        date_key = dt.strftime("%d-%m-%Y")
        by_date.setdefault(date_key, []).append(activity)

    my_list = []
    date_links = {}

    for month in range(1, 13):
        days_in_month = monthrange(year, month)[1]
        for day in range(1, days_in_month + 1):
            date_key = f"{day:02d}-{month:02d}-{year}"
            day_runs = by_date.get(date_key, [])

            if day_runs:
                total_km = round(sum(a["distance"] for a in day_runs) / 1000, 2)
                total_min = sum(a["moving_time"] for a in day_runs) // 60
                my_list.append([date_key, total_km, total_min])

                day_runs.sort(key=lambda a: a.get("start_date", ""))
                date_links[date_key] = (
                    f"https://www.strava.com/activities/{day_runs[0]['id']}"
                )
            else:
                my_list.append([date_key, 0, 0])

    yy = str(year)[-2:]
    return {f"myList{yy}": my_list, f"dateLinks{yy}": date_links}


def load_existing_data(path: str) -> dict:
    """Load existing data.json if present; otherwise return empty dict."""
    if not os.path.exists(path):
        return {}

    with open(path, "r", encoding="utf-8") as f:
        raw = f.read().strip()

    if not raw:
        return {}

    data = json.loads(raw)
    if not isinstance(data, dict):
        raise ValueError("running/data.json must contain a JSON object")

    return data


def main():
    client_id = os.environ.get("STRAVA_CLIENT_ID", "")
    client_secret = os.environ.get("STRAVA_CLIENT_SECRET", "")
    refresh_token = os.environ.get("STRAVA_REFRESH_TOKEN", "")

    year = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.now().year

    print("Fetching Strava access token...")
    access_token = get_access_token(client_id, client_secret, refresh_token)

    print(f"Fetching activities for {year}...")
    activities = fetch_run_activities(access_token, year)
    print(f"Found {len(activities)} runs.")

    year_data = build_year_data(year, activities)

    output_path = os.path.join(os.path.dirname(__file__), "data.json")

    try:
        existing_data = load_existing_data(output_path)
    except (json.JSONDecodeError, ValueError) as err:
        print(f"Error reading existing data file: {err}")
        sys.exit(1)

    existing_data.update(year_data)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=4)

    print(f"Merged full-year data for {year} into {output_path}")


if __name__ == "__main__":
    main()
