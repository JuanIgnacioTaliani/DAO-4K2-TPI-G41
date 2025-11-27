import React from "react";

export default function AlquileresListado({
  Items,
  Empleados,
  Consultar,
  Modificar,
  Eliminar,
  handleAbrirCancelar,
  handleAbrirCheckout,
}) {
  const getBadgeEstado = (estado) => {
    const estados = {
      PENDIENTE: { texto: "Reserva", clase: "badge-warning" },
      EN_CURSO: { texto: "Alquiler Activo", clase: "badge-primary" },
      CHECKOUT: { texto: "Período Finalizado", clase: "badge-info" },
      FINALIZADO: { texto: "Alquiler Finalizado", clase: "badge-success" },
      CANCELADO: { texto: "Cancelado", clase: "badge-danger" },
    };

    const info = estados[estado] || { texto: estado, clase: "badge-secondary" };
    return <span className={`badge ${info.clase}`}>{info.texto}</span>;
  };
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
              <td>{getBadgeEstado(a.estado)}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary mr-1"
                  onClick={() => Modificar(a)}
                >
                  <i className="fa fa-pencil-alt" />
                </button>{" "}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => Eliminar(a)}
                >
                  <i className="fa fa-trash" />
                </button>{" "}
                {a.estado === "CHECKOUT" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success mr-1"
                      onClick={() => handleAbrirCheckout(a)}
                      title="Finalizar Alquiler"
                    >
                      <i className="fa fa-check-circle"></i>
                    </button>{" "}
                  </>
                )}

                {(a.estado === "PENDIENTE" || a.estado === "EN_CURSO") && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mr-1"
                      onClick={() => handleAbrirCancelar(a, Empleados)}
                      title="Cancelar Alquiler"
                    >
                      <i className="fa fa-ban"></i>
                    </button>{" "}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
