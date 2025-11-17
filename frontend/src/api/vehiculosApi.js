import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getVehiculos = () => api.get("/vehiculos/");

export const createVehiculo = (vehiculo) => api.post("/vehiculos/", vehiculo);

export const updateVehiculo = (id, vehiculo) =>
  api.put(`/vehiculos/${id}`, vehiculo);

export const deleteVehiculo = (id) => api.delete(`/vehiculos/${id}`);
