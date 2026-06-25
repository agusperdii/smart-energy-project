def test_run_simulation(client):
    payload = {
        "usage_kwh": 250.0,
        "lagging_reactive": 80.0,
        "leading_reactive": 20.0,
        "lagging_pf": 0.82,
        "leading_pf": 0.88
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "load_type" in data
    assert "confidence" in data
    assert "risk_level" in data
    assert "recommendation" in data
    assert "alert_status" in data
    assert data["load_type"] in ["Light_Load", "Medium_Load", "Maximum_Load"]

def test_run_simulation_with_overrides(client):
    payload = {
        "usage_kwh": 250.0,
        "lagging_reactive": 80.0,
        "leading_reactive": 20.0,
        "lagging_pf": 0.82,
        "leading_pf": 0.88,
        "nsm": 45000,
        "week_status": "Weekend",
        "day_of_week": "Sunday"
    }
    response = client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "load_type" in data
    assert "confidence" in data
    assert data["load_type"] in ["Light_Load", "Medium_Load", "Maximum_Load"]
