from typing import Literal

from pydantic import BaseModel, Field

# Ta sama kolejność kolumn jest w ml/train.py (lista FEATURES).
FEATURES = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]


class PatientFeatures(BaseModel):
    """Dane jednego pacjenta, które model dostaje na wejściu."""

    age: int = Field(ge=1, le=120)
    sex: int = Field(ge=0, le=1)
    cp: Literal[1, 2, 3, 4]
    trestbps: int = Field(ge=1, le=300)
    chol: int = Field(ge=1, le=700)
    fbs: int = Field(ge=0, le=1)
    restecg: int = Field(ge=0, le=2)
    thalach: int = Field(ge=1, le=250)
    exang: int = Field(ge=0, le=1)
    oldpeak: float = Field(ge=0, le=10)
    slope: Literal[1, 2, 3]
    ca: int = Field(ge=0, le=3)
    thal: Literal[3, 6, 7]


class PredictionResponse(BaseModel):
    """Wynik klasyfikacji zwracany do frontendu."""

    heart_disease: bool
    probability: float
