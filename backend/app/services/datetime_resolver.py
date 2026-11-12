import re
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from dateutil import parser


WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}


def _extract_time(text: str, sunday: bool) -> time | None:
    lowered = text.casefold()
    if "late afternoon" in lowered:
        return time(15, 30) if sunday else time(16, 30)
    if "late morning" in lowered:
        return time(11, 0)
    if "morning" in lowered:
        return time(10, 0)
    if "afternoon" in lowered:
        return time(14, 0)

    match = re.search(r"\b(?:at\s*)?(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b", lowered)
    if not match:
        return None
    hour = int(match.group(1)) % 12
    if match.group(3) == "pm":
        hour += 12
    return time(hour, int(match.group(2) or 0))


def _extract_date(text: str, now: datetime) -> datetime | None:
    lowered = text.casefold()
    if re.search(r"\btomorrow\b", lowered):
        return now + timedelta(days=1)
    if re.search(r"\btoday\b", lowered):
        return now

    weekday_match = re.search(r"\b(" + "|".join(WEEKDAYS) + r")\b", lowered)
    if weekday_match:
        target = WEEKDAYS[weekday_match.group(1)]
        days = (target - now.weekday()) % 7
        return now + timedelta(days=days)

    has_explicit_date = bool(
        re.search(
            r"\b(january|february|march|april|may|june|july|august|september|"
            r"october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|"
            r"oct|nov|dec)\b|\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b",
            lowered,
        )
    )
    if not has_explicit_date:
        return None
    try:
        return parser.parse(text, fuzzy=True, default=now.replace(tzinfo=None))
    except (ValueError, OverflowError):
        return None


def resolve_visit_datetime(
    text: str, timezone_name: str = "America/Los_Angeles", now: datetime | None = None
) -> datetime | None:
    zone = ZoneInfo(timezone_name)
    current = now.astimezone(zone) if now else datetime.now(zone)
    date_value = _extract_date(text, current)
    if date_value is None:
        return None

    sunday = date_value.weekday() == 6
    time_value = _extract_time(text, sunday=sunday)
    if time_value is None:
        return None

    resolved = datetime.combine(date_value.date(), time_value, tzinfo=zone)
    if resolved <= current and re.search(r"\b(" + "|".join(WEEKDAYS) + r")\b", text, re.I):
        resolved += timedelta(days=7)
    if resolved <= current:
        return None

    valid_slots = (
        {(10, 30), (11, 30), (13, 30), (14, 30), (15, 30)}
        if resolved.weekday() == 6
        else {(9, 30), (10, 0), (11, 0), (13, 30), (14, 0), (15, 30), (16, 30)}
    )
    if (resolved.hour, resolved.minute) not in valid_slots:
        return None
    return resolved


def resolve_visit_date(
    text: str, timezone_name: str = "America/Los_Angeles", now: datetime | None = None
) -> date | None:
    """Resolve just the date so the conversation can retain partial booking state."""
    zone = ZoneInfo(timezone_name)
    current = now.astimezone(zone) if now else datetime.now(zone)
    value = _extract_date(text, current)
    if value is None:
        return None
    resolved_date = value.date()
    if resolved_date < current.date():
        return None
    return resolved_date


def visit_slot_labels(value: date) -> list[str]:
    if value.weekday() == 6:
        return ["10:30 AM", "11:30 AM", "1:30 PM", "2:30 PM", "3:30 PM"]
    return ["9:30 AM", "10:00 AM", "11:00 AM", "1:30 PM", "2:00 PM", "3:30 PM", "4:30 PM"]
