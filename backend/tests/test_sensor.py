def test_ingest_sensor_data(client):
    payload = {
        "machine_id": "machine-01",
        "usage_kwh": 45.2,
        "lagging_reactive": 12.5,
        "leading_reactive": 5.4,
        "lagging_pf": 0.88,
        "leading_pf": 0.92,
        "co2": 1.25
    }
    response = client.post("/api/v1/sensor", json=payload)
    assert response.status_code == 201

    data = response.json()
    assert data["machine_id"] == "machine-01"
    assert data["usage_kwh"] == 45.2
    assert "id" in data
    assert "timestamp" in data
    assert data["week_status"] in ["Weekday", "Weekend"]
    assert "day_of_week" in data
    assert data["nsm"] >= 0 and data["nsm"] <= 86400
