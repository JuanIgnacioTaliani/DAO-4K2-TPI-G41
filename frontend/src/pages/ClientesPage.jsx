import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import modalDialogService from "../api/modalDialog.service";

import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../api/clientesApi";

const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default function Clientes() {
  const { setTitulo } = useOutletContext();
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroApellido, setFiltroApellido] = useState("");
  const [filtroDni, setFiltroDni] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState("");
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroDireccion, setFiltroDireccion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(""); // "" | "true" | "false"

  const loadClientes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroNombre) params.nombre = filtroNombre;
      if (filtroApellido) params.apellido = filtroApellido;
      if (filtroDni) params.dni = filtroDni;
      if (filtroTelefono) params.telefono = filtroTelefono;
      if (filtroEmail) params.email = filtroEmail;
      if (filtroDireccion) params.direccion = filtroDireccion;
      if (filtroEstado !== "") params.estado = filtroEstado === "true";

      const res = await getClientes(params);
      setClientes(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Clientes");
    loadClientes();
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

    try {
      if (editingId === null) {
        await createCliente(form);
        modalDialogService.Alert("Cliente creado correctamente");
      } else {
        await updateCliente(editingId, form);
        modalDialogService.Alert("Cliente actualizado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadClientes();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      modalDialogService.Alert(apiMsg || "Error al guardar el cliente");
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id_cliente);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      dni: cliente.dni,
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este cliente?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteCliente(id);
          await loadClientes();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar el cliente");
        }
      }
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Formulario */}
        <div className="col-lg-12 col-md-12">
          <div className="card card-primary mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {editingId === null ? "Nuevo cliente" : "Editar cliente"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Apellido</label>
                    <input
                      className="form-control"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">DNI</label>
                    <input
                      className="form-control"
                      name="dni"
                      value={form.dni}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      className="form-control"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      className="form-control"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
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
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Nombre</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroNombre}
                      onChange={(e) => setFiltroNombre(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Apellido</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroApellido}
                      onChange={(e) => setFiltroApellido(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">DNI</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroDni}
                      onChange={(e) => setFiltroDni(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Teléfono</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroTelefono}
                      onChange={(e) => setFiltroTelefono(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2 mt-2">
                  <div className="col-md-4">
                    <label className="form-label small mb-1">Email</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroEmail}
                      onChange={(e) => setFiltroEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label small mb-1">Dirección</label>
                    <input
                      className="form-control form-control-sm"
                      value={filtroDireccion}
                      onChange={(e) => setFiltroDireccion(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1">Estado</label>
                    <select
                      className="form-control form-control-sm"
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button type="button" className="btn btn-primary btn-sm" onClick={loadClientes}>
                    <i className="fas fa-search mr-1"></i> Aplicar Filtros
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setFiltroNombre("");
                      setFiltroApellido("");
                      setFiltroDni("");
                      setFiltroTelefono("");
                      setFiltroEmail("");
                      setFiltroDireccion("");
                      setFiltroEstado("");
                      setTimeout(() => loadClientes(), 0);
                    }}
                  >
                    <i className="fas fa-eraser mr-1"></i> Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Listado de clientes</h3>
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
              {clientes.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay clientes cargados.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "60px" }}>ID</th>
                        <th>Nombre</th>
                        <th style={{ width: "110px" }}>DNI</th>
                        <th style={{ width: "130px" }}>Teléfono</th>
                        <th>Email</th>
                        <th>Dirección</th>
                        <th style={{ width: "130px" }} className="text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((c) => (
                        <tr key={c.id_cliente}>
                          <td>{c.id_cliente}</td>
                          <td>
                            {c.nombre} {c.apellido}
                          </td>
                          <td>{c.dni}</td>
                          <td>{c.telefono}</td>
                          <td>{c.email}</td>
                          <td>{c.direccion}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary mr-1"
                              onClick={() => handleEdit(c)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(c.id_cliente)}
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
            {!loading && clientes.length > 0 && (
              <div className="card-footer text-muted small">
                Total de clientes: {clientes.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Clientes };
