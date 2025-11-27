import React, { useState } from "react";
import { cancelarAlquiler } from "../../api/alquileresApi";
import modalDialogService from "../../api/modalDialog.service";

export default function ModalCancelacion({
  show,
  cancelarData,
  setCancelarData,
  empleados,
  onClose,
  onCancelarExitoso,
}) {
  const [loading, setLoading] = useState(false);

  const handleCancelar = async () => {
    // Validaciones
    if (!cancelarData.motivoCancelacion.trim()) {
      modalDialogService.Alert("Por favor ingrese el motivo de cancelación");
      return;
    }

    if (!cancelarData.idEmpleadoCancelador) {
      modalDialogService.Alert("Por favor seleccione el empleado que cancela");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        motivo_cancelacion: cancelarData.motivoCancelacion,
        id_empleado_cancelador: parseInt(cancelarData.idEmpleadoCancelador),
      };

      const response = await cancelarAlquiler(cancelarData.alquilerId, payload);

      if (response.data?.success) {
        // Cerrar modal y refrescar
        onClose();
        setCancelarData({
          alquilerId: null,
          motivoCancelacion: "",
          idEmpleadoCancelador: "",
        });

        // Notificar al padre para refrescar
        if (onCancelarExitoso) {
          onCancelarExitoso();
        }

        modalDialogService.Alert(
          `Alquiler cancelado exitosamente. Estado anterior: ${response.data.estado_anterior}`
        );
      } else {
        modalDialogService.Alert("No se pudo cancelar el alquiler");
      }
    } catch (error) {
      console.error("Error al cancelar alquiler:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al cancelar el alquiler";
      modalDialogService.Alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setCancelarData({
      alquilerId: null,
      motivoCancelacion: "",
      idEmpleadoCancelador: "",
    });
    onClose();
  };

  if (!show || !cancelarData.alquilerId) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleCerrar}
    >
      <div
        className="modal-dialog modal-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-danger">
            <h5 className="modal-title">
              <i className="fa fa-ban mr-2"></i>
              Cancelar Alquiler
            </h5>
            <button
              type="button"
              className="close"
              onClick={handleCerrar}
              disabled={loading}
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="alert alert-warning">
              <i className="fa fa-exclamation-triangle mr-2"></i>
              ¿Está seguro de que desea cancelar este alquiler? Esta acción no
              se puede deshacer.
            </div>

            <div className="form-group">
              <label htmlFor="motivoCancelacion">
                <i className="fa fa-comment mr-1"></i>
                Motivo de cancelación <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                id="motivoCancelacion"
                rows="4"
                value={cancelarData.motivoCancelacion}
                onChange={(e) =>
                  setCancelarData({
                    ...cancelarData,
                    motivoCancelacion: e.target.value,
                  })
                }
                placeholder="Ingrese el motivo de la cancelación del alquiler"
                disabled={loading}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="empleadoCancelador">
                <i className="fa fa-user-tie mr-1"></i>
                Empleado que cancela <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="empleadoCancelador"
                value={cancelarData.idEmpleadoCancelador}
                onChange={(e) =>
                  setCancelarData({
                    ...cancelarData,
                    idEmpleadoCancelador: e.target.value,
                  })
                }
                disabled={loading}
              >
                <option value="">Seleccione un empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre} {emp.apellido} - {emp.legajo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCerrar}
              disabled={loading}
            >
              Volver
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelar}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Cancelando...
                </>
              ) : (
                <>
                  <i className="fa fa-ban mr-2"></i>
                  Confirmar Cancelación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
