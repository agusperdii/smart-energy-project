from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.sensor import SensorIngestSchema
from app.schemas.response import LiveMonitoringResponseSchema
from app.services.db_service import insert_sensor_row
from app.utils.datetime_utils import (
    generate_timestamp,
    calculate_nsm,
    get_week_status,
    get_day_of_week
)

router = APIRouter(prefix="/sensor", tags=["Sensor Ingestion"])

@router.post("", response_model=LiveMonitoringResponseSchema, status_code=status.HTTP_201_CREATED)
def ingest_sensor_data(payload: SensorIngestSchema, db: Session = Depends(get_db)):
    """
    Receives real-time telemetry payload from IoT sensors.
    Calculates time-based parameters (NSM, WeekStatus, Day of Week)
    and saves the raw metrics to the database.
    """
    dt = generate_timestamp()


    nsm = calculate_nsm(dt)
    week_status = get_week_status(dt)
    day_of_week = get_day_of_week(dt)


    sensor_data = {
        "machine_id": payload.machine_id,
        "timestamp": dt,
        "usage_kwh": payload.usage_kwh,
        "lagging_reactive": payload.lagging_reactive,
        "leading_reactive": payload.leading_reactive,
        "lagging_pf": payload.lagging_pf,
        "leading_pf": payload.leading_pf,
        "co2": payload.co2,
        "nsm": nsm,
        "week_status": week_status,
        "day_of_week": day_of_week
    }


    db_row = insert_sensor_row(db, sensor_data)
    return db_row
