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

export function fetchAlquileresPorCliente({
  client_id,
  page = 1,
  size = 10,
  desde,
  hasta,
}) {
  return get("/reports/alquileres-por-cliente", {
    client_id,
    page,
    size,
    desde,
    hasta,
  });
}

export function fetchVehiculosMasAlquilados({ desde, hasta, limit = 10 }) {
  return get("/reports/vehiculos-mas-alquilados", { desde, hasta, limit });
}

export function fetchAlquileresPorPeriodo({ periodo = "mes", desde, hasta }) {
  return get("/reports/alquileres-por-periodo", { periodo, desde, hasta });
}

export function fetchFacturacionMensual({ anio }) {
  return get("/reports/facturacion-mensual", { anio });
}
