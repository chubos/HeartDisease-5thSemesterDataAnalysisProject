from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import FEATURES, PatientFeatures, PredictionResponse

MODEL_PATH = Path(__file__).resolve().parents[2] / "ml" / "models" / "heart_model.joblib"

app = FastAPI(title="Heart Disease API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None


def positive_probability(model, row) -> float:
    """Zwraca prawdopodobieństwo klasy 1, czyli obecności choroby."""
    classes = list(model.named_steps["model"].classes_)
    index = classes.index(1)
    return float(model.predict_proba(row)[0, index])


def get_model():
    """Wczytuje wytrenowany Pipeline z pliku i przy kolejnych żądaniach używa kopii z pamięci.

    Po ponownym treningu uruchom serwer jeszcze raz, żeby wczytać nowy plik.
    """
    global _model
    if _model is not None:
        return _model
    if not MODEL_PATH.exists():
        return None
    _model = joblib.load(MODEL_PATH)
    return _model


@app.get("/")
def root():
    """Krótka informacja, że API działa. Dokumentacja jest pod /docs."""
    return {"message": "Heart Disease API", "docs": "/docs"}


@app.get("/health")
def health():
    """Sprawdza, czy serwer żyje i czy plik modelu jest na dysku."""
    return {"status": "ok", "model_ready": MODEL_PATH.exists()}


@app.post("/predict", response_model=PredictionResponse)
def predict(patient: PatientFeatures):
    """Zamienia dane pacjenta na wiersz tabeli i pyta model o klasę oraz prawdopodobieństwo."""
    model = get_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model nie jest jeszcze wytrenowany. Uruchom najpierw ml/train.py.",
        )

    row = pd.DataFrame([patient.model_dump()])[FEATURES]
    disease = bool(model.predict(row)[0])
    probability = positive_probability(model, row)
    return PredictionResponse(heart_disease=disease, probability=round(probability, 4))
