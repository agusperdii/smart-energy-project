from pydantic import BaseModel
from typing import Optional

class SimulationInputSchema(BaseModel):
    usage_kwh: float
    lagging_reactive: float
    leading_reactive: float
    lagging_pf: float
    leading_pf: float
    nsm: Optional[int] = None
    week_status: Optional[str] = None
    day_of_week: Optional[str] = None
