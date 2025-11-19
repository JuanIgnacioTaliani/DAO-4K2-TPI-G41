import axios from "axios";
import { mockCategoriasVehiculo, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let categoriasData = [...mockCategoriasVehiculo];

const mockApi = {
  getCategorias: async (params = {}) => {
    await delay();
    // Si se pasan filtros, aplicarlos sobre el mock
    let results = [...categoriasData];
    const { nombre, tarifa_desde, tarifa_hasta } = params || {};
    if (nombre) {
      const n = String(nombre).toLowerCase();
      results = results.filter((c) => c.nombre.toLowerCase().includes(n));
    }
    if (tarifa_desde !== undefined && tarifa_desde !== "") {
      const desde = parseFloat(tarifa_desde);
      if (!Number.isNaN(desde)) {
        results = results.filter((c) => parseFloat(c.tarifa_diaria) >= desde);
      }
    }
    if (tarifa_hasta !== undefined && tarifa_hasta !== "") {
      const hasta = parseFloat(tarifa_hasta);
      if (!Number.isNaN(hasta)) {
        results = results.filter((c) => parseFloat(c.tarifa_diaria) <= hasta);
      }
    }
    return { data: results };
  },

  getCategoriaById: async (id) => {
    await delay();
    const cat = categoriasData.find((c) => c.id_categoria === id);
    if (!cat) {
      const err = new Error("Categoria no encontrada");
      err.response = { data: { detail: "Categoria no encontrada" } };
      throw err;
    }
    return { data: cat };
  },

  createCategoria: async (categoria) => {
    await delay();
    const nueva = { id_categoria: generateId(), ...categoria };
    categoriasData.push(nueva);
    return { data: nueva };
  },

  updateCategoria: async (id, categoria) => {
    await delay();
    const index = categoriasData.findIndex((c) => c.id_categoria === id);
    if (index === -1) {
      throw new Error("Categoria no encontrada");
    }
    categoriasData[index] = { ...categoriasData[index], ...categoria };
    return { data: categoriasData[index] };
  },

  deleteCategoria: async (id) => {
    await delay();
    const index = categoriasData.findIndex((c) => c.id_categoria === id);
    if (index === -1) {
      throw new Error("Categoria no encontrada");
    }
    categoriasData.splice(index, 1);
    return { data: { message: "Categoria eliminada" } };
  },
};

// ========== API EXPORTS ==========
export const getCategorias = (params = {}) =>
  USE_MOCK ? mockApi.getCategorias() : api.get("/categorias-vehiculo/", { params });

export const getCategoriaById = (id) =>
  USE_MOCK ? mockApi.getCategoriaById(id) : api.get(`/categorias-vehiculo/${id}`);

export const createCategoria = (categoria) =>
  USE_MOCK ? mockApi.createCategoria(categoria) : api.post("/categorias-vehiculo/", categoria);

export const updateCategoria = (id, categoria) =>
  USE_MOCK ? mockApi.updateCategoria(id, categoria) : api.put(`/categorias-vehiculo/${id}`, categoria);

export const deleteCategoria = (id) =>
  USE_MOCK ? mockApi.deleteCategoria(id) : api.delete(`/categorias-vehiculo/${id}`);
