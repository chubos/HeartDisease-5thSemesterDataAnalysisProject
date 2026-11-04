import pandas as pd

cols = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "num",
]

df = pd.read_csv("processed.cleveland.data", header=None, names=cols, na_values="?")
df["target"] = (df["num"] > 0).astype(int)
df.drop(columns="num").to_csv("heart_disease.csv", index=False)
