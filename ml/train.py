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

DATA_PATH = Path(__file__).parent / "data" / "processed.cleveland.data"
MODEL_PATH = Path(__file__).parent / "models" / "heart_model.joblib"
# Plik UCI nie ma nagłówka. Ostatnia kolumna to num (0–4), z niej robimy target.
RAW_COLUMNS = FEATURES + ["num"]


def load_data(path: Path) -> pd.DataFrame:
    """Wczytuje processed.cleveland.data i zamienia diagnozę num na klasy 0 i 1.

    W pliku nie ma nazw kolumn, a braki są zapisane jako znak '?'.
    num równe 0 oznacza brak choroby, wartości 1–4 jej obecność.
    """
    if not path.exists():
        raise FileNotFoundError(
            "Brak pliku ml/data/processed.cleveland.data. "
        )

    frame = pd.read_csv(path, header=None, names=RAW_COLUMNS, na_values="?")
    frame[TARGET] = (frame["num"] > 0).astype(int)
    return frame.drop(columns=["num"])


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
