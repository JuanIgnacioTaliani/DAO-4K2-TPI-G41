import React from "react";

export default function CategoriasBuscar({
  Nombre,
  setNombre,
  TarifaDesde,
  setTarifaDesde,
  TarifaHasta,
  setTarifaHasta,
  Buscar,
  Agregar,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        Buscar();
      }}
    >
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-4 col-md-2">
            <label>Tarifa desde:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input
              className="form-control"
              value={TarifaDesde}
              onChange={(e) => setTarifaDesde(e.target.value)}
            />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Tarifa hasta:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input
              className="form-control"
              value={TarifaHasta}
              onChange={(e) => setTarifaHasta(e.target.value)}
            />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>Nombre:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input
              className="form-control"
              value={Nombre}
              onChange={(e) => setNombre(e.target.value)}
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
                setNombre("");
                setTarifaDesde("");
                setTarifaHasta("");
                Buscar({ nombre: "", tarifa_desde: "", tarifa_hasta: "" });
              }}
            >
              <i className="fa fa-eraser" /> Limpiar
            </button>

            <button type="button" className="btn btn-primary" onClick={Agregar}>
              <i className="fa fa-plus" /> Agregar
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
