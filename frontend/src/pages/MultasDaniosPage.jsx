import { useEffect, useState } from "react";
import { useOutletContext, useSearchParams, useNavigate } from "react-router-dom";
import modalDialogService from "../api/modalDialog.service";

import {
  getMultasDanios,
  createMultaDanio,
  updateMultaDanio,
  deleteMultaDanio,
} from "../api/multasDaniosApi";
import { getAlquileres } from "../api/alquileresApi";

const emptyForm = {
  id_alquiler: "",
  tipo: "multa",
  descripcion: "",
  monto: "",
};

export default function MultasDaniosPage() {
  const { setTitulo } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [multasDanios, setMultasDanios] = useState([]);
  const [alquileres, setAlquileres] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filter states
  const [filtroAlquiler, setFiltroAlquiler] = useState("");
  const [filtroTipo, setFiltroTipo] = useState([]);
  const [filtroMontoDesde, setFiltroMontoDesde] = useState("");
  const [filtroMontoHasta, setFiltroMontoHasta] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [errorFiltro, setErrorFiltro] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorFiltro("");

      // Validar rangos de filtros antes de hacer la llamada
      if (filtroMontoDesde && filtroMontoHasta) {
        const desde = parseFloat(filtroMontoDesde);
        const hasta = parseFloat(filtroMontoHasta);
        if (desde > hasta) {
          setErrorFiltro("El monto desde no puede ser mayor al monto hasta");
          setLoading(false);
          return;
        }
      }

      if (filtroFechaDesde && filtroFechaHasta) {
        if (filtroFechaDesde > filtroFechaHasta) {
          setErrorFiltro("La fecha desde no puede ser mayor a la fecha hasta");
          setLoading(false);
          return;
        }
      }

      // Construir parámetros de filtros
      const params = {};
      if (filtroAlquiler) params.id_alquiler = filtroAlquiler;
      if (filtroTipo.length > 0) params.tipo = filtroTipo;
      if (filtroMontoDesde) params.monto_desde = filtroMontoDesde;
      if (filtroMontoHasta) params.monto_hasta = filtroMontoHasta;
      if (filtroFechaDesde) params.fecha_registro_desde = filtroFechaDesde;
      if (filtroFechaHasta) params.fecha_registro_hasta = filtroFechaHasta;

      const [mdRes, aRes] = await Promise.all([
        getMultasDanios(params),
        getAlquileres(),
      ]);
      setMultasDanios(mdRes.data);
      setAlquileres(aRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar multas/daños / alquileres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Multas y Daños");
    loadData();
    
    // Si viene un id_alquiler en la URL, pre-seleccionarlo
    const idAlquiler = searchParams.get("id_alquiler");
    if (idAlquiler) {
      setForm((prev) => ({ ...prev, id_alquiler: idAlquiler }));
    }
  }, [setTitulo, searchParams]);

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
      id_alquiler: form.id_alquiler ? parseInt(form.id_alquiler, 10) : null,
      tipo: form.tipo || "multa",
      descripcion: form.descripcion || null,
      monto: form.monto ? parseFloat(form.monto) : null,
    };

    try {
      if (!payload.id_alquiler) {
        setErrorMsg("Debés seleccionar un alquiler");
        return;
      }

      if (!payload.monto || payload.monto <= 0) {
        setErrorMsg("El monto debe ser mayor a 0");
        return;
      }

      if (editingId === null) {
        await createMultaDanio(payload);
        modalDialogService.Alert("Multa/Daño creado correctamente");
      } else {
        await updateMultaDanio(editingId, payload);
        modalDialogService.Alert("Multa/Daño actualizado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      modalDialogService.Alert(apiMsg || "Error al guardar la multa/daño");
    }
  };

  const handleEdit = (md) => {
    setEditingId(md.id_multa_danio);
    setForm({
      id_alquiler: md.id_alquiler ?? "",
      tipo: md.tipo ?? "multa",
      descripcion: md.descripcion ?? "",
      monto: md.monto ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleLimpiarFiltros = () => {
    setFiltroAlquiler("");
    setFiltroTipo([]);
    setFiltroMontoDesde("");
    setFiltroMontoHasta("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
    setErrorFiltro("");
  };

  const handleTipoChange = (tipo) => {
    setFiltroTipo((prev) => {
      if (prev.includes(tipo)) {
        return prev.filter((t) => t !== tipo);
      } else {
        return [...prev, tipo];
      }
    });
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar esta Multa/Daño?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteMultaDanio(id);
          await loadData();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar la Multa/Daño");
        }
      }
    );
  };

  const getAlquilerInfo = (id_alquiler) => {
    const alquiler = alquileres.find((a) => a.id_alquiler === id_alquiler);
    if (!alquiler) return `Alquiler #${id_alquiler}`;
    return `Alquiler #${id_alquiler} - ${alquiler.fecha_inicio} a ${alquiler.fecha_fin}`;
  };

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR") + " " + fecha.toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Formulario */}
        <div className="col-lg-12 col-md-12">
          <div className="card card-warning mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {editingId === null ? "Nueva multa/daño" : "Editar multa/daño"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Alquiler *</label>
                    <select
                      className="form-control"
                      name="id_alquiler"
                      value={form.id_alquiler}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {alquileres.map((a) => (
                        <option key={a.id_alquiler} value={a.id_alquiler}>
                          Alquiler #{a.id_alquiler} - {a.fecha_inicio} a {a.fecha_fin} ({a.estado})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-control"
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="multa">Multa</option>
                      <option value="daño">Daño</option>
                      <option value="retraso">Retraso</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Monto *</label>
                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      name="monto"
                      value={form.monto}
                      onChange={handleChange}
                      required
                      min="0.01"
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      rows="3"
                      maxLength="300"
                      placeholder="Describe la multa o daño..."
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 mt-1" role="alert">
                    {errorMsg}
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-warning">
                    {editingId === null ? "Crear multa/daño" : "Guardar cambios"}
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

        {/* Panel de Filtros */}
        <div className="col-lg-12 col-md-12">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                <button
                  type="button"
                  className="btn btn-tool"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className={`fas fa-${showFilters ? "minus" : "plus"}`}></i>
                </button>
                Filtros de búsqueda
              </h3>
            </div>
            {showFilters && (
              <div className="card-body">
                <div className="row mb-2">
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Alquiler</label>
                    <select
                      className="form-control form-control-sm"
                      value={filtroAlquiler}
                      onChange={(e) => setFiltroAlquiler(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {alquileres.map((a) => (
                        <option key={a.id_alquiler} value={a.id_alquiler}>
                          Alquiler #{a.id_alquiler} - {a.fecha_inicio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small mb-1">Tipo</label>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                      {["multa", "daño", "retraso", "otro"].map((tipo) => (
                        <div key={tipo} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`tipo-${tipo}`}
                            checked={filtroTipo.includes(tipo)}
                            onChange={() => handleTipoChange(tipo)}
                          />
                          <label className="form-check-label small" htmlFor={`tipo-${tipo}`}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small mb-1">Monto Desde</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      step="0.01"
                      min="0"
                      value={filtroMontoDesde}
                      onChange={(e) => setFiltroMontoDesde(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small mb-1">Monto Hasta</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      step="0.01"
                      min="0"
                      value={filtroMontoHasta}
                      onChange={(e) => setFiltroMontoHasta(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Fecha Registro Desde</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={filtroFechaDesde}
                      onChange={(e) => setFiltroFechaDesde(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small mb-1">Fecha Registro Hasta</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={filtroFechaHasta}
                      onChange={(e) => setFiltroFechaHasta(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6 d-flex align-items-end gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={loadData}
                    >
                      <i className="fas fa-search mr-1"></i> Aplicar Filtros
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        handleLimpiarFiltros();
                        // Recargar sin filtros después de limpiar
                        setTimeout(() => loadData(), 0);
                      }}
                    >
                      <i className="fas fa-eraser mr-1"></i> Limpiar
                    </button>
                  </div>
                </div>

                {errorFiltro && (
                  <div className="alert alert-danger py-2 mb-0" role="alert">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    {errorFiltro}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Listado */}
        <div className="col-lg-12 col-md-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Listado de Multas y Daños</h3>
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
              {multasDanios.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay multas/daños cargados.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Alquiler</th>
                        <th style={{ width: "100px" }}>Tipo</th>
                        <th>Descripción</th>
                        <th style={{ width: "100px" }}>Monto</th>
                        <th style={{ width: "150px" }}>Fecha Registro</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {multasDanios.map((md) => (
                        <tr key={md.id_multa_danio}>
                          <td>{md.id_multa_danio}</td>
                          <td>{getAlquilerInfo(md.id_alquiler)}</td>
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
                          <td className="text-right font-weight-bold">${md.monto}</td>
                          <td>{formatFecha(md.fecha_registro)}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary mr-1"
                              onClick={() => handleEdit(md)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>{" "}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(md.id_multa_danio)}
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
            {!loading && multasDanios.length > 0 && (
              <div className="card-footer text-muted small">
                Total de multas/daños: {multasDanios.length} | Total acumulado: $
                {multasDanios.reduce((sum, md) => sum + parseFloat(md.monto || 0), 0).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MultasDaniosPage };
