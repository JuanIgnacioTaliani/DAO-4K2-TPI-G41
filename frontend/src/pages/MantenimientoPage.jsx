import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import modalDialogService from "../api/modalDialog.service";

import {
  getMantenimientos,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento,
} from "../api/mantenimientosApi";
import { getVehiculosConDisponibilidad } from "../api/vehiculosApi";
import { getEmpleados } from "../api/empleadosApi";

const emptyForm = {
  id_vehiculo: "",
  fecha_inicio: "",
  fecha_fin: "",
  tipo: "",
  descripcion: "",
  costo: "",
  id_empleado: "",
};

export default function MantenimientoPage() {
  const { setTitulo } = useOutletContext();

  const [mantenimientos, setMantenimientos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filtros
  const [filtroVehiculo, setFiltroVehiculo] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(""); // en_curso, finalizado, todos

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, vRes, eRes] = await Promise.all([
        getMantenimientos(),
        getVehiculosConDisponibilidad(),
        getEmpleados(),
      ]);
      setMantenimientos(mRes.data);
      setVehiculos(vRes.data);
      setEmpleados(eRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar mantenimientos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Mantenimientos");
    loadData();
  }, [setTitulo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const payload = {
        id_vehiculo: form.id_vehiculo ? parseInt(form.id_vehiculo, 10) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        tipo: form.tipo || null,
        descripcion: form.descripcion || null,
        costo: form.costo ? parseFloat(form.costo) : null,
        id_empleado: form.id_empleado ? parseInt(form.id_empleado, 10) : null,
      };

      if (!payload.id_vehiculo || !payload.fecha_inicio) {
        setErrorMsg("Vehículo y Fecha de inicio son obligatorios");
        return;
      }

      if (editingId === null) {
        await createMantenimiento(payload);
        modalDialogService.success("Mantenimiento creado exitosamente");
      } else {
        await updateMantenimiento(editingId, payload);
        modalDialogService.success("Mantenimiento actualizado exitosamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      const errorDetail = err.response?.data?.detail || "Error al guardar mantenimiento";
      setErrorMsg(errorDetail);
      modalDialogService.error(errorDetail);
    }
  };

  const handleEdit = (m) => {
    setForm({
      id_vehiculo: m.id_vehiculo ?? "",
      fecha_inicio: m.fecha_inicio ?? "",
      fecha_fin: m.fecha_fin ?? "",
      tipo: m.tipo ?? "",
      descripcion: m.descripcion ?? "",
      costo: m.costo ?? "",
      id_empleado: m.id_empleado ?? "",
    });
    setEditingId(m.id_mantenimiento);
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmado = await modalDialogService.Confirm(
      "¿Está seguro de eliminar este mantenimiento?"
    );
    if (!confirmado) return;

    try {
      await deleteMantenimiento(id);
      modalDialogService.success("Mantenimiento eliminado");
      await loadData();
    } catch (err) {
      console.error(err);
      const errorDetail = err.response?.data?.detail || "Error al eliminar";
      modalDialogService.error(errorDetail);
    }
  };

  const handleCancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrorMsg("");
  };

  const getVehiculoInfo = (id_vehiculo) => {
    const vehiculo = vehiculos.find((v) => v.id_vehiculo === id_vehiculo);
    return vehiculo
      ? `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})`
      : `ID: ${id_vehiculo}`;
  };

  const getEmpleadoNombre = (id_empleado) => {
    const empleado = empleados.find((e) => e.id_empleado === id_empleado);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : "-";
  };

  const getEstadoMantenimiento = (fecha_inicio, fecha_fin) => {
    if (!fecha_fin) return "En Curso";
    const hoy = new Date();
    const fin = new Date(fecha_fin);
    return fin < hoy ? "Finalizado" : "En Curso";
  };

  const getBadgeEstado = (fecha_inicio, fecha_fin) => {
    const estado = getEstadoMantenimiento(fecha_inicio, fecha_fin);
    const clase = estado === "En Curso" ? "badge-warning" : "badge-success";
    return <span className={`badge ${clase}`}>{estado}</span>;
  };

  // Filtrar mantenimientos
  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    if (filtroVehiculo && m.id_vehiculo !== parseInt(filtroVehiculo)) return false;
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    if (filtroEstado) {
      const estado = getEstadoMantenimiento(m.fecha_inicio, m.fecha_fin);
      if (filtroEstado === "en_curso" && estado !== "En Curso") return false;
      if (filtroEstado === "finalizado" && estado !== "Finalizado") return false;
    }
    return true;
  });

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Formulario */}
        <div className="col-lg-12 col-md-12">
          <div className="card card-primary mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {editingId === null ? "Nuevo mantenimiento" : "Editar mantenimiento"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="alert alert-danger alert-dismissible">
                    <button
                      type="button"
                      className="close"
                      onClick={() => setErrorMsg("")}
                    >
                      ×
                    </button>
                    {errorMsg}
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="id_vehiculo">
                        Vehículo <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="id_vehiculo"
                        name="id_vehiculo"
                        value={form.id_vehiculo}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione un vehículo</option>
                        {vehiculos.map((v) => (
                          <option
                            key={v.id_vehiculo}
                            value={v.id_vehiculo}
                            disabled={v.estado_disponibilidad === "Ocupado" || v.estado_disponibilidad === "En Mantenimiento"}
                          >
                            {v.marca} {v.modelo} ({v.patente}) - {v.km_actual} km
                            {" "}
                            {v.estado_disponibilidad && v.estado_disponibilidad !== "Disponible"
                              ? ` - ${v.estado_disponibilidad}`
                              : ""}
                          </option>
                        ))}
                      </select>
                      <small className="form-text text-muted">
                        Solo se puede crear mantenimiento si el vehículo no está en curso/checkout. Si el vehículo tiene reservas futuras, el mantenimiento debe finalizar antes del inicio del alquiler; de lo contrario, la reserva será cancelada automáticamente.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="id_empleado">Responsable</label>
                      <select
                        className="form-control"
                        id="id_empleado"
                        name="id_empleado"
                        value={form.id_empleado}
                        onChange={handleChange}
                      >
                        <option value="">Sin asignar</option>
                        {empleados.map((e) => (
                          <option key={e.id_empleado} value={e.id_empleado}>
                            {e.nombre} {e.apellido} - {e.cargo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fecha_inicio">
                        Fecha Inicio <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="fecha_inicio"
                        name="fecha_inicio"
                        value={form.fecha_inicio}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="fecha_fin">Fecha Fin Estimada</label>
                      <input
                        type="date"
                        className="form-control"
                        id="fecha_fin"
                        name="fecha_fin"
                        value={form.fecha_fin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="tipo">Tipo</label>
                      <select
                        className="form-control"
                        id="tipo"
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                      >
                        <option value="">Seleccione tipo</option>
                        <option value="preventivo">Preventivo</option>
                        <option value="correctivo">Correctivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-8">
                    <div className="form-group">
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        className="form-control"
                        id="descripcion"
                        name="descripcion"
                        rows="3"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción del mantenimiento"
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="costo">Costo</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        id="costo"
                        name="costo"
                        value={form.costo}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary">
                    {editingId === null ? "Crear mantenimiento" : "Guardar cambios"}
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
              <h3 className="card-title mb-0">Listado de Mantenimientos</h3>
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

            {/* Filtros */}
            <div className="card-body border-bottom">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="filtroVehiculo" className="small">
                      <i className="fa fa-car mr-1"></i>Filtrar por Vehículo
                    </label>
                    <select
                      className="form-control form-control-sm"
                      id="filtroVehiculo"
                      value={filtroVehiculo}
                      onChange={(e) => setFiltroVehiculo(e.target.value)}
                    >
                      <option value="">Todos los vehículos</option>
                      {vehiculos.map((v) => (
                        <option key={v.id_vehiculo} value={v.id_vehiculo}>
                          {v.marca} {v.modelo} ({v.patente})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="filtroTipo" className="small">
                      <i className="fa fa-wrench mr-1"></i>Filtrar por Tipo
                    </label>
                    <select
                      className="form-control form-control-sm"
                      id="filtroTipo"
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="">Todos los tipos</option>
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group mb-0">
                    <label htmlFor="filtroEstado" className="small">
                      <i className="fa fa-filter mr-1"></i>Filtrar por Estado
                    </label>
                    <select
                      className="form-control form-control-sm"
                      id="filtroEstado"
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="en_curso">En Curso</option>
                      <option value="finalizado">Finalizados</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-0">
              {mantenimientosFiltrados.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay mantenimientos que coincidan con los filtros.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Vehículo</th>
                        <th style={{ width: "110px" }}>Fecha Inicio</th>
                        <th style={{ width: "110px" }}>Fecha Fin</th>
                        <th style={{ width: "100px" }}>Tipo</th>
                        <th>Descripción</th>
                        <th style={{ width: "100px" }}>Costo</th>
                        <th>Responsable</th>
                        <th style={{ width: "100px" }}>Estado</th>
                        <th style={{ width: "120px" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mantenimientosFiltrados.map((m) => {
                        return (
                          <tr key={m.id_mantenimiento}>
                            <td>{m.id_mantenimiento}</td>
                            <td>{getVehiculoInfo(m.id_vehiculo)}</td>
                            <td>{m.fecha_inicio}</td>
                            <td>{m.fecha_fin || "-"}</td>
                            <td>
                              {m.tipo ? (
                                <span
                                  className={`badge ${
                                    m.tipo === "preventivo"
                                      ? "badge-info"
                                      : "badge-warning"
                                  }`}
                                >
                                  {m.tipo}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="small">{m.descripcion || "-"}</td>
                            <td className="text-right">
                              {m.costo ? `$${parseFloat(m.costo).toFixed(2)}` : "-"}
                            </td>
                            <td className="small">
                              {getEmpleadoNombre(m.id_empleado)}
                            </td>
                            <td>{getBadgeEstado(m.fecha_inicio, m.fecha_fin)}</td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mr-1"
                                onClick={() => handleEdit(m)}
                              >
                                <i className="fa fa-pencil-alt"></i>
                              </button>{" "}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(m.id_mantenimiento)}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {!loading && mantenimientosFiltrados.length > 0 && (
              <div className="card-footer text-muted small">
                Total: {mantenimientosFiltrados.length} de {mantenimientos.length} mantenimientos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MantenimientoPage };
