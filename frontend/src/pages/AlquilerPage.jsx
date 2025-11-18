import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
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
import { getCategoriasVehiculo } from "../api/categoriasVehiculoApi";
import { getMultasDaniosByAlquiler } from "../api/multasDaniosApi";

const emptyForm = {
  id_cliente: "",
  id_vehiculo: "",
  id_empleado: "",
  fecha_inicio: "",
  fecha_fin: "",
  observaciones: "",
};

export default function AlquilerPage() {
  const { setTitulo } = useOutletContext();
  const navigate = useNavigate();
  const [alquileres, setAlquileres] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [multasCounts, setMultasCounts] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [costoBaseCalculado, setCostoBaseCalculado] = useState(0);
  const [diasAlquiler, setDiasAlquiler] = useState(0);
  const [showMultasModal, setShowMultasModal] = useState(false);
  const [multasModalData, setMultasModalData] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aRes, cRes, vRes, eRes, catRes] = await Promise.all([
        getAlquileres(),
        getClientes(),
        getVehiculos(),
        getEmpleados(),
        getCategoriasVehiculo(),
      ]);
      setAlquileres(aRes.data);
      setClientes(cRes.data);
      setVehiculos(vRes.data);
      setEmpleados(eRes.data);
      setCategorias(catRes.data);

      // Cargar cantidad de multas para cada alquiler
      const counts = {};
      for (const alquiler of aRes.data) {
        try {
          const multasRes = await getMultasDaniosByAlquiler(alquiler.id_alquiler);
          counts[alquiler.id_alquiler] = multasRes.data.length;
        } catch (err) {
          counts[alquiler.id_alquiler] = 0;
        }
      }
      setMultasCounts(counts);
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

  // Calcular costo base cuando cambian fechas o vehículo
  useEffect(() => {
    if (form.fecha_inicio && form.fecha_fin && form.id_vehiculo) {
      const fechaInicio = new Date(form.fecha_inicio);
      const fechaFin = new Date(form.fecha_fin);
      const diffTime = Math.abs(fechaFin - fechaInicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const vehiculo = vehiculos.find(v => v.id_vehiculo === parseInt(form.id_vehiculo));
      if (vehiculo) {
        const categoria = categorias.find(c => c.id_categoria === vehiculo.id_categoria);
        if (categoria) {
          const tarifaDiaria = parseFloat(categoria.tarifa_diaria);
          const costoBase = tarifaDiaria * diffDays;
          setCostoBaseCalculado(costoBase);
          setDiasAlquiler(diffDays);
        }
      }
    } else {
      setCostoBaseCalculado(0);
      setDiasAlquiler(0);
    }
  }, [form.fecha_inicio, form.fecha_fin, form.id_vehiculo, vehiculos, categorias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia la fecha inicio, resetear fecha fin
    if (name === "fecha_inicio") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        fecha_fin: "", // Resetear fecha fin cuando cambia fecha inicio
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Obtener fecha mínima para los inputs (hoy)
  const getFechaMinima = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validaciones de fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(form.fecha_inicio);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(form.fecha_fin);
    fechaFin.setHours(0, 0, 0, 0);

    // Validar que fecha inicio no sea anterior a hoy
    if (editingId === null && fechaInicio < hoy) {
      setErrorMsg("La fecha de inicio no puede ser anterior a la fecha actual");
      return;
    }

    // Validar que fecha fin no sea anterior a fecha inicio
    if (fechaFin < fechaInicio) {
      setErrorMsg("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }
    
    // Calcular estado automáticamente según fechas
    let estadoCalculado;
    if (hoy < fechaInicio) {
      estadoCalculado = "PENDIENTE"; // Aún no comienza
    } else if (hoy >= fechaInicio && hoy <= fechaFin) {
      estadoCalculado = "EN_CURSO"; // Está en progreso
    } else {
      estadoCalculado = "FINALIZADO"; // Ya terminó
    }

    const payload = {
      id_cliente: form.id_cliente ? parseInt(form.id_cliente, 10) : null,
      id_vehiculo: form.id_vehiculo ? parseInt(form.id_vehiculo, 10) : null,
      id_empleado: form.id_empleado ? parseInt(form.id_empleado, 10) : null,
      id_reserva: null, // Siempre null, se maneja automáticamente en backend
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      costo_base: costoBaseCalculado,
      costo_total: costoBaseCalculado, // Inicialmente igual al costo base
      estado: estadoCalculado,
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
      setCostoBaseCalculado(0);
      setDiasAlquiler(0);
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
      fecha_inicio: a.fecha_inicio ?? "",
      fecha_fin: a.fecha_fin ?? "",
      observaciones: a.observaciones ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
    setCostoBaseCalculado(0);
    setDiasAlquiler(0);
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

  const handleVerMultas = async (idAlquiler) => {
    try {
      const multasRes = await getMultasDaniosByAlquiler(idAlquiler);
      setMultasModalData(multasRes.data);
      setShowMultasModal(true);
    } catch (err) {
      console.error(err);
      modalDialogService.Alert("Error al cargar las multas/daños");
    }
  };

  const closeMultasModal = () => {
    setShowMultasModal(false);
    setMultasModalData([]);
  };

  const goToMultasPage = (idAlquiler) => {
    navigate(`/multas-danios?id_alquiler=${idAlquiler}`);
  };

  // Función para calcular estado dinámicamente según fechas
  const calcularEstado = (fechaInicio, fechaFin) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) {
      return { estado: "PENDIENTE", clase: "badge-info" };
    } else if (hoy >= inicio && hoy <= fin) {
      return { estado: "EN_CURSO", clase: "badge-primary" };
    } else {
      return { estado: "FINALIZADO", clase: "badge-success" };
    }
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
                      min={editingId === null ? getFechaMinima() : undefined}
                      required
                    />
                    {editingId === null && (
                      <small className="text-muted">
                        No se puede seleccionar una fecha anterior a hoy
                      </small>
                    )}
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Fecha Fin *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="fecha_fin"
                      value={form.fecha_fin}
                      onChange={handleChange}
                      min={form.fecha_inicio || (editingId === null ? getFechaMinima() : undefined)}
                      disabled={!form.fecha_inicio}
                      required
                    />
                    {!form.fecha_inicio ? (
                      <small className="text-muted">
                        Primero seleccioná la fecha de inicio
                      </small>
                    ) : (
                      <small className="text-muted">
                        Debe ser posterior o igual a la fecha de inicio
                      </small>
                    )}
                  </div>

                  {/* Información calculada automáticamente */}
                  {(form.fecha_inicio && form.fecha_fin && form.id_vehiculo) && (
                    <div className="col-md-12 mb-3">
                      <div className="alert alert-info mb-0">
                        <strong>
                          <i className="fa fa-calculator mr-2"></i>
                          Cálculo automático:
                        </strong>
                        <br />
                        Días de alquiler: <strong>{diasAlquiler}</strong> días
                        <br />
                        Costo base (por {diasAlquiler} día{diasAlquiler !== 1 ? 's' : ''}): 
                        <strong> ${costoBaseCalculado.toFixed(2)}</strong>
                        <br />
                        Estado: <strong>{calcularEstado(form.fecha_inicio, form.fecha_fin).estado}</strong>
                        <br />
                        <small className="text-muted">
                          El costo total incluirá multas/daños que se agreguen posteriormente
                        </small>
                      </div>
                    </div>
                  )}

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
                        <th style={{ width: "80px" }}>Multas</th>
                        <th style={{ width: "100px" }}>Estado</th>
                        <th style={{ width: "180px" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alquileres.map((a) => {
                        const estadoInfo = calcularEstado(a.fecha_inicio, a.fecha_fin);
                        return (
                        <tr key={a.id_alquiler}>
                          <td>{a.id_alquiler}</td>
                          <td>{getClienteNombre(a.id_cliente)}</td>
                          <td>{getVehiculoInfo(a.id_vehiculo)}</td>
                          <td>{getEmpleadoNombre(a.id_empleado)}</td>
                          <td>{a.fecha_inicio}</td>
                          <td>{a.fecha_fin}</td>
                          <td>${a.costo_base}</td>
                          <td>${a.costo_total}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                multasCounts[a.id_alquiler] > 0
                                  ? "btn-warning"
                                  : "btn-outline-secondary"
                              }`}
                              onClick={() => handleVerMultas(a.id_alquiler)}
                              title="Ver multas/daños"
                            >
                              <i className="fa fa-exclamation-triangle mr-1"></i>
                              {multasCounts[a.id_alquiler] || 0}
                            </button>
                          </td>
                          <td>
                            <span className={`badge ${estadoInfo.clase}`}>
                              {estadoInfo.estado}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning mr-1"
                              onClick={() => goToMultasPage(a.id_alquiler)}
                              title="Ir a Multas/Daños"
                            >
                              <i className="fa fa-file-invoice-dollar"></i>
                            </button>{" "}
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
                        );
                      })}
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

      {/* Modal de Multas/Daños */}
      {showMultasModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeMultasModal}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="fa fa-exclamation-triangle mr-2"></i>
                  Multas y Daños
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeMultasModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {multasModalData.length === 0 ? (
                  <div className="alert alert-info mb-0">
                    No hay multas o daños registrados para este alquiler.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="thead-dark">
                        <tr>
                          <th>ID</th>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th>Monto</th>
                          <th>Fecha Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multasModalData.map((md) => (
                          <tr key={md.id_multa_danio}>
                            <td>{md.id_multa_danio}</td>
                            <td>
                              <span
                                className={`badge ${
                                  md.tipo === "multa"
                                    ? "badge-danger"
                                    : md.tipo === "daño"
                                    ? "badge-warning"
                                    : md.tipo === "retraso"
                                    ? "badge-info"
                                    : "badge-secondary"
                                }`}
                              >
                                {md.tipo.toUpperCase()}
                              </span>
                            </td>
                            <td>{md.descripcion || "-"}</td>
                            <td className="text-right font-weight-bold">
                              ${md.monto}
                            </td>
                            <td>
                              {new Date(md.fecha_registro).toLocaleDateString(
                                "es-AR"
                              )}{" "}
                              {new Date(md.fecha_registro).toLocaleTimeString(
                                "es-AR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-active">
                          <td colSpan="3" className="text-right">
                            <strong>Total:</strong>
                          </td>
                          <td className="text-right font-weight-bold">
                            <strong>
                              $
                              {multasModalData
                                .reduce(
                                  (sum, md) => sum + parseFloat(md.monto || 0),
                                  0
                                )
                                .toFixed(2)}
                            </strong>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeMultasModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AlquilerPage };
