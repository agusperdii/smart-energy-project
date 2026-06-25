from datetime import datetime

def generate_timestamp() -> datetime:
    """Generates the current naive local timestamp."""
    return datetime.now()

def calculate_nsm(dt: datetime) -> int:
    """Calculates number of seconds since midnight (NSM) for a datetime object."""
    return dt.hour * 3600 + dt.minute * 60 + dt.second

def get_week_status(dt: datetime) -> str:
    """Returns 'Weekday' or 'Weekend' based on the datetime day."""

    return "Weekend" if dt.weekday() >= 5 else "Weekday"

def get_day_of_week(dt: datetime) -> str:
    """Returns the string representation of the day of the week."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[dt.weekday()]
