import os
import pickle
import numpy as np
import pandas as pd
from app.config import settings

class InferenceService:
    def __init__(self):
        self.clf = None
        self.scaler = None
        self.encoder = None
        self.loaded = False
        self.load_models()

    def load_models(self):
        try:
            if (os.path.exists(settings.MODEL_PATH) and
                os.path.exists(settings.SCALER_PATH) and
                os.path.exists(settings.ENCODER_PATH)):
                with open(settings.MODEL_PATH, "rb") as f:
                    self.clf = pickle.load(f)
                with open(settings.SCALER_PATH, "rb") as f:
                    self.scaler = pickle.load(f)
                with open(settings.ENCODER_PATH, "rb") as f:
                    self.encoder = pickle.load(f)
                self.loaded = True
                print("ML models loaded successfully.")
            else:
                print("ML models files not found. Using fallback prediction mode.")
        except Exception as e:
            print(f"Error loading ML models: {e}. Using fallback prediction mode.")

    def run_inference(self, data: dict) -> tuple:
        """
        Runs ML prediction using the loaded model pipeline.
        Returns:
            load_type: str ('Light_Load', 'Medium_Load', 'Maximum_Load')
            confidence: float
        """
        if not self.loaded:

            usage = data.get("usage_kwh", 0.0)
            if usage < 50:
                return "Light_Load", 0.90
            elif usage < 300:
                return "Medium_Load", 0.85
            else:
                return "Maximum_Load", 0.95

        try:

            features_dict = {
                "usage_kwh": data.get("usage_kwh", 0.0),
                "lagging_reactive": data.get("lagging_reactive", 0.0),
                "leading_reactive": data.get("leading_reactive", 0.0),
                "lagging_pf": data.get("lagging_pf", 0.0),
                "leading_pf": data.get("leading_pf", 0.0),
                "nsm": data.get("nsm", 0)
            }
            if features_dict["lagging_pf"] <= 1.0:
                features_dict["lagging_pf"] *= 100.0
            if features_dict["leading_pf"] <= 1.0:
                features_dict["leading_pf"] *= 100.0

            num_cols = ["usage_kwh", "lagging_reactive", "leading_reactive", "lagging_pf", "leading_pf", "nsm"]
            num_df = pd.DataFrame([[features_dict[col] for col in num_cols]], columns=num_cols)
            scaled_nums = self.scaler.transform(num_df)


            cat_df = pd.DataFrame([{"week_status": data["week_status"], "day_of_week": data["day_of_week"]}])
            encoded_cats = self.encoder.transform(cat_df)


            X = np.hstack([scaled_nums, encoded_cats])


            prediction = self.clf.predict(X)[0]


            probabilities = self.clf.predict_proba(X)[0]
            confidence = float(np.max(probabilities))

            return str(prediction), confidence
        except Exception as e:
            print(f"Error during ML inference: {e}. Using fallback rules.")
            usage = data.get("usage_kwh", 0.0)
            if usage < 50:
                return "Light_Load", 0.90
            elif usage < 300:
                return "Medium_Load", 0.85
            else:
                return "Maximum_Load", 0.95

inference_service = InferenceService()
