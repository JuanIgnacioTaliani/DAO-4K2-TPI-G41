// src/api/categoriasVehiculoApi.js
import axios from "axios";
import { mockCategoriasVehiculo, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = true;

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let categoriasData = [...mockCategoriasVehiculo];

const mockApi = {
  getCategoriasVehiculo: async () => {
    await delay();
    return { data: categoriasData };
  },

  createCategoriaVehiculo: async (categoria) => {
    await delay();
    const nuevaCategoria = {
      id_categoria: generateId(),
      ...categoria,
    };
    categoriasData.push(nuevaCategoria);
    return { data: nuevaCategoria };
  },

  updateCategoriaVehiculo: async (id, categoria) => {
    await delay();
    const index = categoriasData.findIndex((c) => c.id_categoria === id);
    if (index === -1) {
      throw new Error("Categoría no encontrada");
    }
    categoriasData[index] = { ...categoriasData[index], ...categoria };
    return { data: categoriasData[index] };
  },

  deleteCategoriaVehiculo: async (id) => {
    await delay();
    const index = categoriasData.findIndex((c) => c.id_categoria === id);
    if (index === -1) {
      throw new Error("Categoría no encontrada");
    }
    categoriasData.splice(index, 1);
    return { data: { message: "Categoría eliminada" } };
  },
};

// ========== API EXPORTS ==========
export const getCategoriasVehiculo = () =>
  USE_MOCK ? mockApi.getCategoriasVehiculo() : api.get("/categorias-vehiculo/");

export const createCategoriaVehiculo = (categoria) =>
  USE_MOCK
    ? mockApi.createCategoriaVehiculo(categoria)
    : api.post("/categorias-vehiculo/", categoria);

export const updateCategoriaVehiculo = (id, categoria) =>
  USE_MOCK
    ? mockApi.updateCategoriaVehiculo(id, categoria)
    : api.put(`/categorias-vehiculo/${id}`, categoria);

export const deleteCategoriaVehiculo = (id) =>
  USE_MOCK
    ? mockApi.deleteCategoriaVehiculo(id)
    : api.delete(`/categorias-vehiculo/${id}`);
