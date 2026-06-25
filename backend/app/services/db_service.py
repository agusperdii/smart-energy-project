from sqlalchemy.orm import Session
from app.models.live_monitoring import LiveMonitoring
from typing import List, Dict, Any

def insert_sensor_row(db: Session, sensor_data: Dict[str, Any]) -> LiveMonitoring:
    """Inserts a raw sensor ingestion row into the database."""
    db_row = LiveMonitoring(**sensor_data)
    db.add(db_row)
    db.commit()
    db.refresh(db_row)
    return db_row

def get_latest_row(db: Session) -> LiveMonitoring:
    """Gets the latest monitoring record."""
    return db.query(LiveMonitoring).order_by(LiveMonitoring.id.desc()).first()

def get_last_n_rows(db: Session, n: int) -> List[LiveMonitoring]:
    """Gets the latest N monitoring records, ordered descending (newest first)."""
    return db.query(LiveMonitoring).order_by(LiveMonitoring.id.desc()).limit(n).all()

def get_history(db: Session, limit: int = 50) -> List[LiveMonitoring]:
    """Gets historical monitoring records sorted chronologically (ascending)."""
    rows = db.query(LiveMonitoring).order_by(LiveMonitoring.id.desc()).limit(limit).all()
    rows.reverse()
    return rows

def insert_ai_row(db: Session, ai_data: Dict[str, Any]) -> LiveMonitoring:
    """Inserts an AI-analyzed prediction/aggregated row into the database."""
    db_row = LiveMonitoring(**ai_data)
    db.add(db_row)
    db.commit()
    db.refresh(db_row)
    return db_row
