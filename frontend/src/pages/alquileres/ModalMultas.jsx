import React from "react";

export default function ModalMultas({ show, multasModalData = [], onClose }) {
  const closeMultasModal = (e) => {
    if (e) e.stopPropagation();
    onClose && onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={closeMultasModal}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-warning">
            <h5 className="modal-title">
              <i className="fa fa-exclamation-triangle mr-2"></i>
              Multas y Daños
            </h5>
            <button type="button" className="close" onClick={closeMultasModal}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {(!multasModalData || multasModalData.length === 0) ? (
              <div className="alert alert-info mb-0">No hay multas o daños registrados para este alquiler.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="thead-dark">
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Descripción</th>
                      <th>Monto</th>
                      <th>Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multasModalData.map((md) => (
                      <tr key={md.id_multa_danio}>
                        <td>{md.id_multa_danio}</td>
                        <td>
                          <span className={`badge ${md.tipo === "multa" ? "badge-danger" : md.tipo === "daño" ? "badge-warning" : md.tipo === "retraso" ? "badge-info" : "badge-secondary"}`}>
                            {String(md.tipo || "").toUpperCase()}
                          </span>
                        </td>
                        <td>{md.descripcion || "-"}</td>
                        <td className="text-right font-weight-bold">${md.monto}</td>
                        <td>
                          {md.fecha_registro ? (
                            <>
                              {new Date(md.fecha_registro).toLocaleDateString("es-AR")} {" "}
                              {new Date(md.fecha_registro).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                            </>
                          ) : (
                            ""
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-active">
                      <td colSpan="3" className="text-right">
                        <strong>Total:</strong>
                      </td>
                      <td className="text-right font-weight-bold">
                        <strong>
                          ${multasModalData
                            .reduce((sum, md) => sum + parseFloat(md.monto || 0), 0)
                            .toFixed(2)}
                        </strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeMultasModal}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
