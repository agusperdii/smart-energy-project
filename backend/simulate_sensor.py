import time
import random
import requests

API_URL = "http://localhost:8000/api/v1/sensor"
MACHINE_ID = "machine-01"

print("==================================================")
print("     SteelSense IoT Sensor Telemetry Simulator    ")
print("==================================================")
print(f"Target Endpoint : {API_URL}")
print(f"Machine ID      : {MACHINE_ID}")
print("Frequency       : Every 2 seconds")
print("Press Ctrl+C to cancel/exit")
print("==================================================\n")

step = 0
try:
    while True:
        step += 1


        if step % 25 == 0:
            print("\n[EVENT] Simulating High-Load Peak Spike")
            usage_kwh = round(random.uniform(450.0, 600.0), 2)
            lagging_reactive = round(random.uniform(150.0, 220.0), 2)
            leading_reactive = round(random.uniform(5.0, 15.0), 2)
            lagging_pf = round(random.uniform(0.92, 0.96), 2)
            leading_pf = round(random.uniform(0.95, 0.99), 2)
        else:
            usage_kwh = round(random.uniform(40.0, 150.0), 2)
            lagging_reactive = round(random.uniform(10.0, 50.0), 2)
            leading_reactive = round(random.uniform(2.0, 12.0), 2)
            lagging_pf = round(random.uniform(0.80, 0.92), 2)
            leading_pf = round(random.uniform(0.85, 0.95), 2)


        co2 = round(usage_kwh * 0.052, 2)

        payload = {
            "machine_id": MACHINE_ID,
            "usage_kwh": usage_kwh,
            "lagging_reactive": lagging_reactive,
            "leading_reactive": leading_reactive,
            "lagging_pf": lagging_pf,
            "leading_pf": leading_pf,
            "co2": co2
        }

        try:
            response = requests.post(API_URL, json=payload, timeout=2)
            if response.status_code == 201:
                data = response.json()
                ts = data.get("timestamp", "").split("T")[-1][:8]
                print(f"[{ts}] Ingest Success -> ID: {data.get('id')} | Load: {usage_kwh:6.2f} kWh | LagPF: {lagging_pf:.2f}")
            else:
                print(f"[ERROR] Failed to Ingest: Status {response.status_code} - {response.text}")
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Connection failed to {API_URL}: {e}")

        time.sleep(2)
except KeyboardInterrupt:
    print("\nSimulator gracefully exited.")
