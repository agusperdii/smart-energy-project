from app.config import settings

def generate_risk_level(load_type: str, confidence: float) -> str:
    """Determines risk level based on load classification."""
    if load_type == "Maximum_Load":
        return "High"
    elif load_type == "Medium_Load":
        return "Medium"
    else:
        return "Low"

def generate_alert_status(load_type: str, confidence: float, lagging_pf: float = 0.90) -> str:
    """Determines alert status based on load and power factor."""
    if load_type == "Maximum_Load" and confidence >= 0.80:
        return "Alert"
    elif lagging_pf < 0.85:
        return "Warning"
    return "Normal"

def generate_recommendation(sensor_data: dict, load_type: str, confidence: float) -> str:
    """Generates recommendation text. Uses OpenAI if key is set, otherwise rules-based fallback."""
    lagging_pf = sensor_data.get("lagging_pf", 0.90)
    risk = generate_risk_level(load_type, confidence)
    alert = generate_alert_status(load_type, confidence, lagging_pf)

    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            prompt = (
                f"You are an expert energy efficiency AI model for SteelSense monitoring system.\n"
                f"Generate a concise, actionable recommendation for a steel manufacturing machine based on the following telemetry:\n"
                f"- Current Load Type: {load_type} (Confidence: {confidence:.2f})\n"
                f"- Risk Level: {risk}\n"
                f"- Alert Status: {alert}\n"
                f"- Electricity Usage: {sensor_data.get('usage_kwh')} kWh\n"
                f"- Lagging Power Factor: {lagging_pf}\n"
                f"- Leading Power Factor: {sensor_data.get('leading_pf')}\n"
                f"Provide a recommendation in 1-2 professional sentences in Indonesian (Bahasa Indonesia)."
            )
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI recommendation failed: {e}. Falling back to rule-based.")


    if load_type == "Maximum_Load":
        return "Beban listrik maksimum terdeteksi. Disarankan untuk memindahkan operasi berat (seperti peleburan, pengerolan) ke waktu luar beban puncak (off-peak). Periksa unit koreksi faktor daya mesin."
    elif load_type == "Medium_Load":
        if lagging_pf < 0.85:
            return "Beban operasional normal tetapi faktor daya rendah. Periksa bank kapasitor untuk menghindari denda faktor daya rendah dari penyedia listrik."
        return "Beban operasional normal. Pantau tingkat daya reaktif. Pastikan faktor daya tertinggal (lagging PF) tetap di atas 0.85 untuk menghindari biaya reaktif tambahan."
    else:
        return "Status menganggur atau beban rendah. Disarankan mematikan sistem non-esensial dan peralatan standby untuk meminimalkan konsumsi daya dasar."
