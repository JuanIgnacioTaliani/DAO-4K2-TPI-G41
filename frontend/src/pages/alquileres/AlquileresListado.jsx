import React from "react";

export default function AlquileresListado({
  alquileres,
  loading,
  clientes,
  vehiculos,
  empleados,
  multasCounts,
  handleVerMultas,
  goToMultasPage,
  handleAbrirCheckout,
  handleEdit,
  handleAbrirCancelar,
  handleDelete,
  getClienteNombre,
  getVehiculoInfo,
  getEmpleadoNombre,
  getBadgeEstado,
  calcularEstado,
}) {
  return (
    <div className="card-body p-0">
      {alquileres.length === 0 && !loading ? (
        <div className="p-3">
          <div className="alert alert-info mb-0">No hay alquileres cargados.</div>
        </div>
      ) : (
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
              {alquileres.map((a) => {
                const estadoReal = (a.estado === "FINALIZADO" || a.estado === "CANCELADO")
                  ? a.estado
                  : calcularEstado(a.fecha_inicio, a.fecha_fin).estado;

                return (
                  <tr key={a.id_alquiler}>
                    <td>{a.id_alquiler}</td>
                    <td>{getClienteNombre(a.id_cliente)}</td>
                    <td>{getVehiculoInfo(a.id_vehiculo)}</td>
                    <td>{getEmpleadoNombre(a.id_empleado)}</td>
                    <td>{a.fecha_inicio}</td>
                    <td>{a.fecha_fin}</td>
                    <td>${a.costo_base}</td>
                    <td>${a.costo_total}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className={`btn btn-sm ${multasCounts[a.id_alquiler] > 0 ? "btn-warning" : "btn-outline-secondary"}`}
                        onClick={() => handleVerMultas(a.id_alquiler)}
                        title="Ver multas/daños"
                      >
                        <i className="fa fa-exclamation-triangle mr-1"></i>
                        {multasCounts[a.id_alquiler] || 0}
                      </button>
                    </td>
                    <td>{getBadgeEstado(estadoReal)}</td>
                    <td className="text-center">
                      <button type="button" className="btn btn-sm btn-outline-warning mr-1" onClick={() => goToMultasPage(a.id_alquiler)} title="Ir a Multas/Daños">
                        <i className="fa fa-file-invoice-dollar"></i>
                      </button>{" "}
                      {estadoReal === "CHECKOUT" && (
                        <>
                          <button type="button" className="btn btn-sm btn-outline-success mr-1" onClick={() => handleAbrirCheckout(a)} title="Finalizar Alquiler">
                            <i className="fa fa-check-circle"></i>
                          </button>{" "}
                        </>
                      )}
                      <button type="button" className="btn btn-sm btn-outline-primary mr-1" onClick={() => handleEdit(a)}>
                        <i className="fa fa-pencil-alt"></i>
                      </button>{" "}
                      {(estadoReal === "PENDIENTE" || estadoReal === "EN_CURSO") && (
                        <>
                          <button type="button" className="btn btn-sm btn-outline-danger mr-1" onClick={() => handleAbrirCancelar(a)} title="Cancelar Alquiler">
                            <i className="fa fa-ban"></i>
                          </button>{" "}
                        </>
                      )}
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id_alquiler)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
