# Transformacje: Cleveland → heart_disease.csv

Źródło: `processed.cleveland.data` z UCI Heart Disease (303 wiersze, 14 kolumn, bez nagłówka, separator `,`).

1. **Nagłówek** — dodane nazwy kolumn:  
   `age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal, target`
2. **Braki** — wartości `?` (głównie w `ca` i `thal`) zamienione na puste / `NaN` (pipeline uzupełnia medianą).
3. **Target** — kolumna `num`:  
   `0` → brak choroby (`0`),  
   `1–4` → choroba (`1`).
