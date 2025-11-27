import React, { useState } from "react";
import { realizarCheckout } from "../../api/alquileresApi";
import modalDialogService from "../../api/modalDialog.service";

export default function ModalCheckout({
  show,
  checkoutData,
  setCheckoutData,
  empleados,
  onClose,
  onCheckoutExitoso,
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      // Validaciones
      if (!checkoutData.kmFinal || checkoutData.kmFinal === "") {
        modalDialogService.Alert("Debe ingresar el kilometraje final");
        return;
      }

      if (
        !checkoutData.idEmpleadoFinalizador ||
        checkoutData.idEmpleadoFinalizador === ""
      ) {
        modalDialogService.Alert("Debe seleccionar un empleado finalizador");
        return;
      }

      const kmFinal = parseInt(checkoutData.kmFinal, 10);
      const kmInicial = parseInt(checkoutData.kmInicial, 10);

      if (kmFinal <= kmInicial) {
        modalDialogService.Alert(
          `El kilometraje final (${kmFinal}) debe ser mayor al inicial (${kmInicial})`
        );
        return;
      }

      const kmRecorridos = kmFinal - kmInicial;
      if (kmRecorridos > 10000) {
        const confirmar = await modalDialogService.Confirm(
          `¿Está seguro? El vehículo recorrió ${kmRecorridos} km, lo cual es inusualmente alto.`
        );
        if (!confirmar) return;
      }

      setLoading(true);

      const payload = {
        km_final: kmFinal,
        id_empleado_finalizador: parseInt(
          checkoutData.idEmpleadoFinalizador,
          10
        ),
        observaciones_finalizacion:
          checkoutData.observacionesFinalizacion || null,
      };

      const response = await realizarCheckout(checkoutData.alquilerId, payload);

      // Mostrar resultado
      let mensaje = response.data.message;
      if (response.data.requiere_mantenimiento) {
        mensaje += `\n\n⚠️ El vehículo requiere mantenimiento (${kmRecorridos} km recorridos).`;
        if (response.data.mantenimiento_creado) {
          mensaje += `\nSe creó automáticamente el registro de mantenimiento #${response.data.mantenimiento_creado}.`;
        }
      }

      // Cerrar modal
      onClose();
      setCheckoutData({
        alquilerId: null,
        kmInicial: null,
        kmFinal: "",
        idEmpleadoFinalizador: "",
        observacionesFinalizacion: "",
      });

      // Notificar al padre para refrescar
      if (onCheckoutExitoso) {
        onCheckoutExitoso();
      }

      await modalDialogService.Alert(mensaje);
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.detail || "Error al realizar el checkout";
      modalDialogService.Alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setCheckoutData({
      alquilerId: null,
      kmInicial: null,
      kmFinal: "",
      idEmpleadoFinalizador: "",
      observacionesFinalizacion: "",
    });
    onClose();
  };

  if (!show || !checkoutData.alquilerId) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleCerrar}
    >
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header bg-success">
            <h5 className="modal-title">
              <i className="fa fa-check-circle mr-2"></i>
              Finalizar Alquiler
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
            <div className="row mb-3">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>ID Alquiler:</strong> {checkoutData.alquilerId}
                </p>
                <p className="mb-1">
                  <strong>Vehículo:</strong> {checkoutData.vehiculoInfo}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Fecha Inicio:</strong>{" "}
                  {checkoutData.fechaInicio &&
                    new Date(checkoutData.fechaInicio).toLocaleDateString(
                      "es-AR"
                    )}
                </p>
                <p className="mb-1">
                  <strong>Fecha Fin:</strong>{" "}
                  {checkoutData.fechaFin &&
                    new Date(checkoutData.fechaFin).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>

            <hr />

            <div className="form-group">
              <label htmlFor="kmInicial">
                <strong>Kilometraje Inicial:</strong>
              </label>
              <input
                type="number"
                className="form-control"
                id="kmInicial"
                value={checkoutData.kmInicial || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="kmFinal">
                <strong>Kilometraje Final: *</strong>
              </label>
              <input
                type="number"
                className="form-control"
                id="kmFinal"
                value={checkoutData.kmFinal}
                onChange={(e) =>
                  setCheckoutData({
                    ...checkoutData,
                    kmFinal: e.target.value,
                  })
                }
                placeholder="Ingrese el kilometraje final"
                min={checkoutData.kmInicial || 0}
                disabled={loading}
              />
            </div>

            {checkoutData.kmFinal && checkoutData.kmInicial && (
              <div className="alert alert-info">
                <strong>Kilómetros recorridos:</strong>{" "}
                {parseInt(checkoutData.kmFinal) -
                  parseInt(checkoutData.kmInicial)}{" "}
                km
                {parseInt(checkoutData.kmFinal) -
                  parseInt(checkoutData.kmInicial) >
                  10000 && (
                  <div className="text-warning mt-2">
                    <i className="fa fa-exclamation-triangle mr-1"></i>
                    Atención: Se superan los 10,000 km recomendados
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="empleadoFinalizador">
                <strong>Empleado Finalizador: *</strong>
              </label>
              <select
                className="form-control"
                id="empleadoFinalizador"
                value={checkoutData.idEmpleadoFinalizador}
                onChange={(e) =>
                  setCheckoutData({
                    ...checkoutData,
                    idEmpleadoFinalizador: e.target.value,
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

            <div className="form-group">
              <label htmlFor="observacionesFinalizacion">
                <strong>Observaciones:</strong>
              </label>
              <textarea
                className="form-control"
                id="observacionesFinalizacion"
                rows="3"
                value={checkoutData.observacionesFinalizacion}
                onChange={(e) =>
                  setCheckoutData({
                    ...checkoutData,
                    observacionesFinalizacion: e.target.value,
                  })
                }
                placeholder="Observaciones sobre la finalización del alquiler (opcional)"
                disabled={loading}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCerrar}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="fa fa-check mr-2"></i>
                  Finalizar Alquiler
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
