import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// GET /mantenimientos/
export const getMantenimientos = (params = {}) => api.get("/mantenimientos/", { params });

// GET /mantenimientos/{id}
export const getMantenimiento = (id) => api.get(`/mantenimientos/${id}`);

// POST /mantenimientos/
export const createMantenimiento = (mantenimiento) =>
  api.post("/mantenimientos/", mantenimiento);

// PUT /mantenimientos/{id}
export const updateMantenimiento = (id, mantenimiento) =>
  api.put(`/mantenimientos/${id}`, mantenimiento);

// DELETE /mantenimientos/{id}
export const deleteMantenimiento = (id) =>
  api.delete(`/mantenimientos/${id}`);

// GET /mantenimientos/vehiculo/{id_vehiculo}
export const getMantenimientosByVehiculo = (idVehiculo) =>
  api.get(`/mantenimientos/vehiculo/${idVehiculo}`);
