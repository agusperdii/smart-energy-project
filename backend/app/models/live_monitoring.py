from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class LiveMonitoring(Base):
    __tablename__ = "live_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, index=True, nullable=True)
    timestamp = Column(DateTime, nullable=True)
    usage_kwh = Column(Float, nullable=True)
    lagging_reactive = Column(Float, nullable=True)
    leading_reactive = Column(Float, nullable=True)
    lagging_pf = Column(Float, nullable=True)
    leading_pf = Column(Float, nullable=True)
    co2 = Column(Float, nullable=True)
    nsm = Column(Integer, nullable=True)
    week_status = Column(String, nullable=True)
    day_of_week = Column(String, nullable=True)
    load_type = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    alert_status = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=True)
