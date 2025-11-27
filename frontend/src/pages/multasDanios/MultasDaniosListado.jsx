export default function MultasDaniosListado({
  Items,
  Consultar,
  Modificar,
  Eliminar,
}) {
  const formatFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    return (
      fecha.toLocaleDateString("es-AR") +
      " " +
      fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    );
  };
  return (
    <div className="table-responsive">
      <table className="table table-dark table-striped table-hover table-bordered table-sm mb-0">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>ID</th>
            <th>Alquiler</th>
            <th style={{ width: "100px" }}>Tipo</th>
            <th>Descripción</th>
            <th style={{ width: "100px" }}>Monto</th>
            <th style={{ width: "150px" }}>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Items.map((md) => (
            <tr key={md.id_multa_danio}>
              <td>{md.id_multa_danio}</td>
              <td>{`Alquiler #${md.id_alquiler} - ${md.alquiler.fecha_inicio} - a ${md.alquiler.fecha_fin}`}</td>
              <td>
                <span
                  className={`badge ${
                    md.tipo === "multa"
                      ? "badge-danger"
                      : md.tipo === "daño"
                      ? "badge-warning"
                      : md.tipo === "retraso"
                      ? "badge-info"
                      : "badge-secondary"
                  }`}
                >
                  {md.tipo.toUpperCase()}
                </span>
              </td>
              <td>{md.descripcion || "-"}</td>
              <td className="text-right font-weight-bold">${md.monto}</td>
              <td>{formatFecha(md.fecha_registro)}</td>
              <td className="text-center">
                <button
                  className="btn btn-sm btn-outline-primary mr-1"
                  onClick={() => Consultar(v)}
                >
                  <i className="fa fa-eye" />
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary mr-1"
                  onClick={() => Modificar(md)}
                >
                  <i className="fa fa-pencil-alt"></i>
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => Eliminar(md)}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
