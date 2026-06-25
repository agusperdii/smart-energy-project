from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./steelsense.db"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    OPENAI_API_KEY: str = ""
    MODEL_PATH: str = "app/ml/classifier.pkl"
    SCALER_PATH: str = "app/ml/scaler.pkl"
    ENCODER_PATH: str = "app/ml/encoder.pkl"

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()
