import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import modalDialogService from "../api/modalDialog.service";

import {
  getCategoriasVehiculo,
  createCategoriaVehiculo,
  updateCategoriaVehiculo,
  deleteCategoriaVehiculo,
} from "../api/categoriasVehiculoApi";

const emptyForm = {
  nombre: "",
  descripcion: "",
  tarifa_diaria: "",
};

export default function CategoriasVehiculoPage() {
  const { setTitulo } = useOutletContext();
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const res = await getCategoriasVehiculo();
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Categorías de Vehiculos");
    loadCategorias();
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
      ...form,
      tarifa_diaria: form.tarifa_diaria ? parseFloat(form.tarifa_diaria) : 0,
    };

    try {
      if (editingId === null) {
        await createCategoriaVehiculo(payload);
        modalDialogService.Alert("Categoría creado correctamente");
      } else {
        await updateCategoriaVehiculo(editingId, payload);
        modalDialogService.Alert("Categoría actualizada correctamente");
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadCategorias();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      modalDialogService.Alert(apiMsg || "Error al guardar la categoría");
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id_categoria);
    setForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion || "",
      tarifa_diaria: cat.tarifa_diaria ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar esta Categoría?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteCategoriaVehiculo(id);
          await loadCategorias();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar la categoría");
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
                {editingId === null ? "Nueva Categoria" : "Editar Categoria"}
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
                    <label className="form-label">Tarifa diaria</label>
                    <input
                      className="form-control"
                      name="tarifa_diaria"
                      type="number"
                      value={form.tarifa_diaria}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Descripción</label>
                    <input
                      className="form-control"
                      name="descripcion"
                      value={form.descripcion}
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
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">
                Listado de Categorias de Vehiculo
              </h3>
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
              {categorias.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay categorias cargadas.
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tarifa diaria</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorias.map((c) => (
                        <tr key={c.id_categoria}>
                          <td>{c.id_categoria}</td>
                          <td>{c.nombre}</td>
                          <td>{c.tarifa_diaria}</td>
                          <td>{c.descripcion}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary mr-1"
                              onClick={() => handleEdit(c)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>{" "}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(c.id_categoria)}
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
            {!loading && categorias.length > 0 && (
              <div className="card-footer text-muted small">
                Total de categorias: {categorias.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CategoriasVehiculoPage };
