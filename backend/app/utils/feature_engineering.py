from typing import List, Dict, Any
from app.models.live_monitoring import LiveMonitoring

def aggregate_last_rows(rows: List[LiveMonitoring]) -> Dict[str, Any]:
    """
    Aggregates a list of LiveMonitoring database records by calculating the average
    for numerical fields, and using the latest record's metadata for datetime/categories.
    """
    if not rows:
        return {}


    sorted_rows = sorted(rows, key=lambda r: r.id if r.id is not None else 0)
    latest_row = sorted_rows[-1]

    num_rows = len(sorted_rows)
    avg_usage = sum(r.usage_kwh or 0.0 for r in sorted_rows) / num_rows
    avg_lagging_reactive = sum(r.lagging_reactive or 0.0 for r in sorted_rows) / num_rows
    avg_leading_reactive = sum(r.leading_reactive or 0.0 for r in sorted_rows) / num_rows
    avg_lagging_pf = sum(r.lagging_pf or 0.0 for r in sorted_rows) / num_rows
    avg_leading_pf = sum(r.leading_pf or 0.0 for r in sorted_rows) / num_rows
    avg_co2 = sum(r.co2 or 0.0 for r in sorted_rows) / num_rows
    avg_nsm = int(sum(r.nsm or 0 for r in sorted_rows) / num_rows)

    return {
        "machine_id": latest_row.machine_id,
        "timestamp": latest_row.timestamp or latest_row.created_at,
        "usage_kwh": avg_usage,
        "lagging_reactive": avg_lagging_reactive,
        "leading_reactive": avg_leading_reactive,
        "lagging_pf": avg_lagging_pf,
        "leading_pf": avg_leading_pf,
        "co2": avg_co2,
        "nsm": avg_nsm,
        "week_status": latest_row.week_status,
        "day_of_week": latest_row.day_of_week
    }

def normalize_features(features: Dict[str, Any]) -> Dict[str, Any]:
    """Placeholder for custom feature normalization/transformations if needed."""
    return features

def prepare_model_features(features: Dict[str, Any]) -> Dict[str, Any]:
    """Prepares feature dictionary for inference input validation."""
    return {
        "usage_kwh": features.get("usage_kwh", 0.0),
        "lagging_reactive": features.get("lagging_reactive", 0.0),
        "leading_reactive": features.get("leading_reactive", 0.0),
        "lagging_pf": features.get("lagging_pf", 0.0),
        "leading_pf": features.get("leading_pf", 0.0),
        "nsm": features.get("nsm", 0),
        "week_status": features.get("week_status", "Weekday"),
        "day_of_week": features.get("day_of_week", "Monday")
    }
