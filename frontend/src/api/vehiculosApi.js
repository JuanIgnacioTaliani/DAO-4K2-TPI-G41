import axios from "axios";
import { mockVehiculos, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let vehiculosData = [...mockVehiculos];

const mockApi = {
  getVehiculos: async () => {
    await delay();
    return { data: vehiculosData };
  },

  getVehiculoById: async (id) => {
    await delay();
    const veh = vehiculosData.find((v) => v.id_vehiculo === id);
    if (!veh) {
      const err = new Error("Vehículo no encontrado");
      err.response = { data: { detail: "Vehículo no encontrado" } };
      throw err;
    }
    return { data: veh };
  },

  createVehiculo: async (vehiculo) => {
    await delay();
    const nuevoVehiculo = {
      id_vehiculo: generateId(),
      ...vehiculo,
    };
    vehiculosData.push(nuevoVehiculo);
    return { data: nuevoVehiculo };
  },

  updateVehiculo: async (id, vehiculo) => {
    await delay();
    const index = vehiculosData.findIndex((v) => v.id_vehiculo === id);
    if (index === -1) {
      throw new Error("Vehículo no encontrado");
    }
    vehiculosData[index] = { ...vehiculosData[index], ...vehiculo };
    return { data: vehiculosData[index] };
  },

  deleteVehiculo: async (id) => {
    await delay();
    const index = vehiculosData.findIndex((v) => v.id_vehiculo === id);
    if (index === -1) {
      throw new Error("Vehículo no encontrado");
    }
    vehiculosData.splice(index, 1);
    return { data: { message: "Vehículo eliminado" } };
  },
};

// ========== API EXPORTS ==========
export const getVehiculos = (params = {}) =>
  USE_MOCK ? mockApi.getVehiculos() : api.get("/vehiculos/", { params });

export const getVehiculoById = (id) =>
  USE_MOCK ? mockApi.getVehiculoById(id) : api.get(`/vehiculos/${id}`);

export const getVehiculosConDisponibilidad = () =>
  api.get("/vehiculos/disponibilidad/all");

export const createVehiculo = (vehiculo) =>
  USE_MOCK ? mockApi.createVehiculo(vehiculo) : api.post("/vehiculos/", vehiculo);

export const updateVehiculo = (id, vehiculo) =>
  USE_MOCK
    ? mockApi.updateVehiculo(id, vehiculo)
    : api.put(`/vehiculos/${id}`, vehiculo);

export const deleteVehiculo = (id) =>
  USE_MOCK ? mockApi.deleteVehiculo(id) : api.delete(`/vehiculos/${id}`);
