import React from "react";

export default function ClientesBuscar({
  Nombre, setNombre,
  Apellido, setApellido,
  Dni, setDni,
  Estado, setEstado,
  Buscar, Agregar
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
            <label>Nombre:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input
              className="form-control"
              value={Nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Apellido:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input
              className="form-control"
              value={Apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </div>

        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>DNI:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input
              className="form-control"
              value={Dni}
              onChange={(e) => setDni(e.target.value)}
            />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Estado:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <select
              className="form-control"
              value={Estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value={""}>Todos</option>
              <option value={false}>INACTIVO</option>
              <option value={true}>ACTIVO</option>
            </select>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col text-center pb-3">
            <button type="button" className="btn btn-primary mr-1" onClick={() => Buscar()}>
              <i className="fa fa-search" /> Buscar
            </button>
            <button
              type="button"
              className="btn btn-secondary mr-1"
              onClick={() => {
                setNombre("");
                setApellido("");
                setDni("");
                setEstado("");
                Buscar({ nombre: "", apellido: "", dni: "", estado: "" });
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
