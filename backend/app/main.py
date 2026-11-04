from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import FEATURES, PatientFeatures, PredictionResponse

MODEL_PATH = Path("ml/models/heart_model.joblib")

app = FastAPI(title="Heart Disease API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None


def get_model():
    """Wczytanie modelu z pliku. W kolejnych żądaniach używa kopii z pamięci."""
    global _model
    if _model is not None:
        return _model
    if not MODEL_PATH.exists():
        return None
    _model = joblib.load(MODEL_PATH)
    return _model


@app.get("/")
def root():
    """Informacja o działaniu API. Dokumentacja Swagger jest pod /docs."""
    return {"message": "Heart Disease API", "docs": "/docs"}


@app.get("/health")
def health():
    """Sprawdza, czy serwer żyje i czy plik modelu jest na dysku."""
    return {"status": "ok", "model_ready": MODEL_PATH.exists()}


@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientFeatures):
    """Zamienia dane pacjenta na wiersz tabeli i zwraca szansę choroby."""
    print("Otrzymany JSON:", patient.model_dump_json())

    model = get_model()
    if model is None:
        raise HTTPException(status_code=503, detail="Model nie jest jeszcze wytrenowany.")

    row = pd.DataFrame([patient.model_dump()])[FEATURES]
    probability = float(model.predict_proba(row)[0, 1])
    return PredictionResponse(heart_disease=probability >= 0.5, probability=round(probability, 4))
