// src/api/categoriasVehiculoApi.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getCategoriasVehiculo = () => api.get("/categorias-vehiculo/");

export const createCategoriaVehiculo = (categoria) =>
  api.post("/categorias-vehiculo/", categoria);

export const updateCategoriaVehiculo = (id, categoria) =>
  api.put(`/categorias-vehiculo/${id}`, categoria);

export const deleteCategoriaVehiculo = (id) =>
  api.delete(`/categorias-vehiculo/${id}`);
