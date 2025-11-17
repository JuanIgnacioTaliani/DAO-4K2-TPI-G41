import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export const getEmpleados = () => api.get("/empleados/");

export const createEmpleado = (empleado) => api.post("/empleados/", empleado);

export const updateEmpleado = (id, empleado) =>
  api.put(`/empleados/${id}`, empleado);

export const deleteEmpleado = (id) => api.delete(`/empleados/${id}`);
