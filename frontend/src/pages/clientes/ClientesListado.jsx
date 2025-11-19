import React from "react";

export default function ClientesListado({
  Items,
  Consultar,
  Modificar,
  Eliminar,
  Buscar
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre completo</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((c) => (
            <tr key={c.id_cliente}>
              <td>{c.id_cliente}</td>
              <td>{c.nombre} {c.apellido}</td>
              <td>{c.dni}</td>
              <td>{c.telefono}</td>
              <td>{c.email}</td>
              <td>{c.direccion}</td>
              <td>{c.estado ? "ACTIVO" : "INACTIVO"}</td>
              <td className="text-center text-nowrap">
                <button
                  className="btn btn-sm btn-outline-primary mr-1"
                  onClick={() => Consultar(c)}
                >
                  <i className="fa fa-eye" />
                </button>

                <button
                  className="btn btn-sm btn-outline-primary mr-1"
                  onClick={() => Modificar(c)}
                >
                  <i className="fa fa-pencil-alt" />
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => Eliminar(c)}
                >
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
