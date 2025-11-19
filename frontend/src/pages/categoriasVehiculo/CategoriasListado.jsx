import React from "react";

const formatPeso = (value) => {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value ?? "";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(num);
};

export default function CategoriasListado({ Items, Consultar, Modificar, Eliminar }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Tarifa diaria</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((c) => (
            <tr key={c.id_categoria}>
              <td>{c.id_categoria}</td>
              <td>{c.nombre}</td>
              <td>{c.descripcion}</td>
              <td>{formatPeso(c.tarifa_diaria)}</td>
              <td className="text-center text-nowrap">
                <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => Consultar(c)}>
                  <i className="fa fa-eye" />
                </button>
                <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => Modificar(c)}>
                  <i className="fa fa-pencil-alt" />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => Eliminar(c)}>
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
