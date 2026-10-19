# Przewidywanie wystąpienia chorób serca

Klasyfikacja choroby serca na podstawie danych klinicznych.

Podział projektu:

- `ml` — trenowanie modelu i zapis do pliku.
- `backend` — FastAPI - endpoint `/predict`.
- `frontend` — formularz w React, który wysyła dane pacjenta do API.

Model to `sklearn.pipeline.Pipeline`: uzupełnienie braków, skalowanie i regresja logistyczna.

## Dane

Pipeline przetwarza `ml/data/processed.cleveland.data` z archiwum UCI. Są to 303 wiersze i 14 kolumn, bez nagłówka. Braki są zapisane jako `?`.

Ostatnia kolumna `num` ma wartości 0–4. W `load_data` powstaje z niej `target`: 0 zostaje brakiem choroby, a 1–4 stają się jedną klasą „choroba”.

## Uruchomienie lokalne

Python 3.12. Jedno środowisko w katalogu głównym obsługuje trening i API.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt -r backend/requirements.txt
```

Trening:

```bash
python ml/train.py
```

API (z katalogu głównego repozytorium):

```bash
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Dokumentacja Swagger: http://127.0.0.1:8000/docs

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Aplikacja: http://127.0.0.1:5174

## Render

Dwa darmowe serwisy z tego samego repozytorium.

API (Web Service, Python):

- Root Directory: pusty (katalog repozytorium)
- Build: `pip install -r backend/requirements.txt`
- Start: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`

W repozytorium musi się znajdować `ml/models/heart_model.joblib`. Na Render zostaje wysłany gotowy plik modelu.

Frontend (Static Site):

- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish directory: `dist`
- Zmienna środowiskowa `VITE_API_URL`: publiczny adres API, bez ukośnika na końcu

Wynik z formularza powstaje jedynie w celach edukacyjnych i nie jest diagnozą medyczną.
