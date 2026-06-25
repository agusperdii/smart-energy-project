from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.response import LiveMonitoringResponseSchema
from app.services.db_service import get_latest_row, get_history

router = APIRouter(prefix="/dashboard", tags=["Dashboard Telemetry"])

@router.get("/live", response_model=LiveMonitoringResponseSchema)
def get_live_data(db: Session = Depends(get_db)):
    """Retrieves the latest telemetry or prediction record from the database."""
    row = get_latest_row(db)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Belum ada data monitoring yang tersedia."
        )
    return row

@router.get("/history", response_model=List[LiveMonitoringResponseSchema])
def get_historical_data(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieves historical telemetry and prediction records sorted chronologically."""
    rows = get_history(db, limit=limit)
    return rows
