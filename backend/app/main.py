import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routes.sensor import router as sensor_router
from app.routes.dashboard import router as dashboard_router
from app.routes.simulation import router as simulation_router
from app.services.scheduler import scheduler_loop

@asynccontextmanager
async def lifespan(app: FastAPI):

    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")


    scheduler_task = asyncio.create_task(scheduler_loop())

    yield


    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass
    print("Background scheduler task shut down.")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SteelSense Electricity Monitoring API",
    description="Backend API supporting raw telemetry ingestion, predictive analysis, manual simulation, and dashboard queries.",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(sensor_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(simulation_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "aktif",
        "service": "Backend SteelSense",
        "docs_url": "/docs"
    }
