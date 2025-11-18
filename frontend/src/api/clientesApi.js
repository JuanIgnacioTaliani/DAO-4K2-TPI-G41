import axios from "axios";
import { mockClientes, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = false;

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let clientesData = [...mockClientes];

const mockApi = {
  getClientes: async () => {
    await delay();
    return { data: clientesData };
  },

  createCliente: async (cliente) => {
    await delay();
    const nuevoCliente = {
      id_cliente: generateId(),
      ...cliente,
    };
    clientesData.push(nuevoCliente);
    return { data: nuevoCliente };
  },

  updateCliente: async (id, cliente) => {
    await delay();
    const index = clientesData.findIndex((c) => c.id_cliente === id);
    if (index === -1) {
      throw new Error("Cliente no encontrado");
    }
    clientesData[index] = { ...clientesData[index], ...cliente };
    return { data: clientesData[index] };
  },

  deleteCliente: async (id) => {
    await delay();
    const index = clientesData.findIndex((c) => c.id_cliente === id);
    if (index === -1) {
      throw new Error("Cliente no encontrado");
    }
    clientesData.splice(index, 1);
    return { data: { message: "Cliente eliminado" } };
  },
};

// ========== API EXPORTS ==========
// GET /clientes/
export const getClientes = (params = {}) =>
  USE_MOCK ? mockApi.getClientes() : api.get("/clientes/", { params });

// POST /clientes/
export const createCliente = (cliente) =>
  USE_MOCK ? mockApi.createCliente(cliente) : api.post("/clientes/", cliente);

// PUT /clientes/{id}
export const updateCliente = (id, cliente) =>
  USE_MOCK
    ? mockApi.updateCliente(id, cliente)
    : api.put(`/clientes/${id}`, cliente);

// DELETE /clientes/{id}
export const deleteCliente = (id) =>
  USE_MOCK ? mockApi.deleteCliente(id) : api.delete(`/clientes/${id}`);
