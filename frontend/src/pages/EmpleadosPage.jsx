import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import modalDialogService from "../api/modalDialog.service";

import {
  getEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
} from "../api/empleadosApi";

const emptyForm = {
  nombre: "",
  apellido: "",
  dni: "",
  legajo: "",
  email: "",
  telefono: "",
  rol: "",
  estado: true,
};

export default function EmpleadosPage() {
  const { setTitulo } = useOutletContext();
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const res = await getEmpleados();
      setEmpleados(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Empleados");
    loadEmpleados();
  }, [setTitulo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (editingId === null) {
        await createEmpleado(form);
        modalDialogService.Alert("Empleado creado correctamente");
      } else {
        await updateEmpleado(editingId, form);
        modalDialogService.Alert("Empleado actualizado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadEmpleados();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      setErrorMsg(apiMsg || "Error al guardar el empleado");
    }
  };

  const handleEdit = (empleado) => {
    setEditingId(empleado.id_empleado);
    setForm({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      dni: empleado.dni || "",
      legajo: empleado.legajo || "",
      email: empleado.email || "",
      telefono: empleado.telefono || "",
      rol: empleado.rol || "",
      estado: empleado.estado ?? true,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este empleado?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteEmpleado(id);
          await loadEmpleados();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar el empleado");
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
                {editingId === null ? "Nuevo empleado" : "Editar empleado"}
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
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Legajo</label>
                    <input
                      className="form-control"
                      name="legajo"
                      value={form.legajo}
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
                    <label className="form-label">Teléfono</label>
                    <input
                      className="form-control"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Rol</label>
                    <input
                      className="form-control"
                      name="rol"
                      value={form.rol}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3 d-flex align-items-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="estado"
                        name="estado"
                        checked={form.estado}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="estado">
                        Activo
                      </label>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 mt-1" role="alert">
                    {errorMsg}
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary">
                    {editingId === null
                      ? "Crear empleado"
                      : "Guardar cambios"}
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
              <h3 className="card-title mb-0">Listado de empleados</h3>
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
              {empleados.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay empleados cargados.
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
                        <th style={{ width: "110px" }}>Legajo</th>
                        <th>Rol</th>
                        <th style={{ width: "130px" }}>Teléfono</th>
                        <th>Email</th>
                        <th style={{ width: "80px" }}>Estado</th>
                        <th
                          style={{ width: "130px" }}
                          className="text-center"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleados.map((e) => (
                        <tr key={e.id_empleado}>
                          <td>{e.id_empleado}</td>
                          <td>
                            {e.nombre} {e.apellido}
                          </td>
                          <td>{e.dni}</td>
                          <td>{e.legajo}</td>
                          <td>{e.rol}</td>
                          <td>{e.telefono}</td>
                          <td>{e.email}</td>
                          <td>{e.estado ? "Activo" : "Inactivo"}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => handleEdit(e)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(e.id_empleado)}
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
            {!loading && empleados.length > 0 && (
              <div className="card-footer text-muted small">
                Total de empleados: {empleados.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
