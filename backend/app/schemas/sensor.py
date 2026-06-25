from pydantic import BaseModel

class SensorIngestSchema(BaseModel):
    machine_id: str
    usage_kwh: float
    lagging_reactive: float
    leading_reactive: float
    lagging_pf: float
    leading_pf: float
    co2: float
