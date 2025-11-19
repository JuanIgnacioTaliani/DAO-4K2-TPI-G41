import axios from "axios";
import { mockEstadosVehiculo, delay, generateId } from "./mockData";

// Configuración: cambiar a false para usar API real
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// ========== MOCK IMPLEMENTATION ==========
const estadosData = [...mockEstadosVehiculo];

const mockApi = {
  getEstadosVehiculo: async () => {
    await delay();
    return { data: estadosData };
  },
};

// ========== API EXPORTS ==========
export const getEstadosVehiculo = () =>
  USE_MOCK ? mockApi.getEstadosVehiculo() : api.get("/estados-vehiculo/");
