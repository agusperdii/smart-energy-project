import asyncio
from app.database import SessionLocal
from app.services.db_service import get_last_n_rows, insert_ai_row
from app.utils.feature_engineering import aggregate_last_rows, prepare_model_features
from app.services.inference import inference_service
from app.services.recommendation import generate_recommendation, generate_risk_level, generate_alert_status

async def scheduler_loop():
    """
    Background scheduler loop executing every 20 seconds.
    Collects the latest 10 rows, aggregates them, runs model inference,
    generates alerts/recommendations, and inserts a new AI result row.
    """
    print("Background scheduler loop started.")
    while True:
        await asyncio.sleep(20)

        db = SessionLocal()
        try:

            rows = get_last_n_rows(db, 10)
            if rows:
                print(f"Scheduler: Aggregating {len(rows)} recent rows.")
                aggregated = aggregate_last_rows(rows)


                model_input = prepare_model_features(aggregated)


                load_type, confidence = inference_service.run_inference(model_input)


                risk_level = generate_risk_level(load_type, confidence)
                alert_status = generate_alert_status(load_type, confidence, aggregated.get("lagging_pf", 0.90))
                recommendation = generate_recommendation(aggregated, load_type, confidence)


                ai_data = {
                    **aggregated,
                    "load_type": load_type,
                    "confidence": confidence,
                    "risk_level": risk_level,
                    "alert_status": alert_status,
                    "recommendation": recommendation
                }


                inserted = insert_ai_row(db, ai_data)
                print(f"Scheduler: Inserted AI row {inserted.id} with load_type={load_type}")
            else:
                print("Scheduler: No data found to aggregate.")
        except Exception as e:
            print(f"Scheduler error in loop: {e}")
        finally:
            db.close()
