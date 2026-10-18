// Lokalnie API stoi na uvicornie. Na Renderzie adres podajesz w VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

function errorMessage(body) {
  if (typeof body?.detail === "string") return body.detail;
  return "Sprawdź, czy wszystkie pola mają poprawne wartości.";
}

export async function fetchHealth() {
  // Pyta API, czy serwer działa i czy plik modelu już istnieje.
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) throw new Error("API nie odpowiada.");
  return response.json();
}

export async function predictHeartDisease(patient) {
  // Wysyła dane pacjenta i zwraca klasę oraz prawdopodobieństwo.
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patient),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(body));
  return body;
}
