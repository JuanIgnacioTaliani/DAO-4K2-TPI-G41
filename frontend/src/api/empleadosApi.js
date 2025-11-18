import axios from "axios";
import { mockEmpleados, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = false;

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let empleadosData = [...mockEmpleados];

const mockApi = {
  getEmpleados: async () => {
    await delay();
    return { data: empleadosData };
  },

  createEmpleado: async (empleado) => {
    await delay();
    const nuevoEmpleado = {
      id_empleado: generateId(),
      ...empleado,
    };
    empleadosData.push(nuevoEmpleado);
    return { data: nuevoEmpleado };
  },

  updateEmpleado: async (id, empleado) => {
    await delay();
    const index = empleadosData.findIndex((e) => e.id_empleado === id);
    if (index === -1) {
      throw new Error("Empleado no encontrado");
    }
    empleadosData[index] = { ...empleadosData[index], ...empleado };
    return { data: empleadosData[index] };
  },

  deleteEmpleado: async (id) => {
    await delay();
    const index = empleadosData.findIndex((e) => e.id_empleado === id);
    if (index === -1) {
      throw new Error("Empleado no encontrado");
    }
    empleadosData.splice(index, 1);
    return { data: { message: "Empleado eliminado" } };
  },
};

// ========== API EXPORTS ==========
export const getEmpleados = (params = {}) =>
  USE_MOCK ? mockApi.getEmpleados() : api.get("/empleados/", { params });

export const createEmpleado = (empleado) =>
  USE_MOCK ? mockApi.createEmpleado(empleado) : api.post("/empleados/", empleado);

export const updateEmpleado = (id, empleado) =>
  USE_MOCK
    ? mockApi.updateEmpleado(id, empleado)
    : api.put(`/empleados/${id}`, empleado);

export const deleteEmpleado = (id) =>
  USE_MOCK ? mockApi.deleteEmpleado(id) : api.delete(`/empleados/${id}`);
