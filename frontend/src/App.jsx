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
  {
    name: "age",
    label: "Wiek",
    type: "number",
    min: 1,
    max: 120,
    about: "Liczba lat pacjenta.",
    norm: "W zbiorze zwykle 29–77 lat. Osobnej normy laboratoryjnej nie ma; ryzyko rośnie z wiekiem.",
  },
  {
    name: "sex",
    label: "Płeć",
    type: "select",
    about: "Płeć zapisana kodem zbioru: 0 to kobieta, 1 to mężczyzna.",
    norm: "To cecha, nie wynik badania. W tych danych choroba częściej dotyczy mężczyzn.",
    options: [
      ["0", "Kobieta"],
      ["1", "Mężczyzna"],
    ],
  },
  {
    name: "cp",
    label: "Typ bólu w klatce",
    type: "select",
    about: "Rodzaj bólu w klatce piersiowej zgłoszony przy przyjęciu.",
    norm: "Brak jednej wartości prawidłowej. Typowa dławica i postać bezobjawowa częściej współwystępują z chorobą.",
    options: [
      ["0", "Typowa dławica"],
      ["1", "Nietypowa dławica"],
      ["2", "Ból niedławicowy"],
      ["3", "Bezobjawowy"],
    ],
  },
  {
    name: "trestbps",
    label: "Ciśnienie spoczynkowe",
    unit: "mm Hg",
    type: "number",
    min: 1,
    max: 300,
    about: "Skurczowe ciśnienie tętnicze mierzone w spoczynku.",
    norm: "Prawidłowe jest poniżej 120 mm Hg. Od 130 mm Hg mówi się o nadciśnieniu.",
  },
  {
    name: "chol",
    label: "Cholesterol",
    unit: "mg/dl",
    type: "number",
    min: 1,
    max: 700,
    about: "Cholesterol całkowity w surowicy.",
    norm: "Pożądany poziom to poniżej 200 mg/dl. Zakres 200–239 jest graniczny, od 240 wysoki.",
  },
  {
    name: "fbs",
    label: "Cukier na czczo",
    type: "select",
    about: "Czy glukoza na czczo przekracza próg 120 mg/dl użyty w zbiorze.",
    norm: "Prawidłowa glukoza na czczo jest poniżej 100 mg/dl. Od 126 mg/dl rozpoznaje się cukrzycę.",
    options: [
      ["0", "Nie, do 120 mg/dl"],
      ["1", "Tak, powyżej 120 mg/dl"],
    ],
  },
  {
    name: "restecg",
    label: "EKG spoczynkowe",
    type: "select",
    about: "Wynik elektrokardiogramu wykonanego w spoczynku.",
    norm: "Zapis bez zmian. Zmiany ST-T i przerost lewej komory są odchyleniami.",
    options: [
      ["0", "W normie"],
      ["1", "Nieprawidłowość ST-T"],
      ["2", "Przerost lewej komory"],
    ],
  },
  {
    name: "thalach",
    label: "Maksymalne tętno",
    unit: "uderzenia/min",
    type: "number",
    min: 1,
    max: 250,
    about: "Najwyższe tętno osiągnięte w próbie wysiłkowej.",
    norm: "Orientacyjne maksimum to około 220 minus wiek. Wyraźnie niższy wynik bywa niekorzystny.",
  },
  {
    name: "exang",
    label: "Dławica wysiłkowa",
    type: "select",
    about: "Czy w czasie wysiłku pojawił się ból dławicowy.",
    norm: "Brak dławicy.",
    options: [
      ["0", "Nie"],
      ["1", "Tak"],
    ],
  },
  {
    name: "oldpeak",
    label: "Obniżenie ST",
    unit: "mm",
    type: "number",
    min: 0,
    max: 10,
    step: "0.1",
    about: "O ile milimetrów odcinek ST obniżył się względem spoczynku.",
    norm: "0 mm. Od około 1 mm obniżenie jest istotne, powyżej 2 mm wyraźnie nieprawidłowe.",
  },
  {
    name: "slope",
    label: "Nachylenie ST",
    type: "select",
    about: "Kształt odcinka ST w szczycie wysiłku.",
    norm: "Najłagodniejsze jest nachylenie wznoszące. Płaskie i opadające są niekorzystne.",
    options: [
      ["0", "Wznoszące"],
      ["1", "Płaskie"],
      ["2", "Opadające"],
    ],
  },
  {
    name: "ca",
    label: "Główne naczynia",
    type: "select",
    about: "Liczba głównych tętnic wieńcowych ze zwężeniem widocznym we fluoroskopii.",
    norm: "0 naczyń. Im wyższa liczba, tym rozleglejsza choroba. Wartość 4 zwykle oznacza brak danych.",
    options: ["0", "1", "2", "3", "4"].map((value) => [value, value]),
  },
  {
    name: "thal",
    label: "Scyntygrafia talowa",
    type: "select",
    about: "Wynik badania ukrwienia mięśnia sercowego z użyciem talu.",
    norm: "Wynik prawidłowy. Utrwalony albo odwracalny defekt oznacza gorsze ukrwienie.",
    options: [
      ["0", "Nieznany"],
      ["1", "Prawidłowy"],
      ["2", "Utrwalony defekt"],
      ["3", "Odwracalny defekt"],
    ],
  },
];

