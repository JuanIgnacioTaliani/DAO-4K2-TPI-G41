import axios from "axios";
import modalService from "./modalDialog.service";

const httpService = axios.create({
  headers: { "Content-type": "application/json" },
});

httpService.interceptors.request.use(
  (req) => {
    modalService.BloquearPantalla(true);
    const token = localStorage.getItem("token");
    if (token) req.headers["Authorization"] = `Bearer ${token}`;
    return req;
  },
  (err) => {
    modalService?.BloquearPantalla?.(false);
    return Promise.reject(err);
  }
);

httpService.interceptors.response.use(
  (res) => {
    modalService?.BloquearPantalla?.(false);
    return res;
  },
  (error) => {
    modalService?.BloquearPantalla?.(false);

    const status = error?.response?.status;
    const backendMessage =
      error?.response?.data?.error || error?.response?.data?.message;

    if (status === 401) {
      error.message = backendMessage || "Debe iniciar sesión para continuar.";
    } else if (status === 403) {
      error.message = backendMessage || "No tiene permisos para esta acción.";
    } else if (status >= 400 && status < 500) {
      error.message = backendMessage || "Solicitud inválida.";
    } else {
      error.message =
        backendMessage ||
        "Tenemos inconvenientes en el servidor. Intente más tarde.";
    }
    
    modalService?.Alert?.(error.message);
    return Promise.reject(error);
  }
);

export default httpService;
