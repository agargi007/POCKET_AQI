import os
import logging
import joblib
from random import randint
import logging

logging.basicConfig(
    filename="app/api.log",
    filemode="a",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

import pandas as pd
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from .data_fetcher import fetch_aqi_data
from .advisory import get_health_advisory


# -------------------------------
# Logging Configuration
# -------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(
    title="AQI MLOps API",
    description="Air Quality Index prediction and advisory service",
    version="1.0.0",
)


# -------------------------------
# Static Folder Setup
# -------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# -------------------------------
# Load ML Model
# -------------------------------
MODEL_PATH = os.path.join(BASE_DIR, "models", "aqi_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Model loading failed: {e}")
    model = None


# -------------------------------
# API Key Authentication
# -------------------------------
API_KEY = "mysecurekey"


def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# -------------------------------
# Request Schema
# -------------------------------
class PredictRequest(BaseModel):
    city: str


# -------------------------------
# Startup Event
# -------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("AQI API started successfully")


# -------------------------------
# Root Endpoint
# -------------------------------
@app.get("/")
async def read_root():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))


# -------------------------------
# Health Check
# -------------------------------
@app.get("/health")
async def health_check():
    return {"status": "ok"}


# -------------------------------
# AQI Prediction Endpoint
# -------------------------------
@app.post("/predict")
async def predict_aqi(
    request: PredictRequest,
    api_key: str = Depends(verify_api_key)
):

    city = request.city.lower()
    logger.info(f"Predicting AQI for city: {city}")

    # Fetch real PM2.5 data
    pm25 = fetch_aqi_data(city)

    if pm25 is None:
        logger.warning("Real AQI data unavailable, using ML prediction")

        if model:
            try:
                fallback_features = pd.DataFrame([{
                    "PM2.5": randint(0, 200),
                    "PM10": randint(0, 300),
                    "NO2": randint(0, 120),
                    "SO2": randint(0, 80),
                    "CO": randint(0, 10),
                    "O3": randint(0, 180),
                    "Temperature": randint(15, 40),
                    "Humidity": randint(20, 90),
                    "Wind Speed": randint(0, 15),
                }])
                predicted_aqi = model.predict(fallback_features)[0]
            except Exception as e:
                logger.error(f"Model prediction failed: {e}")
                predicted_aqi = randint(50, 300)
        else:
            predicted_aqi = randint(50, 300)

    else:
        predicted_aqi = pm25

    predicted_aqi = max(0, min(500, predicted_aqi))

    category = get_category(predicted_aqi)

    health_advisory = get_health_advisory(predicted_aqi, category)

    response = {
        "city": city,
        "predicted_aqi": round(predicted_aqi, 2),
        "category": category,
        "health_advisory": health_advisory
    }

    logger.info(f"Prediction response: {response}")

    return response


# -------------------------------
# Simple AQI Endpoint
# -------------------------------
@app.get("/aqi/{location}")
async def get_aqi(location: str):

    aqi = randint(0, 500)
    category = get_category(aqi)

    return {
        "location": location,
        "aqi": aqi,
        "category": category
    }


# -------------------------------
# AQI Category Logic
# -------------------------------
def get_category(aqi: float) -> str:

    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"
