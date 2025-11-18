import axios from "axios";
import { mockMultasDanios, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = false;

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let multasDaniosData = [...mockMultasDanios];

const mockApi = {
  getMultasDanios: async () => {
    await delay();
    return { data: multasDaniosData };
  },

  getMultasDaniosByAlquiler: async (idAlquiler) => {
    await delay();
    const multas = multasDaniosData.filter(
      (m) => m.id_alquiler === parseInt(idAlquiler)
    );
    return { data: multas };
  },

  createMultaDanio: async (multaDanio) => {
    await delay();
    const nuevaMultaDanio = {
      id_multa_danio: generateId(),
      fecha_registro: new Date().toISOString(),
      ...multaDanio,
    };
    multasDaniosData.push(nuevaMultaDanio);
    return { data: nuevaMultaDanio };
  },

  updateMultaDanio: async (id, multaDanio) => {
    await delay();
    const index = multasDaniosData.findIndex((m) => m.id_multa_danio === id);
    if (index === -1) {
      throw new Error("Multa/Daño no encontrado");
    }
    multasDaniosData[index] = { ...multasDaniosData[index], ...multaDanio };
    return { data: multasDaniosData[index] };
  },

  deleteMultaDanio: async (id) => {
    await delay();
    const index = multasDaniosData.findIndex((m) => m.id_multa_danio === id);
    if (index === -1) {
      throw new Error("Multa/Daño no encontrado");
    }
    multasDaniosData.splice(index, 1);
    return { data: { message: "Multa/Daño eliminado" } };
  },
};

// ========== API EXPORTS ==========
// GET /multas-danios/
export const getMultasDanios = () =>
  USE_MOCK ? mockApi.getMultasDanios() : api.get("/multas-danios/");

// GET /multas-danios/alquiler/{id_alquiler}
export const getMultasDaniosByAlquiler = (idAlquiler) =>
  USE_MOCK
    ? mockApi.getMultasDaniosByAlquiler(idAlquiler)
    : api.get(`/multas-danios/alquiler/${idAlquiler}`);

// POST /multas-danios/
export const createMultaDanio = (multaDanio) =>
  USE_MOCK
    ? mockApi.createMultaDanio(multaDanio)
    : api.post("/multas-danios/", multaDanio);

// PUT /multas-danios/{id}
export const updateMultaDanio = (id, multaDanio) =>
  USE_MOCK
    ? mockApi.updateMultaDanio(id, multaDanio)
    : api.put(`/multas-danios/${id}`, multaDanio);

// DELETE /multas-danios/{id}
export const deleteMultaDanio = (id) =>
  USE_MOCK ? mockApi.deleteMultaDanio(id) : api.delete(`/multas-danios/${id}`);
