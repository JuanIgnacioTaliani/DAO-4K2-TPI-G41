import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { selectStyles } from "../assets/selectStyles";
import modalDialogService from "../api/modalDialog.service";

import {
  getAlquileres,
  createAlquiler,
  updateAlquiler,
  deleteAlquiler,
} from "../api/alquileresApi";
import { getClientes } from "../api/clientesApi";
import { getVehiculos } from "../api/vehiculosApi";
import { getEmpleados } from "../api/empleadosApi";

const emptyForm = {
  id_cliente: "",
  id_vehiculo: "",
  id_empleado: "",
  id_reserva: "",
  fecha_inicio: "",
  fecha_fin: "",
  costo_base: "",
  costo_total: "",
  estado: "EN_CURSO",
  observaciones: "",
};

export default function AlquilerPage() {
  const { setTitulo } = useOutletContext();
  const [alquileres, setAlquileres] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes, vRes, eRes] = await Promise.all([
        getAlquileres(),
        getClientes(),
        getVehiculos(),
        getEmpleados(),
      ]);
      setAlquileres(aRes.data);
      setClientes(cRes.data);
      setVehiculos(vRes.data);
      setEmpleados(eRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar alquileres / clientes / vehículos / empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Alquileres");
    loadData();
  }, [setTitulo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      id_cliente: form.id_cliente ? parseInt(form.id_cliente, 10) : null,
      id_vehiculo: form.id_vehiculo ? parseInt(form.id_vehiculo, 10) : null,
      id_empleado: form.id_empleado ? parseInt(form.id_empleado, 10) : null,
      id_reserva: form.id_reserva ? parseInt(form.id_reserva, 10) : null,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      costo_base: form.costo_base ? parseFloat(form.costo_base) : null,
      costo_total: form.costo_total ? parseFloat(form.costo_total) : null,
      estado: form.estado || "EN_CURSO",
      observaciones: form.observaciones || null,
    };

    try {
      if (!payload.id_cliente || !payload.id_vehiculo || !payload.id_empleado) {
        setErrorMsg("Debés seleccionar cliente, vehículo y empleado");
        return;
      }

      if (!payload.fecha_inicio || !payload.fecha_fin) {
        setErrorMsg("Debés ingresar fecha de inicio y fin");
        return;
      }

      if (editingId === null) {
        await createAlquiler(payload);
        modalDialogService.Alert("Alquiler creado correctamente");
      } else {
        await updateAlquiler(editingId, payload);
        modalDialogService.Alert("Alquiler actualizado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      modalDialogService.Alert(apiMsg || "Error al guardar el alquiler");
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.id_alquiler);
    setForm({
      id_cliente: a.id_cliente ?? "",
      id_vehiculo: a.id_vehiculo ?? "",
      id_empleado: a.id_empleado ?? "",
      id_reserva: a.id_reserva ?? "",
      fecha_inicio: a.fecha_inicio ?? "",
      fecha_fin: a.fecha_fin ?? "",
      costo_base: a.costo_base ?? "",
      costo_total: a.costo_total ?? "",
      estado: a.estado ?? "EN_CURSO",
      observaciones: a.observaciones ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este Alquiler?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteAlquiler(id);
          await loadData();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar el Alquiler");
        }
      }
    );
  };

  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find((c) => c.id_cliente === id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
  };

  const getVehiculoInfo = (id_vehiculo) => {
    const vehiculo = vehiculos.find((v) => v.id_vehiculo === id_vehiculo);
    return vehiculo ? `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}` : "";
  };

  const getEmpleadoNombre = (id_empleado) => {
    const empleado = empleados.find((e) => e.id_empleado === id_empleado);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : "";
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Formulario */}
        <div className="col-lg-12 col-md-12">
          <div className="card card-primary mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {editingId === null ? "Nuevo alquiler" : "Editar alquiler"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Cliente *</label>
                    <select
                      className="form-control"
                      name="id_cliente"
                      value={form.id_cliente}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {clientes.map((c) => (
                        <option key={c.id_cliente} value={c.id_cliente}>
                          {c.nombre} {c.apellido} - {c.dni}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Vehículo *</label>
                    <select
                      className="form-control"
                      name="id_vehiculo"
                      value={form.id_vehiculo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {vehiculos.map((v) => (
                        <option key={v.id_vehiculo} value={v.id_vehiculo}>
                          {v.patente} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Empleado *</label>
                    <select
                      className="form-control"
                      name="id_empleado"
                      value={form.id_empleado}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {empleados.map((e) => (
                        <option key={e.id_empleado} value={e.id_empleado}>
                          {e.nombre} {e.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Fecha Inicio *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="fecha_inicio"
                      value={form.fecha_inicio}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Fecha Fin *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="fecha_fin"
                      value={form.fecha_fin}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Costo Base *</label>
                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      name="costo_base"
                      value={form.costo_base}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Costo Total *</label>
                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      name="costo_total"
                      value={form.costo_total}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Estado *</label>
                    <select
                      className="form-control"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="EN_CURSO">EN CURSO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">ID Reserva (opcional)</label>
                    <input
                      className="form-control"
                      type="number"
                      name="id_reserva"
                      value={form.id_reserva}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Observaciones</label>
                    <textarea
                      className="form-control"
                      name="observaciones"
                      value={form.observaciones}
                      onChange={handleChange}
                      rows="3"
                      maxLength="300"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 mt-1" role="alert">
                    {errorMsg}
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary">
                    {editingId === null ? "Crear alquiler" : "Guardar cambios"}
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="col-lg-12 col-md-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Listado de Alquileres</h3>
              {loading && (
                <span className="text-muted small d-flex align-items-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Cargando...
                </span>
              )}
            </div>
            <div className="card-body p-0">
              {alquileres.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay alquileres cargados.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Cliente</th>
                        <th>Vehículo</th>
                        <th>Empleado</th>
                        <th style={{ width: "110px" }}>Fecha Inicio</th>
                        <th style={{ width: "110px" }}>Fecha Fin</th>
                        <th style={{ width: "100px" }}>Costo Base</th>
                        <th style={{ width: "100px" }}>Costo Total</th>
                        <th style={{ width: "100px" }}>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alquileres.map((a) => (
                        <tr key={a.id_alquiler}>
                          <td>{a.id_alquiler}</td>
                          <td>{getClienteNombre(a.id_cliente)}</td>
                          <td>{getVehiculoInfo(a.id_vehiculo)}</td>
                          <td>{getEmpleadoNombre(a.id_empleado)}</td>
                          <td>{a.fecha_inicio}</td>
                          <td>{a.fecha_fin}</td>
                          <td>${a.costo_base}</td>
                          <td>${a.costo_total}</td>
                          <td>
                            <span
                              className={`badge ${
                                a.estado === "EN_CURSO"
                                  ? "badge-primary"
                                  : a.estado === "FINALIZADO"
                                  ? "badge-success"
                                  : "badge-danger"
                              }`}
                            >
                              {a.estado}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary mr-1"
                              onClick={() => handleEdit(a)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>{" "}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(a.id_alquiler)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!loading && alquileres.length > 0 && (
              <div className="card-footer text-muted small">
                Total de alquileres: {alquileres.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AlquilerPage };
