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

const inputClass =
  "w-full border border-line bg-white px-3 py-2 text-ink outline-none focus:border-red";

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

    const patient = {
      age: Number(form.age),
      sex: Number(form.sex),
      cp: Number(form.cp),
      trestbps: Number(form.trestbps),
      chol: Number(form.chol),
      fbs: Number(form.fbs),
      restecg: Number(form.restecg),
      thalach: Number(form.thalach),
      exang: Number(form.exang),
      oldpeak: Number(form.oldpeak),
      slope: Number(form.slope),
      ca: Number(form.ca),
      thal: Number(form.thal),
    };

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
        <p className="text-xs tracking-[0.18em] text-red uppercase">Techniki Analizy Danych</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">Przewidywanie chorób serca</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Wynik modelu służy do nauki i nie jest diagnozą.
        </p>
        <p className="mt-4 text-sm">{status}</p>

        <form onSubmit={handleSubmit} autoComplete="off" className="mt-10 flex flex-col gap-8">
          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="age" className="text-sm font-medium">
                Wiek
              </label>
              <span className="text-xs tracking-wide text-red uppercase">age</span>
            </div>
            <input
              id="age"
              name="age"
              type="number"
              min={1}
              max={120}
              value={form.age}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Liczba lat pacjenta.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                W zbiorze zwykle 29–77 lat. Ryzyko rośnie z wiekiem.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="sex" className="text-sm font-medium">
                Płeć
              </label>
              <span className="text-xs tracking-wide text-red uppercase">sex</span>
            </div>
            <select
              id="sex"
              name="sex"
              value={form.sex}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Wybierz</option>
              <option value="0">Kobieta</option>
              <option value="1">Mężczyzna</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Płeć: 0 to kobieta, 1 to mężczyzna.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Według danych choroba częściej dotyczy mężczyzn.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="cp" className="text-sm font-medium">
                Typ bólu w klatce
              </label>
              <span className="text-xs tracking-wide text-red uppercase">cp</span>
            </div>
            <select id="cp" name="cp" value={form.cp} onChange={handleChange} required className={inputClass}>
              <option value="">Wybierz</option>
              <option value="1">Typowa dławica</option>
              <option value="2">Nietypowa dławica</option>
              <option value="3">Ból niedławicowy</option>
              <option value="4">Bezobjawowy</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Rodzaj bólu w klatce piersiowej. Kody 1–4 są takie jak w pliku UCI.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Brak jednej wartości prawidłowej. Typowa dławica i postać bezobjawowa częściej współwystępują z
                chorobą.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="trestbps" className="text-sm font-medium">
                Ciśnienie spoczynkowe<span className="font-normal text-muted">, mm Hg</span>
              </label>
              <span className="text-xs tracking-wide text-red uppercase">trestbps</span>
            </div>
            <input
              id="trestbps"
              name="trestbps"
              type="number"
              min={1}
              max={300}
              value={form.trestbps}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Skurczowe ciśnienie tętnicze mierzone w spoczynku.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Prawidłowe jest poniżej 120 mm Hg. Od 130 mm Hg mówi się o nadciśnieniu.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="chol" className="text-sm font-medium">
                Cholesterol<span className="font-normal text-muted">, mg/dl</span>
              </label>
              <span className="text-xs tracking-wide text-red uppercase">chol</span>
            </div>
            <input
              id="chol"
              name="chol"
              type="number"
              min={1}
              max={700}
              value={form.chol}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Cholesterol całkowity w surowicy.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Pożądany poziom to poniżej 200 mg/dl. Zakres 200–239 jest graniczny, od 240 wysoki.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="fbs" className="text-sm font-medium">
                Cukier na czczo
              </label>
              <span className="text-xs tracking-wide text-red uppercase">fbs</span>
            </div>
            <select id="fbs" name="fbs" value={form.fbs} onChange={handleChange} required className={inputClass}>
              <option value="">Wybierz</option>
              <option value="0">Nie, do 120 mg/dl</option>
              <option value="1">Tak, powyżej 120 mg/dl</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Czy glukoza na czczo przekracza próg 120 mg/dl użyty w zbiorze.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Prawidłowa glukoza na czczo jest poniżej 100 mg/dl. Od 126 mg/dl rozpoznaje się cukrzycę.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="restecg" className="text-sm font-medium">
                EKG spoczynkowe
              </label>
              <span className="text-xs tracking-wide text-red uppercase">restecg</span>
            </div>
            <select
              id="restecg"
              name="restecg"
              value={form.restecg}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Wybierz</option>
              <option value="0">W normie</option>
              <option value="1">Nieprawidłowość ST-T</option>
              <option value="2">Przerost lewej komory</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Wynik elektrokardiogramu wykonanego w spoczynku.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Zapis bez zmian. Zmiany ST-T i przerost lewej komory są odchyleniami.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="thalach" className="text-sm font-medium">
                Maksymalne tętno<span className="font-normal text-muted">, uderzenia/min</span>
              </label>
              <span className="text-xs tracking-wide text-red uppercase">thalach</span>
            </div>
            <input
              id="thalach"
              name="thalach"
              type="number"
              min={1}
              max={250}
              value={form.thalach}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Najwyższe tętno osiągnięte w próbie wysiłkowej.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Orientacyjne maksimum to około 220 minus wiek. Wyraźnie niższy wynik bywa niekorzystny.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="exang" className="text-sm font-medium">
                Dławica wysiłkowa
              </label>
              <span className="text-xs tracking-wide text-red uppercase">exang</span>
            </div>
            <select
              id="exang"
              name="exang"
              value={form.exang}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Wybierz</option>
              <option value="0">Nie</option>
              <option value="1">Tak</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Czy w czasie wysiłku pojawił się ból dławicowy.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Brak dławicy.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="oldpeak" className="text-sm font-medium">
                Obniżenie ST<span className="font-normal text-muted">, mm</span>
              </label>
              <span className="text-xs tracking-wide text-red uppercase">oldpeak</span>
            </div>
            <input
              id="oldpeak"
              name="oldpeak"
              type="number"
              min={0}
              max={10}
              step="0.1"
              value={form.oldpeak}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              O ile milimetrów odcinek ST obniżył się względem spoczynku.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                0 mm. Od około 1 mm obniżenie jest istotne, powyżej 2 mm wyraźnie nieprawidłowe.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="slope" className="text-sm font-medium">
                Nachylenie ST
              </label>
              <span className="text-xs tracking-wide text-red uppercase">slope</span>
            </div>
            <select
              id="slope"
              name="slope"
              value={form.slope}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">Wybierz</option>
              <option value="1">Wznoszące</option>
              <option value="2">Płaskie</option>
              <option value="3">Opadające</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Kształt odcinka ST w szczycie wysiłku. W pliku UCI kody zaczynają się od 1.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Najłagodniejsze jest nachylenie wznoszące. Płaskie i opadające są niekorzystne.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="ca" className="text-sm font-medium">
                Główne naczynia
              </label>
              <span className="text-xs tracking-wide text-red uppercase">ca</span>
            </div>
            <select id="ca" name="ca" value={form.ca} onChange={handleChange} required className={inputClass}>
              <option value="">Wybierz</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Liczba głównych tętnic wieńcowych ze zwężeniem widocznym we fluoroskopii.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                0 naczyń. Im wyższa liczba, tym rozleglejsza choroba.
              </span>
            </p>
          </div>

          <div className="border-t border-line py-10">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="thal" className="text-sm font-medium">
                Scyntygrafia talowa
              </label>
              <span className="text-xs tracking-wide text-red uppercase">thal</span>
            </div>
            <select id="thal" name="thal" value={form.thal} onChange={handleChange} required className={inputClass}>
              <option value="">Wybierz</option>
              <option value="3">Prawidłowy</option>
              <option value="6">Utrwalony defekt</option>
              <option value="7">Odwracalny defekt</option>
            </select>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Wynik scyntygrafii talowej. W pliku UCI prawidłowy wynik ma kod 3, nie 1.
              <span className="mt-2 block text-ink">
                <span className="text-red">Norma: </span>
                Wynik prawidłowy. Utrwalony albo odwracalny defekt oznacza gorsze ukrwienie.
              </span>
            </p>
          </div>

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
              Prawdopodobieństwo choroby serca: {(result.probability * 100).toFixed(1)}%
            </p>
          </section>
        ) : null}
      </main>
    </>
  );
}

export default App;
