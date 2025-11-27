import axios from "axios";
import { mockMultasDanios, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
let multasDaniosData = [...mockMultasDanios];

const mockApi = {
  getMultasDanios: async (params = {}) => {
    await delay();
    let filtered = [...multasDaniosData];
    
    // Filtrar por id_alquiler
    if (params.id_alquiler) {
      filtered = filtered.filter(m => m.id_alquiler === parseInt(params.id_alquiler));
    }
    
    // Filtrar por tipo (puede ser array)
    if (params.tipo && params.tipo.length > 0) {
      filtered = filtered.filter(m => params.tipo.includes(m.tipo));
    }
    
    // Filtrar por rango de monto
    if (params.monto_desde !== undefined) {
      filtered = filtered.filter(m => parseFloat(m.monto) >= parseFloat(params.monto_desde));
    }
    if (params.monto_hasta !== undefined) {
      filtered = filtered.filter(m => parseFloat(m.monto) <= parseFloat(params.monto_hasta));
    }
    
    // Filtrar por rango de fecha de registro
    if (params.fecha_registro_desde) {
      const desde = new Date(params.fecha_registro_desde);
      filtered = filtered.filter(m => new Date(m.fecha_registro) >= desde);
    }
    if (params.fecha_registro_hasta) {
      const hasta = new Date(params.fecha_registro_hasta);
      hasta.setHours(23, 59, 59, 999); // Incluir el día completo
      filtered = filtered.filter(m => new Date(m.fecha_registro) <= hasta);
    }
    
    // Ordenar por fecha de registro descendente
    filtered.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
    
    return { data: filtered };
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
export const getMultasDanios = (params = {}) =>
  USE_MOCK ? mockApi.getMultasDanios(params) : api.get("/multas-danios/", { params });

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


// GET /multas-danios/{id}
export const getMultaDanioById = (id) =>
  USE_MOCK ? mockApi.getMultaDanioById(id) : api.get(`/multas-danios/${id}`);