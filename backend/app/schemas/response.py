from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class PredictionResponseSchema(BaseModel):
    load_type: str
    confidence: float
    risk_level: str
    recommendation: str
    alert_status: str

class LiveMonitoringResponseSchema(BaseModel):
    id: int
    machine_id: Optional[str] = None
    timestamp: Optional[datetime] = None
    usage_kwh: Optional[float] = None
    lagging_reactive: Optional[float] = None
    leading_reactive: Optional[float] = None
    lagging_pf: Optional[float] = None
    leading_pf: Optional[float] = None
    co2: Optional[float] = None
    nsm: Optional[int] = None
    week_status: Optional[str] = None
    day_of_week: Optional[str] = None
    load_type: Optional[str] = None
    confidence: Optional[float] = None
    risk_level: Optional[str] = None
    recommendation: Optional[str] = None
    alert_status: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
