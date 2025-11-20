import React from "react";


export default function VehiculosListado({ Items, Consultar, Modificar, Eliminar }) {
  const getEstadoMantenimiento = (fecha_inicio, fecha_fin) => {
    if (!fecha_fin) return "En Curso";
    const hoy = new Date();
    const fin = new Date(fecha_fin);
    return fin < hoy ? "Finalizado" : "En Curso";
  };
  
  const getBadgeEstado = (fecha_inicio, fecha_fin) => {
    const estado = getEstadoMantenimiento(fecha_inicio, fecha_fin);
    const clase = estado === "En Curso" ? "badge-warning" : "badge-success";
    return <span className={`badge ${clase}`}>{estado}</span>;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover table-sm table-bordered table-striped">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>ID</th>
            <th>Vehículo</th>
            <th style={{ width: "110px" }}>Fecha Inicio</th>
            <th style={{ width: "110px" }}>Fecha Fin</th>
            <th style={{ width: "100px" }}>Tipo</th>
            <th>Descripción</th>
            <th style={{ width: "100px" }}>Costo</th>
            <th>Responsable</th>
            <th style={{ width: "100px" }}>Estado</th>
            <th style={{ width: "120px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((m) => (
            <tr key={m.id_mantenimiento}>
              <td>{m.id_mantenimiento}</td>
              <td>{m.vehiculo.marca} {m.vehiculo.modelo} ({m.vehiculo.patente})</td>
              <td>{m.fecha_inicio}</td>
              <td>{m.fecha_fin || "-"}</td>
              <td>
                {m.tipo ? (
                  <span
                    className={`badge ${m.tipo === "preventivo"
                      ? "badge-info"
                      : "badge-warning"
                      }`}
                  >
                    {m.tipo}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="small">{m.descripcion || "-"}</td>
              <td className="text-right">
                {m.costo ? `$${parseFloat(m.costo).toFixed(2)}` : "-"}
              </td>
              <td className="small">
                {m.empleado.nombre} {m.empleado.apellido}
              </td>
              <td>{getBadgeEstado(m.fecha_inicio, m.fecha_fin)}</td>
              <td className="text-center text-nowrap">
                <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => Consultar(m)}>
                  <i className="fa fa-eye" />
                </button>
                <button className="btn btn-sm btn-outline-primary mr-1" onClick={() => Modificar(m)}>
                  <i className="fa fa-pencil-alt" />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => Eliminar(m)}>
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
