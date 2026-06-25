from fastapi import APIRouter, Depends, status
from app.schemas.simulation import SimulationInputSchema
from app.schemas.response import PredictionResponseSchema
from app.services.inference import inference_service
from app.services.recommendation import (
    generate_recommendation,
    generate_risk_level,
    generate_alert_status
)
from app.utils.datetime_utils import (
    generate_timestamp,
    calculate_nsm,
    get_week_status,
    get_day_of_week
)

router = APIRouter(prefix="/simulate", tags=["Manual Simulation Inference"])

@router.post("", response_model=PredictionResponseSchema, status_code=status.HTTP_200_OK)
def run_simulation(payload: SimulationInputSchema):
    """
    Accepts manual parameter inputs, auto-calculates time parameters,
    runs the ML classification model, and returns predicted results instantly.
    """
    dt = generate_timestamp()

    nsm = payload.nsm if payload.nsm is not None else calculate_nsm(dt)
    week_status = payload.week_status if payload.week_status is not None else get_week_status(dt)
    day_of_week = payload.day_of_week if payload.day_of_week is not None else get_day_of_week(dt)


    features = {
        "usage_kwh": payload.usage_kwh,
        "lagging_reactive": payload.lagging_reactive,
        "leading_reactive": payload.leading_reactive,
        "lagging_pf": payload.lagging_pf,
        "leading_pf": payload.leading_pf,
        "nsm": nsm,
        "week_status": week_status,
        "day_of_week": day_of_week
    }


    load_type, confidence = inference_service.run_inference(features)


    risk_level = generate_risk_level(load_type, confidence)
    alert_status = generate_alert_status(load_type, confidence, payload.lagging_pf)
    recommendation = generate_recommendation(features, load_type, confidence)

    return PredictionResponseSchema(
        load_type=load_type,
        confidence=confidence,
        risk_level=risk_level,
        recommendation=recommendation,
        alert_status=alert_status
    )