const inputClass =
  "w-full border border-line bg-white px-3 py-2 text-ink outline-none focus:border-red";

// Rysuje jedno pole formularza razem z opisem parametru i jego normą.
function Field({ field, value, onChange }) {
  const id = `field-${field.name}`;
  const hintId = `${id}-hint`;

  return (
    <div className="border-t border-line py-10">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium">
          {field.label}
          {field.unit ? <span className="font-normal text-muted">, {field.unit}</span> : null}
        </label>
        <span className="text-xs tracking-wide text-red uppercase">{field.name}</span>
      </div>
      {field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          value={value}
          onChange={onChange}
          required
          aria-describedby={hintId}
          className={inputClass}
        >
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
          aria-describedby={hintId}
          className={inputClass}
        />
      )}
      <p id={hintId} className="mt-4 text-sm leading-relaxed text-muted">
        {field.about}
        <span className="mt-2 block text-ink">
          <span className="text-red">Norma. </span>
          {field.norm}
        </span>
      </p>
    </div>
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
    <>
      <div className="h-1 bg-red" />
      <main className="mx-auto min-h-screen max-w-xl px-5 py-12 text-ink">
        <p className="text-xs tracking-[0.18em] text-red uppercase">Projekt uczelniany</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Przewidywanie chorób serca</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Każdy parametr ma krótki opis i orientacyjną normę. Wynik modelu służy do nauki i nie jest diagnozą.
        </p>
        <p className="mt-4 text-sm">{status}</p>

        <form onSubmit={handleSubmit} autoComplete="off" className="mt-10 flex flex-col gap-8">
          {FIELDS.map((field) => (
            <Field key={field.name} field={field} value={form[field.name]} onChange={handleChange} />
          ))}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-red px-5 py-2.5 text-sm text-white disabled:opacity-60"
          >
            {loading ? "Liczenie…" : "Oceń ryzyko"}
          </button>
        </form>

        {error ? <p className="mt-6 border-l-2 border-red pl-3 text-sm text-red">{error}</p> : null}

        {result ? (
          <section className="mt-6 border-l-2 border-red pl-3">
            <h2 className="text-lg font-medium">
              {result.heart_disease ? "Model wskazuje chorobę serca" : "Model nie wskazuje choroby serca"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Prawdopodobieństwo klasy „choroba”: {(result.probability * 100).toFixed(1)}%
            </p>
          </section>
        ) : null}
      </main>
    </>
  );
}

export default App;
