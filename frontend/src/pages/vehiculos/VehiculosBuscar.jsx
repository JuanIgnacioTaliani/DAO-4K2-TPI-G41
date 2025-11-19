import React from "react";
import { mockCategoriasVehiculo, mockEstadosVehiculo } from "../../api/mockData";

export default function VehiculosBuscar({
  Patente,
  setPatente,
  Marca,
  setMarca,
  Modelo,
  setModelo,
  IdCategoria,
  setIdCategoria,
  IdEstado,
  setIdEstado,
  AnioDesde,
  setAnioDesde,
  AnioHasta,
  setAnioHasta,
  KmDesde,
  setKmDesde,
  KmHasta,
  setKmHasta,
  FumDesde,
  setFumDesde,
  FumHasta,
  setFumHasta,
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
            <label>Patente:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input className="form-control" value={Patente} onChange={(e) => setPatente(e.target.value)} />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Marca:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input className="form-control" value={Marca} onChange={(e) => setMarca(e.target.value)} />
          </div>

        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>Modelo:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input className="form-control" value={Modelo} onChange={(e) => setModelo(e.target.value)} />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Categoría:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <select className="form-control" value={IdCategoria} onChange={(e) => setIdCategoria(e.target.value)}>
              <option value="">Todas</option>
              {mockCategoriasVehiculo.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>Estado:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <select className="form-control" value={IdEstado} onChange={(e) => setIdEstado(e.target.value)}>
              <option value="">Todos</option>
              {mockEstadosVehiculo.map((s) => (
                <option key={s.id_estado} value={s.id_estado}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>Año desde:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input type="number" className="form-control" value={AnioDesde} onChange={(e) => setAnioDesde(e.target.value)} />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Año hasta:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input type="number" className="form-control" value={AnioHasta} onChange={(e) => setAnioHasta(e.target.value)} />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>KM desde:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input type="number" className="form-control" value={KmDesde} onChange={(e) => setKmDesde(e.target.value)} />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>KM hasta:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input type="number" className="form-control" value={KmHasta} onChange={(e) => setKmHasta(e.target.value)} />
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-sm-4 col-md-2">
            <label>Últ. mant. desde:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input type="date" className="form-control" value={FumDesde} onChange={(e) => setFumDesde(e.target.value)} />
          </div>

          <div className="col-sm-4 col-md-2">
            <label>Últ. mant. hasta:</label>
          </div>
          <div className="col-sm-8 col-md-4">
            <input type="date" className="form-control" value={FumHasta} onChange={(e) => setFumHasta(e.target.value)} />
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
                setPatente("");
                setMarca("");
                setModelo("");
                setIdCategoria("");
                setIdEstado("");
                setAnioDesde("");
                setAnioHasta("");
                setKmDesde("");
                setKmHasta("");
                setFumDesde("");
                setFumHasta("");
                Buscar({
                  patente: "",
                  marca: "",
                  modelo: "",
                  id_categoria: "",
                  id_estado: "",
                  anio_desde: "",
                  anio_hasta: "",
                  km_desde: "",
                  km_hasta: "",
                  fecha_ultimo_mantenimiento_desde: "",
                  fecha_ultimo_mantenimiento_hasta: "",
                });
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
