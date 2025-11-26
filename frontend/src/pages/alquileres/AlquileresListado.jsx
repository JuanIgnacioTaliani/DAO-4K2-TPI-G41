import React from "react";

export default function AlquileresListado({
  Items,
  Buscar,
  Consultar,
  Modificar,
  Eliminar,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>ID</th>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Empleado</th>
            <th style={{ width: "110px" }}>Fecha Inicio</th>
            <th style={{ width: "110px" }}>Fecha Fin</th>
            <th style={{ width: "100px" }}>Costo Base</th>
            <th style={{ width: "100px" }}>Costo Total</th>
            <th style={{ width: "80px" }}>Multas</th>
            <th style={{ width: "100px" }}>Estado</th>
            <th style={{ width: "180px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((a) => (
            <tr key={a.id_alquiler}>
              <td>{a.id_alquiler}</td>
              <td>
                {a.cliente.nombre} {a.cliente.apellido}
              </td>
              <td>
                {a.vehiculo.patente} - {a.vehiculo.marca} {a.vehiculo.modelo}
              </td>
              <td>
                {a.empleado.nombre} {a.empleado.apellido}
              </td>
              <td>{a.fecha_inicio}</td>
              <td>{a.fecha_fin}</td>
              <td>$ {a.costo_base}</td>
              <td>$ {a.costo_total}</td>
              <td>Boton Multas</td>
              <td>{a.estado}</td>
              <td>Acciones</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
