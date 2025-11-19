import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import modalDialogService from "../../api/modalDialog.service";

import {
  getAlquileres,
  getAlquiler,
  createAlquiler,
  updateAlquiler,
  deleteAlquiler,
  verificarDisponibilidad,
  realizarCheckout,
  cancelarAlquiler,
} from "../../api/alquileresApi";
import { getClientes } from "../../api/clientesApi";
import { getVehiculosConDisponibilidad } from "../../api/vehiculosApi";
import { getEmpleados } from "../../api/empleadosApi";
import { getCategorias } from "../../api/categoriasVehiculoApi";
import { getMultasDaniosByAlquiler } from "../../api/multasDaniosApi";

import AlquileresBuscar from "./AlquileresBuscar";
import AlquileresListado from "./AlquileresListado";
import AlquileresRegistro from "./AlquileresRegistro";

const emptyForm = {
  id_cliente: "",
  id_vehiculo: "",
  id_empleado: "",
  fecha_inicio: "",
  fecha_fin: "",
  observaciones: "",
};

export default function Alquileres() {
  const { setTitulo } = useOutletContext();
  const navigate = useNavigate();
  const [alquileres, setAlquileres] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [multasCounts, setMultasCounts] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [disponibilidadMsg, setDisponibilidadMsg] = useState("");
  const [costoBaseCalculado, setCostoBaseCalculado] = useState(0);
  const [diasAlquiler, setDiasAlquiler] = useState(0);
  const [showMultasModal, setShowMultasModal] = useState(false);
  const [multasModalData, setMultasModalData] = useState([]);

  // Checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    alquilerId: null,
    kmInicial: null,
    kmFinal: "",
    idEmpleadoFinalizador: "",
    observacionesFinalizacion: "",
  });
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Cancel
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [cancelarData, setCancelarData] = useState({
    alquilerId: null,
    motivoCancelacion: "",
    idEmpleadoCancelador: "",
  });
  const [loadingCancelar, setLoadingCancelar] = useState(false);

  // filtros
  const [filtroPeriodoEstado, setFiltroPeriodoEstado] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroVehiculo, setFiltroVehiculo] = useState("");
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroFechaInicioDesde, setFiltroFechaInicioDesde] = useState("");
  const [filtroFechaInicioHasta, setFiltroFechaInicioHasta] = useState("");
  const [filtroFechaFinDesde, setFiltroFechaFinDesde] = useState("");
  const [filtroFechaFinHasta, setFiltroFechaFinHasta] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      if (filtroFechaInicioDesde && filtroFechaInicioHasta && filtroFechaInicioDesde > filtroFechaInicioHasta) {
        setErrorMsg("Rango de fecha inicio inválido: 'desde' debe ser menor o igual a 'hasta'");
        setLoading(false);
        return;
      }
      if (filtroFechaFinDesde && filtroFechaFinHasta && filtroFechaFinDesde > filtroFechaFinHasta) {
        setErrorMsg("Rango de fecha fin inválido: 'desde' debe ser menor o igual a 'hasta'");
        setLoading(false);
        return;
      }

      const params = {};
      if (filtroPeriodoEstado) params.periodo_estado = filtroPeriodoEstado;
      if (filtroCliente) params.id_cliente = parseInt(filtroCliente, 10);
      if (filtroVehiculo) params.id_vehiculo = parseInt(filtroVehiculo, 10);
      if (filtroEmpleado) params.id_empleado = parseInt(filtroEmpleado, 10);
      if (filtroFechaInicioDesde) params.fecha_inicio_desde = filtroFechaInicioDesde;
      if (filtroFechaInicioHasta) params.fecha_inicio_hasta = filtroFechaInicioHasta;
      if (filtroFechaFinDesde) params.fecha_fin_desde = filtroFechaFinDesde;
      if (filtroFechaFinHasta) params.fecha_fin_hasta = filtroFechaFinHasta;

      const [aRes, cRes, vRes, eRes, catRes] = await Promise.all([
        getAlquileres(params),
        getClientes(),
        getVehiculosConDisponibilidad(),
        getEmpleados(),
        getCategorias(),
      ]);
      setAlquileres(aRes.data);
      setClientes(cRes.data);
      setVehiculos(vRes.data);
      setEmpleados(eRes.data);
      setCategorias(catRes.data);

      const counts = {};
      for (const alquiler of aRes.data) {
        try {
          const multasRes = await getMultasDaniosByAlquiler(alquiler.id_alquiler);
          counts[alquiler.id_alquiler] = multasRes.data.length;
        } catch (err) {
          counts[alquiler.id_alquiler] = 0;
        }
      }
      setMultasCounts(counts);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al cargar alquileres / clientes / vehículos / empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitulo("Gestión de Alquileres");
    loadData();
  }, [setTitulo]);

  useEffect(() => {
    const verificarVehiculosDisponibles = async () => {
      if (!form.fecha_inicio || !form.fecha_fin) {
        setVehiculosDisponibles([]);
        setDisponibilidadMsg("");
        return;
      }

      setLoadingDisponibilidad(true);
      setDisponibilidadMsg("");

      try {
        const disponibilidadPromises = vehiculos.map(async (vehiculo) => {
          try {
            const res = await verificarDisponibilidad(vehiculo.id_vehiculo, form.fecha_inicio, form.fecha_fin);
            return {
              ...vehiculo,
              disponible: res.data.disponible,
              conflictos: res.data.conflictos || [],
            };
          } catch (err) {
            console.error(`Error verificando vehículo ${vehiculo.id_vehiculo}:`, err);
            return { ...vehiculo, disponible: false, conflictos: [] };
          }
        });

        const resultados = await Promise.all(disponibilidadPromises);
        const disponibles = resultados.filter((v) => v.disponible);
        setVehiculosDisponibles(resultados);

        if (disponibles.length === 0) {
          setDisponibilidadMsg("⚠️ No hay vehículos disponibles en el período seleccionado");
        } else {
          setDisponibilidadMsg(`✅ ${disponibles.length} vehículo${disponibles.length !== 1 ? 's' : ''} disponible${disponibles.length !== 1 ? 's' : ''} en el período seleccionado`);
        }

        if (form.id_vehiculo) {
          const vehiculoSeleccionado = resultados.find((v) => v.id_vehiculo === parseInt(form.id_vehiculo));
          if (vehiculoSeleccionado && !vehiculoSeleccionado.disponible) {
            setForm((prev) => ({ ...prev, id_vehiculo: "" }));
            setCostoBaseCalculado(0);
            setDiasAlquiler(0);
          }
        }
      } catch (err) {
        console.error("Error al verificar disponibilidad:", err);
        setDisponibilidadMsg("❌ Error al verificar disponibilidad de vehículos");
      } finally {
        setLoadingDisponibilidad(false);
      }
    };

    if (editingId === null || (form.fecha_inicio && form.fecha_fin)) {
      verificarVehiculosDisponibles();
    }
  }, [form.fecha_inicio, form.fecha_fin, vehiculos, editingId]);

  useEffect(() => {
    if (form.fecha_inicio && form.fecha_fin && form.id_vehiculo) {
      const fechaInicio = new Date(form.fecha_inicio);
      const fechaFin = new Date(form.fecha_fin);
      const diffTime = Math.abs(fechaFin - fechaInicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      const vehiculo = vehiculos.find((v) => v.id_vehiculo === parseInt(form.id_vehiculo));
      if (vehiculo) {
        const categoria = categorias.find((c) => c.id_categoria === vehiculo.id_categoria);
        if (categoria) {
          const tarifaDiaria = parseFloat(categoria.tarifa_diaria);
          const costoBase = tarifaDiaria * diffDays;
          setCostoBaseCalculado(costoBase);
          setDiasAlquiler(diffDays);
        }
      }
    } else {
      setCostoBaseCalculado(0);
      setDiasAlquiler(0);
    }
  }, [form.fecha_inicio, form.fecha_fin, form.id_vehiculo, vehiculos, categorias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fecha_inicio") {
      setForm((prev) => ({ ...prev, [name]: value, fecha_fin: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getFechaMinima = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(form.fecha_inicio);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(form.fecha_fin);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaFin < fechaInicio) {
      setErrorMsg("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    let estadoCalculado;
    if (hoy < fechaInicio) {
      estadoCalculado = "PENDIENTE";
    } else if (hoy >= fechaInicio && hoy <= fechaFin) {
      estadoCalculado = "EN_CURSO";
    } else {
      estadoCalculado = "FINALIZADO";
    }

    const payload = {
      id_cliente: form.id_cliente ? parseInt(form.id_cliente, 10) : null,
      id_vehiculo: form.id_vehiculo ? parseInt(form.id_vehiculo, 10) : null,
      id_empleado: form.id_empleado ? parseInt(form.id_empleado, 10) : null,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      costo_base: costoBaseCalculado,
      costo_total: costoBaseCalculado,
      estado: estadoCalculado,
      observaciones: form.observaciones || null,
    };

    try {
      if (!payload.id_cliente || !payload.id_vehiculo || !payload.id_empleado) {
        setErrorMsg("Debés seleccionar cliente, vehículo y empleado");
        return;
      }

      if (!payload.fecha_inicio || !payload.fecha_fin) {
        setErrorMsg("Debés ingresar fecha de inicio y fin");
        return;
      }

      if (editingId === null) {
        await createAlquiler(payload);
        modalDialogService.Alert("Alquiler creado correctamente");
      } else {
        await updateAlquiler(editingId, payload);
        modalDialogService.Alert("Alquiler actualizado correctamente");
      }

      setForm(emptyForm);
      setEditingId(null);
      setCostoBaseCalculado(0);
      setDiasAlquiler(0);
      await loadData();
    } catch (err) {
      console.error(err);
      const apiMsg = err?.response?.data?.detail;
      modalDialogService.Alert(apiMsg || "Error al guardar el alquiler");
    }
  };

  const handleEdit = (a) => {
    setEditingId(a.id_alquiler);
    setForm({
      id_cliente: a.id_cliente ?? "",
      id_vehiculo: a.id_vehiculo ?? "",
      id_empleado: a.id_empleado ?? "",
      fecha_inicio: a.fecha_inicio ?? "",
      fecha_fin: a.fecha_fin ?? "",
      observaciones: a.observaciones ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrorMsg("");
    setCostoBaseCalculado(0);
    setDiasAlquiler(0);
  };

  const handleDelete = async (id) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este Alquiler?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteAlquiler(id);
          await loadData();
        } catch (err) {
          console.error(err);
          const apiMsg = err?.response?.data?.detail;
          setErrorMsg(apiMsg || "Error al eliminar el Alquiler");
        }
      }
    );
  };

  const getClienteNombre = (id_cliente) => {
    const cliente = clientes.find((c) => c.id_cliente === id_cliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : "";
  };

  const getVehiculoInfo = (id_vehiculo) => {
    const vehiculo = vehiculos.find((v) => v.id_vehiculo === id_vehiculo);
    return vehiculo ? `${vehiculo.patente} - ${vehiculo.marca} ${vehiculo.modelo}` : "";
  };

  const getEmpleadoNombre = (id_empleado) => {
    const empleado = empleados.find((e) => e.id_empleado === id_empleado);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : "";
  };

  const handleVerMultas = async (idAlquiler) => {
    try {
      const multasRes = await getMultasDaniosByAlquiler(idAlquiler);
      setMultasModalData(multasRes.data);
      setShowMultasModal(true);
    } catch (err) {
      console.error(err);
      modalDialogService.Alert("Error al cargar las multas/daños");
    }
  };

  const closeMultasModal = () => {
    setShowMultasModal(false);
    setMultasModalData([]);
  };

  const goToMultasPage = (idAlquiler) => {
    navigate(`/multas-danios?id_alquiler=${idAlquiler}`);
  };

  const handleAbrirCheckout = async (alquiler) => {
    setShowCheckoutModal(true);
    try {
      const { data } = await getAlquiler(alquiler.id_alquiler);
      setCheckoutData({
        alquilerId: data.id_alquiler,
        kmInicial: data.km_inicial ?? alquiler.km_inicial ?? 0,
        kmFinal: "",
        idEmpleadoFinalizador: "",
        observacionesFinalizacion: "",
        vehiculoInfo: `${data.vehiculo_marca ?? ''} ${data.vehiculo_modelo ?? ''} (${data.vehiculo_patente ?? ''})`.trim(),
        fechaInicio: data.fecha_inicio,
        fechaFin: data.fecha_fin,
      });
    } catch (e) {
      setCheckoutData({
        alquilerId: alquiler.id_alquiler,
        kmInicial: alquiler.km_inicial ?? 0,
        kmFinal: "",
        idEmpleadoFinalizador: "",
        observacionesFinalizacion: "",
        vehiculoInfo: "",
        fechaInicio: alquiler.fecha_inicio,
        fechaFin: alquiler.fecha_fin,
      });
    }
  };

  const handleCheckout = async () => {
    try {
      if (!checkoutData.kmFinal || checkoutData.kmFinal === "") {
        modalDialogService.Alert("Debe ingresar el kilometraje final");
        return;
      }

      if (!checkoutData.idEmpleadoFinalizador || checkoutData.idEmpleadoFinalizador === "") {
        modalDialogService.Alert("Debe seleccionar un empleado finalizador");
        return;
      }

      const kmFinal = parseInt(checkoutData.kmFinal, 10);
      const kmInicial = parseInt(checkoutData.kmInicial, 10);

      if (kmFinal <= kmInicial) {
        modalDialogService.Alert(`El kilometraje final (${kmFinal}) debe ser mayor al inicial (${kmInicial})`);
        return;
      }

      const kmRecorridos = kmFinal - kmInicial;
      if (kmRecorridos > 10000) {
        const confirmar = await modalDialogService.Confirm(`¿Está seguro? El vehículo recorrió ${kmRecorridos} km, lo cual es inusualmente alto.`);
        if (!confirmar) return;
      }

      setLoadingCheckout(true);

      const payload = {
        km_final: kmFinal,
        id_empleado_finalizador: parseInt(checkoutData.idEmpleadoFinalizador, 10),
        observaciones_finalizacion: checkoutData.observacionesFinalizacion || null,
      };

      const response = await realizarCheckout(checkoutData.alquilerId, payload);

      let mensaje = response.data.message;
      if (response.data.requiere_mantenimiento) {
        mensaje += `\n\n⚠️ El vehículo requiere mantenimiento (${kmRecorridos} km recorridos).`;
        if (response.data.mantenimiento_creado) {
          mensaje += `\nSe creó automáticamente el registro de mantenimiento #${response.data.mantenimiento_creado}.`;
        }
      }

      setShowCheckoutModal(false);
      setCheckoutData({ alquilerId: null, kmInicial: null, kmFinal: "", idEmpleadoFinalizador: "", observacionesFinalizacion: "" });
      await loadData();

      await modalDialogService.Alert(mensaje);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || "Error al realizar el checkout";
      modalDialogService.Alert(errorMsg);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleAbrirCancelar = (alquiler) => {
    setCancelarData({ alquilerId: alquiler.id_alquiler, motivoCancelacion: "", idEmpleadoCancelador: "" });
    setShowCancelarModal(true);
  };

  const handleCancelar = async () => {
    if (!cancelarData.motivoCancelacion.trim()) {
      modalDialogService.error("Por favor ingrese el motivo de cancelación");
      return;
    }

    if (!cancelarData.idEmpleadoCancelador) {
      modalDialogService.error("Por favor seleccione el empleado que cancela");
      return;
    }

    try {
      setLoadingCancelar(true);

      const payload = {
        motivo_cancelacion: cancelarData.motivoCancelacion,
        id_empleado_cancelador: parseInt(cancelarData.idEmpleadoCancelador),
      };

      const response = await cancelarAlquiler(cancelarData.alquilerId, payload);

      if (response.data?.success) {
        setShowCancelarModal(false);
        setCancelarData({ alquilerId: null, motivoCancelacion: "", idEmpleadoCancelador: "" });
        await loadData();
        modalDialogService.success(`Alquiler cancelado exitosamente. Estado anterior: ${response.data.estado_anterior}`);
      } else {
        modalDialogService.error("No se pudo cancelar el alquiler");
      }
    } catch (error) {
      console.error("Error al cancelar alquiler:", error);
      const errorMsg = error.response?.data?.detail || "Error al cancelar el alquiler";
      modalDialogService.error(errorMsg);
    } finally {
      setLoadingCancelar(false);
    }
  };

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

  const calcularEstado = (fechaInicio, fechaFin) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (hoy < inicio) return { estado: "PENDIENTE", clase: "badge-warning" };
    if (hoy >= inicio && hoy <= fin) return { estado: "EN_CURSO", clase: "badge-primary" };
    return { estado: "CHECKOUT", clase: "badge-info" };
  };

  const clearFilters = () => {
    setFiltroPeriodoEstado("");
    setFiltroCliente("");
    setFiltroVehiculo("");
    setFiltroEmpleado("");
    setFiltroFechaInicioDesde("");
    setFiltroFechaInicioHasta("");
    setFiltroFechaFinDesde("");
    setFiltroFechaFinHasta("");
    setErrorMsg("");
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <AlquileresRegistro
          form={form}
          handleChange={handleChange}
          getFechaMinima={getFechaMinima}
          editingId={editingId}
          costoBaseCalculado={costoBaseCalculado}
          diasAlquiler={diasAlquiler}
          clientes={clientes}
          vehiculos={vehiculos}
          vehiculosDisponibles={vehiculosDisponibles}
          empleados={empleados}
          categorias={categorias}
          loadingDisponibilidad={loadingDisponibilidad}
          disponibilidadMsg={disponibilidadMsg}
          handleSubmit={handleSubmit}
          handleCancelEdit={handleCancelEdit}
          errorMsg={errorMsg}
        />

        <div className="col-lg-12 col-md-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Listado de Alquileres</h3>
              {loading && (
                <span className="text-muted small d-flex align-items-center">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Cargando...
                </span>
              )}
            </div>

            <AlquileresBuscar
              filtroPeriodoEstado={filtroPeriodoEstado}
              setFiltroPeriodoEstado={setFiltroPeriodoEstado}
              filtroCliente={filtroCliente}
              setFiltroCliente={setFiltroCliente}
              filtroVehiculo={filtroVehiculo}
              setFiltroVehiculo={setFiltroVehiculo}
              filtroEmpleado={filtroEmpleado}
              setFiltroEmpleado={setFiltroEmpleado}
              filtroFechaInicioDesde={filtroFechaInicioDesde}
              setFiltroFechaInicioDesde={setFiltroFechaInicioDesde}
              filtroFechaInicioHasta={filtroFechaInicioHasta}
              setFiltroFechaInicioHasta={setFiltroFechaInicioHasta}
              filtroFechaFinDesde={filtroFechaFinDesde}
              setFiltroFechaFinDesde={setFiltroFechaFinDesde}
              filtroFechaFinHasta={filtroFechaFinHasta}
              setFiltroFechaFinHasta={setFiltroFechaFinHasta}
              clientes={clientes}
              vehiculos={vehiculos}
              empleados={empleados}
              loadData={loadData}
              clearFilters={clearFilters}
              loading={loading}
            />

            <AlquileresListado
              alquileres={alquileres}
              loading={loading}
              clientes={clientes}
              vehiculos={vehiculos}
              empleados={empleados}
              multasCounts={multasCounts}
              handleVerMultas={handleVerMultas}
              goToMultasPage={goToMultasPage}
              handleAbrirCheckout={handleAbrirCheckout}
              handleEdit={handleEdit}
              handleAbrirCancelar={handleAbrirCancelar}
              handleDelete={handleDelete}
              getClienteNombre={getClienteNombre}
              getVehiculoInfo={getVehiculoInfo}
              getEmpleadoNombre={getEmpleadoNombre}
              getBadgeEstado={getBadgeEstado}
              calcularEstado={calcularEstado}
            />

            {!loading && alquileres.length > 0 && (
              <div className="card-footer text-muted small">Total de alquileres: {alquileres.length}</div>
            )}
          </div>
        </div>
      </div>

      {/* Modals (mantengo en padre) */}
      {showMultasModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeMultasModal}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title"><i className="fa fa-exclamation-triangle mr-2"></i>Multas y Daños</h5>
                <button type="button" className="close" onClick={closeMultasModal}><span>&times;</span></button>
              </div>
              <div className="modal-body">
                {multasModalData.length === 0 ? (
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
                                {md.tipo.toUpperCase()}
                              </span>
                            </td>
                            <td>{md.descripcion || "-"}</td>
                            <td className="text-right font-weight-bold">${md.monto}</td>
                            <td>{new Date(md.fecha_registro).toLocaleDateString("es-AR")} {new Date(md.fecha_registro).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-active">
                          <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                          <td className="text-right font-weight-bold"><strong>${multasModalData.reduce((sum, md) => sum + parseFloat(md.monto || 0), 0).toFixed(2)}</strong></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeMultasModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-success">
                <h5 className="modal-title"><i className="fa fa-check-circle mr-2"></i>Finalizar Alquiler</h5>
                <button type="button" className="close" onClick={() => setShowCheckoutModal(false)}><span>&times;</span></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>ID Alquiler:</strong> {checkoutData.alquilerId}</p>
                    <p className="mb-1"><strong>Vehículo:</strong> {vehiculos.find((v) => v.id_vehiculo === alquileres.find((a) => a.id_alquiler === checkoutData.alquilerId)?.id_vehiculo)?.marca} {vehiculos.find((v) => v.id_vehiculo === alquileres.find((a) => a.id_alquiler === checkoutData.alquilerId)?.id_vehiculo)?.modelo}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Fecha Inicio:</strong> {new Date(alquileres.find((a) => a.id_alquiler === checkoutData.alquilerId)?.fecha_inicio || "").toLocaleDateString("es-AR")}</p>
                    <p className="mb-1"><strong>Fecha Fin:</strong> {new Date(alquileres.find((a) => a.id_alquiler === checkoutData.alquilerId)?.fecha_fin || "").toLocaleDateString("es-AR")}</p>
                  </div>
                </div>

                <hr />

                <div className="form-group">
                  <label htmlFor="kmInicial"><strong>Kilometraje Inicial:</strong></label>
                  <input type="number" className="form-control" id="kmInicial" value={checkoutData.kmInicial || ""} disabled />
                </div>

                <div className="form-group">
                  <label htmlFor="kmFinal"><strong>Kilometraje Final: *</strong></label>
                  <input type="number" className="form-control" id="kmFinal" value={checkoutData.kmFinal} onChange={(e) => setCheckoutData({ ...checkoutData, kmFinal: e.target.value })} placeholder="Ingrese el kilometraje final" min={checkoutData.kmInicial || 0} />
                </div>

                {checkoutData.kmFinal && checkoutData.kmInicial && (
                  <div className="alert alert-info">
                    <strong>Kilómetros recorridos:</strong> {parseInt(checkoutData.kmFinal) - parseInt(checkoutData.kmInicial)} km
                    {parseInt(checkoutData.kmFinal) - parseInt(checkoutData.kmInicial) > 10000 && (
                      <div className="text-warning mt-2"><i className="fa fa-exclamation-triangle mr-1"></i>Atención: Se superan los 10,000 km recomendados</div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="empleadoFinalizador"><strong>Empleado Finalizador: *</strong></label>
                  <select className="form-control" id="empleadoFinalizador" value={checkoutData.idEmpleadoFinalizador} onChange={(e) => setCheckoutData({ ...checkoutData, idEmpleadoFinalizador: e.target.value })}>
                    <option value="">Seleccione un empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre} {emp.apellido} - {emp.puesto}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="observacionesFinalizacion"><strong>Observaciones:</strong></label>
                  <textarea className="form-control" id="observacionesFinalizacion" rows="3" value={checkoutData.observacionesFinalizacion} onChange={(e) => setCheckoutData({ ...checkoutData, observacionesFinalizacion: e.target.value })} placeholder="Observaciones sobre la finalización del alquiler (opcional)"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCheckoutModal(false)} disabled={loadingCheckout}>Cancelar</button>
                <button type="button" className="btn btn-success" onClick={handleCheckout} disabled={loadingCheckout}>{loadingCheckout ? (<><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Procesando...</>) : (<><i className="fa fa-check mr-2"></i>Finalizar Alquiler</>)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCancelarModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowCancelarModal(false)}>
          <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-danger">
                <h5 className="modal-title"><i className="fa fa-ban mr-2"></i>Cancelar Alquiler</h5>
                <button type="button" className="close" onClick={() => setShowCancelarModal(false)}><span>&times;</span></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning"><i className="fa fa-exclamation-triangle mr-2"></i>¿Está seguro de que desea cancelar este alquiler? Esta acción no se puede deshacer.</div>

                <div className="form-group">
                  <label htmlFor="motivoCancelacion"><i className="fa fa-comment mr-1"></i>Motivo de cancelación <span className="text-danger">*</span></label>
                  <textarea className="form-control" id="motivoCancelacion" rows="4" value={cancelarData.motivoCancelacion} onChange={(e) => setCancelarData({ ...cancelarData, motivoCancelacion: e.target.value })} placeholder="Ingrese el motivo de la cancelación del alquiler"></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="empleadoCancelador"><i className="fa fa-user-tie mr-1"></i>Empleado que cancela <span className="text-danger">*</span></label>
                  <select className="form-control" id="empleadoCancelador" value={cancelarData.idEmpleadoCancelador} onChange={(e) => setCancelarData({ ...cancelarData, idEmpleadoCancelador: e.target.value })}>
                    <option value="">Seleccione un empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre} {emp.apellido} - {emp.cargo}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelarModal(false)} disabled={loadingCancelar}>Volver</button>
                <button type="button" className="btn btn-danger" onClick={handleCancelar} disabled={loadingCancelar}>{loadingCancelar ? (<><span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Cancelando...</>) : (<><i className="fa fa-ban mr-2"></i>Confirmar Cancelación</>)}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
