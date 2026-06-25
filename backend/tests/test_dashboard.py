from app.models.live_monitoring import LiveMonitoring
from datetime import datetime

def test_get_dashboard_live(client, db_session):

    db_session.query(LiveMonitoring).delete()

    record = LiveMonitoring(
        machine_id="machine-01",
        timestamp=datetime.now(),
        usage_kwh=120.5,
        lagging_reactive=40.2,
        leading_reactive=10.1,
        lagging_pf=0.82,
        leading_pf=0.88,
        co2=3.4,
        nsm=45000,
        week_status="Weekday",
        day_of_week="Wednesday",
        load_type="Medium_Load",
        confidence=0.87,
        risk_level="Medium",
        recommendation="Optimize power factor.",
        alert_status="Normal"
    )
    db_session.add(record)
    db_session.commit()

    response = client.get("/api/v1/dashboard/live")
    assert response.status_code == 200
    data = response.json()
    assert data["machine_id"] == "machine-01"
    assert data["load_type"] == "Medium_Load"
    assert data["confidence"] == 0.87

def test_get_dashboard_history(client, db_session):

    db_session.query(LiveMonitoring).delete()

    for i in range(5):
        record = LiveMonitoring(
            machine_id=f"machine-{i}",
            timestamp=datetime.now(),
            usage_kwh=50.0 + i,
            lagging_reactive=20.0,
            leading_reactive=5.0,
            lagging_pf=0.90,
            leading_pf=0.90,
            co2=1.5,
            nsm=30000,
            week_status="Weekday",
            day_of_week="Tuesday",
            load_type="Light_Load",
            confidence=0.92,
            risk_level="Low",
            recommendation="Idle load.",
            alert_status="Normal"
        )
        db_session.add(record)
    db_session.commit()

    response = client.get("/api/v1/dashboard/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    assert data[0]["machine_id"] == "machine-0"
    assert data[-1]["machine_id"] == "machine-4"
