"""Trenuje klasyfikator choroby serca i zapisuje go do jednego pliku."""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Ta sama kolejność kolumn jest w backend/app/schemas.py.
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
TARGET = "target"

DATA_PATH = Path(__file__).parent / "data" / "heart.csv"
MODEL_PATH = Path(__file__).parent / "models" / "heart_model.joblib"


def load_data(path: Path) -> pd.DataFrame:
    """Wczytuje CSV i sprawdza, czy są w nim kolumny wymagane przez model."""
    if not path.exists():
        raise FileNotFoundError(
            "Brak pliku ml/data/heart.csv. Pobierz zbiór Heart Disease "
            "(kolumny jak w FEATURES plus target) i zapisz go pod tą ścieżką."
        )

    frame = pd.read_csv(path)
    missing = [column for column in FEATURES + [TARGET] if column not in frame.columns]
    if missing:
        raise ValueError(f"W CSV brakuje kolumn: {', '.join(missing)}")
    return frame


def build_pipeline() -> Pipeline:
    """Składa uzupełnianie braków, skalowanie i klasyfikator w jeden Pipeline.

    Pipeline uczy się tych kroków tylko na danych treningowych. Ten sam obiekt
    później przetwarza pacjenta z formularza, więc preprocessing się nie rozjeżdża.
    Kolumny kategoryczne w tym zbiorze są już liczbami, więc wystarczy jedna ścieżka.
    """
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=1000, random_state=42)),
        ]
    )


def train() -> None:
    """Dzieli dane na trening i test, uczy Pipeline i zapisuje go na dysk."""
    frame = load_data(DATA_PATH)
    x = frame[FEATURES]
    y = frame[TARGET]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()
    pipeline.fit(x_train, y_train)

    predictions = pipeline.predict(x_test)
    print(f"Dokładność na zbiorze testowym: {accuracy_score(y_test, predictions):.3f}")
    print(classification_report(y_test, predictions, digits=3))

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Zapisano model: {MODEL_PATH}")


if __name__ == "__main__":
    train()
