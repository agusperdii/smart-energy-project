from app.services.db_service import (
    insert_sensor_row,
    get_latest_row,
    get_last_n_rows,
    get_history,
    insert_ai_row
)
from app.services.inference import inference_service
from app.services.recommendation import (
    generate_risk_level,
    generate_alert_status,
    generate_recommendation
)
from app.services.scheduler import scheduler_loop
