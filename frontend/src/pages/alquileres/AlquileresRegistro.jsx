import React from "react";

const emptyForm = {
  id_cliente: "",
  id_vehiculo: "",
  id_empleado: "",
  fecha_inicio: "",
  fecha_fin: "",
  observaciones: "",
};

export default function AlquileresRegistro({
  form,
  handleChange,
  getFechaMinima,
  editingId,
  costoBaseCalculado,
  diasAlquiler,
  clientes,
  vehiculos,
  vehiculosDisponibles,
  empleados,
  categorias,
  loadingDisponibilidad,
  disponibilidadMsg,
  handleSubmit,
  handleCancelEdit,
  errorMsg,
}) {
  return (
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
              <div className="col-12 mb-3">
                <h5 className="text-primary">
                  <i className="fa fa-calendar mr-2"></i>
                  Paso 1: Seleccioná el período de alquiler
                </h5>
              </div>

              <div className="col-md-6 mb-3">
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
                  <small className="text-muted">No se puede seleccionar una fecha anterior a hoy</small>
                )}
              </div>

              <div className="col-md-6 mb-3">
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
                  <small className="text-muted">Primero seleccioná la fecha de inicio</small>
                ) : (
                  <small className="text-muted">Debe ser posterior o igual a la fecha de inicio</small>
                )}
              </div>

              {(form.fecha_inicio && form.fecha_fin) && (
                <div className="col-12 mb-3">
                  {loadingDisponibilidad ? (
                    <div className="alert alert-info mb-0">
                      <i className="fa fa-spinner fa-spin mr-2"></i>
                      Verificando disponibilidad de vehículos...
                    </div>
                  ) : disponibilidadMsg ? (
                    <div className={`alert ${disponibilidadMsg.startsWith('✅') ? 'alert-success' : 'alert-warning'} mb-0`}>
                      {disponibilidadMsg}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <hr />

            <div className="row">
              <div className="col-12 mb-3">
                <h5 className="text-primary">
                  <i className="fa fa-car mr-2"></i>
                  Paso 2: Seleccioná el vehículo y completá los datos
                </h5>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Cliente *</label>
                <select className="form-control" name="id_cliente" value={form.id_cliente} onChange={handleChange} required>
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
                  disabled={!form.fecha_inicio || !form.fecha_fin || loadingDisponibilidad}
                  required
                >
                  <option value="">
                    {!form.fecha_inicio || !form.fecha_fin
                      ? "-- Primero seleccioná las fechas --"
                      : loadingDisponibilidad
                      ? "-- Verificando disponibilidad... --"
                      : "-- Seleccionar vehículo --"}
                  </option>

                  {vehiculosDisponibles.filter(v => v.disponible).length > 0 && (
                    <optgroup label="✅ Disponibles">
                      {vehiculosDisponibles.filter(v => v.disponible).map((v) => (
                        <option key={v.id_vehiculo} value={v.id_vehiculo}>
                          {v.patente} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {vehiculosDisponibles.filter(v => v.estado_disponibilidad === "En Mantenimiento").length > 0 && (
                    <optgroup label="🔧 En Mantenimiento">
                      {vehiculosDisponibles.filter(v => v.estado_disponibilidad === "En Mantenimiento").map((v) => (
                        <option key={v.id_vehiculo} value={v.id_vehiculo} disabled>
                          {v.patente} - {v.marca} {v.modelo} (En Mantenimiento)
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {vehiculosDisponibles.filter(v => !v.disponible && v.estado_disponibilidad !== "En Mantenimiento").length > 0 && (
                    <optgroup label="❌ Ocupados">
                      {vehiculosDisponibles.filter(v => !v.disponible && v.estado_disponibilidad !== "En Mantenimiento").map((v) => (
                        <option key={v.id_vehiculo} value={v.id_vehiculo} disabled>
                          {v.patente} - {v.marca} {v.modelo} (Ocupado)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                {!form.fecha_inicio || !form.fecha_fin ? (
                  <small className="text-muted">Seleccioná las fechas para ver vehículos disponibles</small>
                ) : form.id_vehiculo && vehiculosDisponibles.find(v => v.id_vehiculo === parseInt(form.id_vehiculo))?.conflictos?.length > 0 ? (
                  <small className="text-danger">⚠️ Este vehículo tiene conflictos en las fechas seleccionadas</small>
                ) : null}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Empleado *</label>
                <select className="form-control" name="id_empleado" value={form.id_empleado} onChange={handleChange} required>
                  <option value="">-- Seleccionar --</option>
                  {empleados.map((e) => (
                    <option key={e.id_empleado} value={e.id_empleado}>
                      {e.nombre} {e.apellido}
                    </option>
                  ))}
                </select>
              </div>

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
                    Costo base (por {diasAlquiler} día{diasAlquiler !== 1 ? 's' : ''}): <strong> ${costoBaseCalculado.toFixed(2)}</strong>
                    <br />
                    <small className="text-muted">El costo total incluirá multas/daños que se agreguen posteriormente</small>
                  </div>
                </div>
              )}

              <div className="col-md-12 mb-3">
                <label className="form-label">Observaciones</label>
                <textarea className="form-control" name="observaciones" value={form.observaciones} onChange={handleChange} rows="3" maxLength="300" />
              </div>
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2 mt-1" role="alert">{errorMsg}</div>
            )}

            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary">{editingId === null ? "Crear alquiler" : "Guardar cambios"}</button>
              {editingId !== null && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancelar</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
