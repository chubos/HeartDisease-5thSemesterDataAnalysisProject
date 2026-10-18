import { useEffect, useState } from "react";
import { fetchHealth, predictHeartDisease } from "./api";

const INITIAL_FORM = {
  age: "",
  sex: "",
  cp: "",
  trestbps: "",
  chol: "",
  fbs: "",
  restecg: "",
  thalach: "",
  exang: "",
  oldpeak: "",
  slope: "",
  ca: "",
  thal: "",
};

// Opis pól formularza. Nazwy zgadzają się z kolumnami w ml/train.py.
const FIELDS = [
  { name: "age", label: "Wiek", type: "number", min: 1, max: 120 },
  {
    name: "sex",
    label: "Płeć",
    type: "select",
    options: [
      ["0", "Kobieta"],
      ["1", "Mężczyzna"],
    ],
  },
  {
    name: "cp",
    label: "Typ bólu w klatce",
    type: "select",
    options: [
      ["0", "Typowa dławica"],
      ["1", "Nietypowa dławica"],
      ["2", "Ból niedławicowy"],
      ["3", "Bezobjawowy"],
    ],
  },
  { name: "trestbps", label: "Ciśnienie spoczynkowe", type: "number", min: 1, max: 300, unit: "mm Hg" },
  { name: "chol", label: "Cholesterol", type: "number", min: 1, max: 700, unit: "mg/dl" },
  {
    name: "fbs",
    label: "Cukier na czczo > 120 mg/dl",
    type: "select",
    options: [
      ["0", "Nie"],
      ["1", "Tak"],
    ],
  },
  {
    name: "restecg",
    label: "EKG spoczynkowe",
    type: "select",
    options: [
      ["0", "W normie"],
      ["1", "Nieprawidłowość ST-T"],
      ["2", "Przerost lewej komory"],
    ],
  },
  { name: "thalach", label: "Maksymalne tętno", type: "number", min: 1, max: 250 },
  {
    name: "exang",
    label: "Dławica wysiłkowa",
    type: "select",
    options: [
      ["0", "Nie"],
      ["1", "Tak"],
    ],
  },
  { name: "oldpeak", label: "Obniżenie ST", type: "number", min: 0, max: 10, step: "0.1" },
  {
    name: "slope",
    label: "Nachylenie ST",
    type: "select",
    options: [
      ["0", "Wznoszące"],
      ["1", "Płaskie"],
      ["2", "Opadające"],
    ],
  },
  {
    name: "ca",
    label: "Liczba głównych naczyń",
    type: "select",
    options: ["0", "1", "2", "3", "4"].map((value) => [value, value]),
  },
  {
    name: "thal",
    label: "Scyntygrafia talowa",
    type: "select",
    options: [
      ["0", "Nieznany"],
      ["1", "Prawidłowy"],
      ["2", "Utrwalony defekt"],
      ["3", "Odwracalny defekt"],
    ],
  },
];

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink outline-none focus:border-brick";

// Rysuje jedno pole formularza: liczbę albo listę wyboru.
function Field({ field, value, onChange }) {
  const id = `field-${field.name}`;

  return (
    <label htmlFor={id} className="block text-sm">
      <span className="font-medium">{field.label}</span>
      <span className="ml-2 text-muted">{field.name}</span>
      {field.type === "select" ? (
        <select id={id} name={field.name} value={value} onChange={onChange} required className={inputClass}>
          <option value="">Wybierz</option>
          {field.options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={field.name}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step ?? "1"}
          value={value}
          onChange={onChange}
          required
          className={inputClass}
        />
      )}
      {field.unit ? <span className="mt-1 block text-xs text-muted">{field.unit}</span> : null}
    </label>
  );
}

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("Sprawdzam połączenie z API…");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Przy starcie strony sprawdza, czy backend i plik modelu są dostępne.
    fetchHealth()
      .then((health) => {
        setStatus(
          health.model_ready
            ? "API działa i model jest gotowy."
            : "API działa. Model jeszcze nie jest wytrenowany.",
        );
      })
      .catch(() => {
        setStatus("API nie działa. Uruchom backend na porcie 8000.");
      });
  }, []);

  function handleChange(event) {
    // Zapisuje w stanie wartość tego pola, które użytkownik właśnie zmienił.
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    // Wysyła formularz jako liczby i pokazuje wynik albo komunikat błędu.
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const patient = Object.fromEntries(
      Object.entries(form).map(([name, value]) => [name, Number(value)]),
    );

    try {
      setResult(await predictHeartDisease(patient));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 font-sans text-ink">
      <p className="text-sm tracking-wide text-brick uppercase">Projekt uczelniany</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">Przewidywanie chorób serca</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Formularz wysyła cechy kliniczne do modelu regresji logistycznej. Wynik służy do nauki i nie jest diagnozą.
      </p>
      <p className="mt-4 text-sm">{status}</p>

      <form onSubmit={handleSubmit} autoComplete="off" className="mt-8 rounded-xl border border-line bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <Field key={field.name} field={field} value={form[field.name]} onChange={handleChange} />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-md bg-brick px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Liczenie…" : "Oceń ryzyko"}
        </button>
      </form>

      {error ? <p className="mt-4 rounded-md border border-brick/30 bg-white px-4 py-3 text-brick">{error}</p> : null}

      {result ? (
        <section className="mt-4 rounded-md border border-line bg-white px-4 py-3">
          <h2 className="font-serif text-2xl">
            {result.heart_disease ? "Model wskazuje chorobę serca" : "Model nie wskazuje choroby serca"}
          </h2>
          <p className="mt-1 text-muted">
            Prawdopodobieństwo klasy „choroba”: {(result.probability * 100).toFixed(1)}%
          </p>
        </section>
      ) : null}
    </main>
  );
}

export default App;
