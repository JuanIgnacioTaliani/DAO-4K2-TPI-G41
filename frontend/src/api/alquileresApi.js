import axios from "axios";
import {
  mockAlquileres,
  mockClientes,
  mockVehiculos,
  mockEmpleados,
  delay,
  generateId,
} from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = false;

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let alquileresData = [...mockAlquileres];

const mockApi = {
  getAlquileres: async (_params) => {
    await delay();
    // opcional: aplicar filtros en MOCK si se requiere
    return { data: alquileresData };
  },

  createAlquiler: async (alquiler) => {
    await delay();
    const nuevoAlquiler = {
      id_alquiler: generateId(),
      ...alquiler,
    };
    alquileresData.push(nuevoAlquiler);
    return { data: nuevoAlquiler };
  },

  updateAlquiler: async (id, alquiler) => {
    await delay();
    const index = alquileresData.findIndex((a) => a.id_alquiler === id);
    if (index === -1) {
      throw new Error("Alquiler no encontrado");
    }
    alquileresData[index] = { ...alquileresData[index], ...alquiler };
    return { data: alquileresData[index] };
  },

  deleteAlquiler: async (id) => {
    await delay();
    const index = alquileresData.findIndex((a) => a.id_alquiler === id);
    if (index === -1) {
      throw new Error("Alquiler no encontrado");
    }
    alquileresData.splice(index, 1);
    return { data: { message: "Alquiler eliminado" } };
  },
};

// ========== API EXPORTS ==========
// GET /alquileres/
export const getAlquileres = (params) =>
  USE_MOCK ? mockApi.getAlquileres(params) : api.get("/alquileres/", { params });

// GET /alquileres/{id}
export const getAlquiler = (id) => api.get(`/alquileres/${id}`);

// POST /alquileres/
export const createAlquiler = (alquiler) =>
  USE_MOCK ? mockApi.createAlquiler(alquiler) : api.post("/alquileres/", alquiler);

// PUT /alquileres/{id}
export const updateAlquiler = (id, alquiler) =>
  USE_MOCK
    ? mockApi.updateAlquiler(id, alquiler)
    : api.put(`/alquileres/${id}`, alquiler);

// DELETE /alquileres/{id}
export const deleteAlquiler = (id) =>
  USE_MOCK ? mockApi.deleteAlquiler(id) : api.delete(`/alquileres/${id}`);

// GET /alquileres/verificar-disponibilidad/{id_vehiculo}
export const verificarDisponibilidad = (idVehiculo, fechaInicio, fechaFin) =>
  api.get(`/alquileres/verificar-disponibilidad/${idVehiculo}`, {
    params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
  });

// GET /alquileres/vehiculo/{id_vehiculo}/ocupacion
export const getOcupacionVehiculo = (idVehiculo) =>
  api.get(`/alquileres/vehiculo/${idVehiculo}/ocupacion`);

// PUT /alquileres/{id}/checkout
export const realizarCheckout = (id, checkoutData) =>
  api.put(`/alquileres/${id}/checkout`, checkoutData);

// PUT /alquileres/{id}/cancelar
export const cancelarAlquiler = (id, datoCancelacion) =>
  api.put(`/alquileres/${id}/cancelar`, datoCancelacion);
