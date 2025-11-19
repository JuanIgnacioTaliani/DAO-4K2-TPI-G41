import React from "react";

export default function AlquileresBuscar({
  filtroPeriodoEstado,
  setFiltroPeriodoEstado,
  filtroCliente,
  setFiltroCliente,
  filtroVehiculo,
  setFiltroVehiculo,
  filtroEmpleado,
  setFiltroEmpleado,
  filtroFechaInicioDesde,
  setFiltroFechaInicioDesde,
  filtroFechaInicioHasta,
  setFiltroFechaInicioHasta,
  filtroFechaFinDesde,
  setFiltroFechaFinDesde,
  filtroFechaFinHasta,
  setFiltroFechaFinHasta,
  clientes,
  vehiculos,
  empleados,
  loadData,
  clearFilters,
  loading,
}) {
  return (
    <>
      <div className="card-body border-bottom">
        <div className="row">
          <div className="col-md-3">
            <div className="form-group mb-0">
              <label className="small" htmlFor="filtroPeriodoEstado">Estado por fechas</label>
              <select
                id="filtroPeriodoEstado"
                className="form-control form-control-sm"
                value={filtroPeriodoEstado}
                onChange={(e) => setFiltroPeriodoEstado(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
                <option value="checkout">Período finalizado</option>
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group mb-0">
              <label className="small" htmlFor="filtroCliente">Cliente</label>
              <select
                id="filtroCliente"
                className="form-control form-control-sm"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
              >
                <option value="">Todos</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group mb-0">
              <label className="small" htmlFor="filtroVehiculo">Vehículo</label>
              <select id="filtroVehiculo" className="form-control form-control-sm" value={filtroVehiculo} onChange={(e)=>setFiltroVehiculo(e.target.value)}>
                <option value="">Todos</option>
                {vehiculos.map(v => (
                  <option key={v.id_vehiculo} value={v.id_vehiculo}>
                    {v.patente} - {v.marca} {v.modelo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group mb-0">
              <label className="small" htmlFor="filtroEmpleado">Empleado</label>
              <select id="filtroEmpleado" className="form-control form-control-sm" value={filtroEmpleado} onChange={(e)=>setFiltroEmpleado(e.target.value)}>
                <option value="">Todos</option>
                {empleados.map(e => (
                  <option key={e.id_empleado} value={e.id_empleado}>
                    {e.nombre} {e.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-md-3">
            <div className="form-group mb-0">
              <label className="small">Rango fecha inicio</label>
              <div className="d-flex gap-1">
                <input type="date" className="form-control form-control-sm mr-1" value={filtroFechaInicioDesde} onChange={(e)=>setFiltroFechaInicioDesde(e.target.value)} placeholder="Desde" />
                <input type="date" className="form-control form-control-sm" value={filtroFechaInicioHasta} onChange={(e)=>setFiltroFechaInicioHasta(e.target.value)} placeholder="Hasta" />
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="form-group mb-0">
              <label className="small">Rango fecha fin</label>
              <div className="d-flex gap-1">
                <input type="date" className="form-control form-control-sm mr-1" value={filtroFechaFinDesde} onChange={(e)=>setFiltroFechaFinDesde(e.target.value)} placeholder="Desde" />
                <input type="date" className="form-control form-control-sm" value={filtroFechaFinHasta} onChange={(e)=>setFiltroFechaFinHasta(e.target.value)} placeholder="Hasta" />
              </div>
            </div>
          </div>
          <div className="col-md-6 d-flex align-items-end justify-content-end">
            <div className="btn-group">
              <button className="btn btn-sm btn-primary" onClick={loadData}>
                <i className="fa fa-filter mr-1"></i>Aplicar filtros
              </button>
              <button className="btn btn-sm btn-secondary" onClick={clearFilters}>
                <i className="fa fa-times mr-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
