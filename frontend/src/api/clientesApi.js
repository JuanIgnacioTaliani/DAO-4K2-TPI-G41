import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// GET /clientes/
export const getClientes = () => api.get("/clientes/");

// POST /clientes/
export const createCliente = (cliente) => api.post("/clientes/", cliente);

// PUT /clientes/{id}
export const updateCliente = (id, cliente) =>
  api.put(`/clientes/${id}`, cliente);

// DELETE /clientes/{id}
export const deleteCliente = (id) => api.delete(`/clientes/${id}`);
