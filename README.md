# Przewidywanie chorób serca

Projekt uczelniany: klasyfikacja choroby serca na podstawie danych klinicznych.

Trzy foldery, każdy z jedną rolą:

- `ml` — trenuje model i zapisuje go do pliku.
- `backend` — FastAPI wczytuje ten plik i wystawia endpoint `/predict`.
- `frontend` — formularz w React, który wysyła dane pacjenta do API.

Model to `sklearn.pipeline.Pipeline`: uzupełnienie braków, skalowanie i regresja logistyczna. Regresja logistyczna jest celowo prostym pierwszym modelem, bo da się potem opisać jej współczynniki.

## Dane

Potrzebny jest plik `ml/data/heart.csv` z nagłówkiem i kolumnami:

`age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`, `target`

Pasuje oczyszczony zbiór Heart Disease (UCI Cleveland / popularny plik z Kaggle o tych nazwach kolumn). `target` równe `1` oznacza chorobę, `0` jej brak.

## Uruchomienie lokalne

Python 3.12. Jedno środowisko w katalogu głównym obsługuje trening i API.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt -r backend/requirements.txt
```

Trening, gdy plik CSV już leży w `ml/data/`:

```bash
python ml/train.py
```

API (z katalogu głównego repozytorium):

```bash
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Dokumentacja interaktywna: http://127.0.0.1:8000/docs

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Aplikacja: http://127.0.0.1:5173

Po każdym nowym treningu uruchom API ponownie. Serwer trzyma model w pamięci i sam nie podmienia pliku.

## Render

Dwa darmowe serwisy z tego samego repozytorium.

API (Web Service, Python):

- Root Directory: pusty (katalog repozytorium)
- Build: `pip install -r backend/requirements.txt`
- Start: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`

Żeby API umiało odpowiadać, w repozytorium musi być `ml/models/heart_model.joblib`. Trening zostaje na Twoim komputerze, a na Render wjeżdża gotowy plik modelu.

Frontend (Static Site):

- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish directory: `dist`
- Zmienna środowiskowa `VITE_API_URL`: publiczny adres API, bez ukośnika na końcu

Wynik z formularza jest edukacyjny i nie jest diagnozą medyczną.
