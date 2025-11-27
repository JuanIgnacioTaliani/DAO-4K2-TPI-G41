import { useState } from "react";

export default function MultasDaniosBuscar({
  Alquileres,
  Alquiler,
  setAlquiler,
  Tipo,
  setTipo,
  MontoDesde,
  setMontoDesde,
  MontoHasta,
  setMontoHasta,
  FechaDesde,
  setFechaDesde,
  FechaHasta,
  setFechaHasta,
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
                  <div className="col-sm-4 col-md-2">
                    <label>Alquiler:</label>
                  </div>
                  <div className="col-sm-8 col-md-4">
                    <select
                      className="form-control"
                      value={Alquiler}
                      onChange={(e) => setAlquiler(e.target.value)}
                    >
                      <option value="">Todas</option>
                      {Alquileres.map((a) => (
                        <option key={a.id_alquiler} value={a.id_alquiler}>
                          Alquiler #{a.id_alquiler} - {a.fecha_inicio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-4 col-md-2">
                    <label>Tipo:</label>
                  </div>
                  <div className="col-sm-8 col-md-4">
                    <select
                      className="form-control"
                      value={Tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="" defaultValue>Todos</option>
                      <option value="multa">Multa</option>
                      <option value="daño">Daño</option>
                      <option value="retraso">Retraso</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-sm-4 col-md-2">
                    <label>Monto Desde:</label>
                  </div>
                  <div className="col-sm-8 col-md-4">
                    <input
                      className="form-control"
                      value={MontoDesde}
                      onChange={(e) => setMontoDesde(e.target.value)}
                      type="number"
                    />
                  </div>

                  <div className="col-sm-4 col-md-2">
                    <label>Monto Hasta:</label>
                  </div>
                  <div className="col-sm-8 col-md-4">
                    <input
                      className="form-control"
                      value={MontoHasta}
                      onChange={(e) => setMontoHasta(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-sm-4 col-md-2">
                    <label>Fecha Registro Desde:</label>
                  </div>
                  <div className="col-sm-8 col-md-4">
                    <input
                      className="form-control"
                      value={FechaDesde}
                      onChange={(e) => setFechaDesde(e.target.value)}
                      type="date"
                    />
                  </div>

                  <div className="col-sm-4 col-md-2">
                    <label>Fecha Registro Hasta:</label>
                  </div>
                  <div className="col-sm-8 col-md-4">
                    <input
                      type="date"
                      className="form-control"
                      value={FechaHasta}
                      onChange={(e) => setFechaHasta(e.target.value)}
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
                        setAlquiler("");
                        setTipo("");
                        setMontoDesde("");
                        setMontoHasta("");
                        setFechaDesde("");
                        setFechaHasta("");
                        Buscar({
                          alquiler: "",
                          tipo: "",
                          montoDesde: "",
                          montoHasta: "",
                          fechaDesde: "",
                          fechaHasta: "",
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
