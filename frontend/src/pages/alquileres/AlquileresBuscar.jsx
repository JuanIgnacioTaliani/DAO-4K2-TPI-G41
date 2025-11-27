import { useState } from "react";

import { ClienteSelect } from "../../components/Selects";
import { VehiculoSelect } from "../../components/Selects";
import { EmpleadosSelect } from "../../components/Selects";

export default function AlquileresBuscar({
  Estado,
  setEstado,
  Clientes,
  Cliente,
  setCliente,
  Vehiculos,
  Vehiculo,
  setVehiculo,
  Empleados,
  Empleado,
  setEmpleado,
  FechaInicioDesde,
  setFechaInicioDesde,
  FechaInicioHasta,
  setFechaInicioHasta,
  FechaFinDesde,
  setFechaFinDesde,
  FechaFinHasta,
  setFechaFinHasta,
  Buscar,
  Agregar,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="col-lg-12 col-md-12">
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
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
          <div>
            <button type="button" className="btn btn-primary" onClick={Agregar}>
              <i className="fa fa-plus" /> Agregar
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="card-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                Buscar();
              }}
            >
              <div className="container-fluid">
                <div className="row">
                  <div className="col-sm-2 col-md-2">
                    <label>Estado:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    <select
                      className="form-control"
                      value={Estado}
                      onChange={(e) => setEstado(e.target.value)}
                    >
                      <option value="">Cualquiera</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_curso">En curso</option>
                      <option value="checkout">Período finalizado</option>
                      <option value="finalizado">Cerrado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="col-sm-2 col-md-2">
                    <label>Cliente:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    {/** Searchable select using react-select */}
                    <ClienteSelect
                      Clientes={Clientes}
                      Cliente={Cliente}
                      setCliente={setCliente}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-sm-2 col-md-2">
                    <label>Vehículo:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    {/** Searchable select using react-select */}
                    <VehiculoSelect
                      Vehiculos={Vehiculos}
                      Vehiculo={Vehiculo}
                      setVehiculo={setVehiculo}
                    />
                  </div>
                  <div className="col-sm-2 col-md-2">
                    <label>Empleado:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    {/** Searchable select using react-select */}
                    <EmpleadosSelect
                      Empleados={Empleados}
                      Empleado={Empleado}
                      setEmpleado={setEmpleado}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-sm-12 col-md-12">
                    <h5>Rango Fecha Inicio:</h5>
                  </div>
                  <div className="col-sm-2 col-md-2">
                    <label>Desde:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={FechaInicioDesde}
                      onChange={(e) => setFechaInicioDesde(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-2 col-md-2">
                    <label>Hasta:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={FechaInicioHasta}
                      onChange={(e) => setFechaInicioHasta(e.target.value)}
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-sm-12 col-md-12">
                    <h5>Rango Fecha Fin:</h5>
                  </div>
                  <div className="col-sm-2 col-md-2">
                    <label>Desde:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={FechaFinDesde}
                      onChange={(e) => setFechaFinDesde(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-2 col-md-2">
                    <label>Hasta:</label>
                  </div>
                  <div className="col-sm-4 col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={FechaFinHasta}
                      onChange={(e) => setFechaFinHasta(e.target.value)}
                    />
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col text-center pb-3">
                    <button
                      type="button"
                      className="btn btn-primary mr-1"
                      onClick={() => Buscar()}
                    >
                      <i className="fa fa-search" /> Buscar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary mr-1"
                      onClick={() => {
                        setEstado("");
                        setCliente("");
                        setVehiculo("");
                        setEmpleado("");
                        setFechaInicioDesde("");
                        setFechaInicioHasta("");
                        setFechaFinDesde("");
                        setFechaFinHasta("");
                        Buscar({
                          estado: "",
                          cliente: "",
                          vehiculo: "",
                          empleado: "",
                          fechaInicioDesde: "",
                          fechaInicioHasta: "",
                          fechaFinDesde: "",
                          fechaFinHasta: ""
                        });
                      }}
                    >
                      <i className="fa fa-eraser" /> Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
