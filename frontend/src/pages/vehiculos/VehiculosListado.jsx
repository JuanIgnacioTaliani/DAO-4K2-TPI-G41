import React from "react";
import { mockCategoriasVehiculo, mockEstadosVehiculo } from "../../api/mockData";

const getCategoriaNombre = (id) => mockCategoriasVehiculo.find((c) => c.id_categoria === id)?.nombre ?? "";
const getEstadoNombre = (id) => mockEstadosVehiculo.find((s) => s.id_estado === id)?.nombre ?? "";

export default function VehiculosListado({ Items, Consultar, Modificar, Eliminar }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patente</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>KM</th>
            <th>Últ. mantenimiento</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((v) => (
            <tr key={v.id_vehiculo}>
              <td>{v.id_vehiculo}</td>
              <td>{v.patente}</td>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>{v.anio}</td>
              <td>{getCategoriaNombre(v.id_categoria)}</td>
              <td>{getEstadoNombre(v.id_estado)}</td>
              <td>{v.km_actual}</td>
              <td>{v.fecha_ultimo_mantenimiento}</td>
              <td className="text-center text-nowrap">
                <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => Consultar(v)}>
                  <i className="fa fa-eye" />
                </button>
                <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => Modificar(v)}>
                  <i className="fa fa-pencil-alt" />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => Eliminar(v)}>
                  <i className="fa fa-trash" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
