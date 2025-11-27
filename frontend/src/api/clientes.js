const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function get(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

export function fetchClientesSuggest(query, limit = 3) {
  return get("/clientes/suggest", { query, limit });
}

export function fetchClienteById(id) {
  if (id === undefined || id === null || id === "")
    return Promise.resolve(null);
  return get(`/clientes/${id}`);
}

export default { fetchClientesSuggest, fetchClienteById };
