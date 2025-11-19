import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { selectStyles } from "../assets/selectStyles";
import modalDialogService from "../api/modalDialog.service";

import {
  getVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from "../api/vehiculosApi";
import { getCategorias } from "../api/categoriasVehiculoApi";
import { getEstadosVehiculo } from "../api/estadosVehiculoApi";

const emptyForm = {
  patente: "",
  marca: "",
  modelo: "",
  anio: "",
  id_categoria: "",
  id_estado: "",
  km_actual: "",
};

export default function VehiculosPage() {
  const { setTitulo } = useOutletContext();
  const [vehiculos, setVehiculos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorFiltro, setErrorFiltro] = useState("");
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filtroPatente, setFiltroPatente] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroModelo, setFiltroModelo] = useState("");
  const [filtroAnioDesde, setFiltroAnioDesde] = useState("");
  const [filtroAnioHasta, setFiltroAnioHasta] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroKmDesde, setFiltroKmDesde] = useState("");
  const [filtroKmHasta, setFiltroKmHasta] = useState("");
  const [filtroFumDesde, setFiltroFumDesde] = useState(""); // fecha_ultimo_mantenimiento_desde
  const [filtroFumHasta, setFiltroFumHasta] = useState(""); // fecha_ultimo_mantenimiento_hasta

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorFiltro("");

      // Validaciones de rangos
      if (filtroAnioDesde && filtroAnioHasta) {
        const desde = parseInt(filtroAnioDesde, 10);
        const hasta = parseInt(filtroAnioHasta, 10);
        if (!isNaN(desde) && !isNaN(hasta) && desde > hasta) {
          setErrorFiltro("El año desde no puede ser mayor al año hasta");
          setLoading(false);
          return;
        }
      }

      if (filtroKmDesde && filtroKmHasta) {
        const desdeKm = parseInt(filtroKmDesde, 10);
        const hastaKm = parseInt(filtroKmHasta, 10);
        if (!isNaN(desdeKm) && !isNaN(hastaKm) && desdeKm > hastaKm) {
          setErrorFiltro("El KM desde no puede ser mayor al KM hasta");
          setLoading(false);
          return;
        }
      }

      if (filtroFumDesde && filtroFumHasta) {
        if (filtroFumDesde > filtroFumHasta) {
          setErrorFiltro("La fecha de último mantenimiento desde no puede ser mayor a la fecha hasta");
          setLoading(false);
          return;
        }
      }
      const params = {};
      if (filtroPatente) params.patente = filtroPatente;
      if (filtroMarca) params.marca = filtroMarca;
      if (filtroModelo) params.modelo = filtroModelo;
      if (filtroAnioDesde) params.anio_desde = parseInt(filtroAnioDesde, 10);
      if (filtroAnioHasta) params.anio_hasta = parseInt(filtroAnioHasta, 10);
      if (filtroCategoria) params.id_categoria = parseInt(filtroCategoria, 10);
      if (filtroEstado) params.id_estado = parseInt(filtroEstado, 10);
      if (filtroKmDesde) params.km_desde = parseInt(filtroKmDesde, 10);
      if (filtroKmHasta) params.km_hasta = parseInt(filtroKmHasta, 10);
      if (filtroFumDesde) params.fecha_ultimo_mantenimiento_desde = filtroFumDesde;
      if (filtroFumHasta) params.fecha_ultimo_mantenimiento_hasta = filtroFumHasta;

      const [vRes, cRes, eRes] = await Promise.all([
        getVehiculos(params),
        getCategorias(),
        getEstadosVehiculo(),
      ]);
      setVehiculos(vRes.data);
      setCategorias(cRes.data);
      setEstados(eRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar vehículos / cat / estados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Vehiculos");
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
      patente: form.patente,
      marca: form.marca,
      modelo: form.modelo,
      anio: form.anio ? parseInt(form.anio, 10) : null,
      id_categoria: form.id_categoria ? parseInt(form.id_categoria, 10) : null,
      id_estado: form.id_estado ? parseInt(form.id_estado, 10) : null,
      km_actual: form.km_actual ? parseInt(form.km_actual, 10) : null,
    };

    try {
      if (!payload.id_categoria || !payload.id_estado) {
        setErrorMsg("Debés seleccionar categoría y estado");
        return;
      }

      if (editingId === null) {
        await createVehiculo(payload);
        modalDialogService.Alert("Vehiculo creado correctamente");
      } else {
        await updateVehiculo(editingId, payload);
        modalDialogService.Alert("Vehiculo actualizado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      modalDialogService.Alert(apiMsg || "Error al guardar el vehículo");
    }
  };

  const handleEdit = (v) => {
    setEditingId(v.id_vehiculo);
    setForm({
      patente: v.patente,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio ?? "",
      id_categoria: v.id_categoria ?? "",
      id_estado: v.id_estado ?? "",
      km_actual: v.km_actual ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este Vehiculo?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteVehiculo(id);
          await loadData();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar el Vehiculo");
        }
      }
    );
  };

  const getCategoriaNombre = (id_categoria) => {
    const cat = categorias.find((c) => c.id_categoria === id_categoria);
    return cat ? cat.nombre : "";
  };

  const getEstadoNombre = (id_estado) => {
    const est = estados.find((e) => e.id_estado === id_estado);
    return est ? est.nombre : "";
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Formulario */}
        <div className="col-lg-12 col-md-12">
          <div className="card card-primary mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {editingId === null ? "Nuevo vehiculo" : "Editar vehiculo"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Patente</label>
                    <input
                      className="form-control"
                      name="patente"
                      value={form.patente}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Marca</label>
                    <input
                      className="form-control"
                      name="marca"
                      value={form.marca}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Modelo</label>
                    <input
                      className="form-control"
                      name="modelo"
                      value={form.modelo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Año</label>
                    <input
                      className="form-control"
                      type="number"
                      name="anio"
                      value={form.anio}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-control"
                      name="id_categoria"
                      value={form.id_categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria} value={c.id_categoria}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-control"
                      name="id_estado"
                      value={form.id_estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {estados.map((e) => (
                        <option key={e.id_estado} value={e.id_estado}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">KM actual</label>
                    <input
                      className="form-control"
                      type="number"
                      name="km_actual"
                      value={form.km_actual}
                      onChange={handleChange}
                      required
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
                    {editingId === null ? "Crear cliente" : "Guardar cambios"}
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
          {/* Panel de Filtros */}
          <div className="card mb-3">
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
                <div className="row g-2">
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Patente</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroPatente}
                      onChange={(e) => setFiltroPatente(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Marca</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroMarca}
                      onChange={(e) => setFiltroMarca(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Modelo</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroModelo}
                      onChange={(e) => setFiltroModelo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Año desde</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={filtroAnioDesde}
                      onChange={(e) => setFiltroAnioDesde(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">Año hasta</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={filtroAnioHasta}
                      onChange={(e) => setFiltroAnioHasta(e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Categoría</label>
                    <select
                      className="form-control form-control-sm"
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                      <option value="">Todas</option>
                      {categorias.map((c) => (
                        <option key={c.id_categoria} value={c.id_categoria}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Estado</label>
                    <select
                      className="form-control form-control-sm"
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {estados.map((e) => (
                        <option key={e.id_estado} value={e.id_estado}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">KM desde</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={filtroKmDesde}
                      onChange={(e) => setFiltroKmDesde(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small mb-1">KM hasta</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={filtroKmHasta}
                      onChange={(e) => setFiltroKmHasta(e.target.value)}
                    />
                  </div>
                </div>
                <div className="row g-2 mt-2">
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Últ. mant. desde</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={filtroFumDesde}
                      onChange={(e) => setFiltroFumDesde(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Últ. mant. hasta</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={filtroFumHasta}
                      onChange={(e) => setFiltroFumHasta(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 d-flex align-items-end gap-2">
                    <button type="button" className="btn btn-primary btn-sm" onClick={loadData}>
                      <i className="fas fa-search mr-1"></i> Aplicar Filtros
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setFiltroPatente("");
                        setFiltroMarca("");
                        setFiltroModelo("");
                        setFiltroAnioDesde("");
                        setFiltroAnioHasta("");
                        setFiltroCategoria("");
                        setFiltroEstado("");
                        setFiltroKmDesde("");
                        setFiltroKmHasta("");
                        setFiltroFumDesde("");
                        setFiltroFumHasta("");
                        setTimeout(() => loadData(), 0);
                      }}
                    >
                      <i className="fas fa-eraser mr-1"></i> Limpiar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Listado de Vehiculos</h3>
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
              {errorFiltro && (
                <div className="p-3 pt-3">
                  <div className="alert alert-danger py-2 mb-0" role="alert">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    {errorFiltro}
                  </div>
                </div>
              )}
              {vehiculos.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay vehiculos cargados.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th style={{ width: "110px" }}>Patente</th>
                        <th>Marca / Modelo</th>
                        <th style={{ width: "100px" }}>Año</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th>KM</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehiculos.map((v) => (
                        <tr key={v.id_vehiculo}>
                          <td>{v.id_vehiculo}</td>
                          <td>{v.patente}</td>
                          <td>
                            {v.marca} {v.modelo}
                          </td>
                          <td>{v.anio}</td>
                          <td>{getCategoriaNombre(v.id_categoria)}</td>
                          <td>{getEstadoNombre(v.id_estado)}</td>
                          <td>{v.km_actual}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary mr-1"
                              onClick={() => handleEdit(v)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>{" "}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(v.id_vehiculo)}
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
            {!loading && vehiculos.length > 0 && (
              <div className="card-footer text-muted small">
                Total de clientes: {vehiculos.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { VehiculosPage };
