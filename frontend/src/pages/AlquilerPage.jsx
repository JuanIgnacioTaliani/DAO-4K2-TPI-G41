import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { selectStyles } from "../assets/selectStyles";
import modalDialogService from "../api/modalDialog.service";

import {
  getAlquileres,
  getAlquiler,
  createAlquiler,
  updateAlquiler,
  deleteAlquiler,
  verificarDisponibilidad,
  realizarCheckout,
  cancelarAlquiler,
} from "../api/alquileresApi";
import { getClientes } from "../api/clientesApi";
import { getVehiculosConDisponibilidad } from "../api/vehiculosApi";
import { getEmpleados } from "../api/empleadosApi";
import { getCategoriasVehiculo } from "../api/categoriasVehiculoApi";
import { getMultasDaniosByAlquiler } from "../api/multasDaniosApi";

const emptyForm = {
  id_cliente: "",
  id_vehiculo: "",
  id_empleado: "",
  fecha_inicio: "",
  fecha_fin: "",
  observaciones: "",
};

export default function AlquilerPage() {
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
  
  // Estados para modal de checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    alquilerId: null,
    kmInicial: null,
    kmFinal: "",
    idEmpleadoFinalizador: "",
    observacionesFinalizacion: ""
  });
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Estados para modal de cancelación
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [cancelarData, setCancelarData] = useState({
    alquilerId: null,
    motivoCancelacion: "",
    idEmpleadoCancelador: ""
  });
  const [loadingCancelar, setLoadingCancelar] = useState(false);

  // Filtros de listado
  const [filtroPeriodoEstado, setFiltroPeriodoEstado] = useState(""); // pendiente|en_curso|checkout
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

      // Validar rangos de fechas
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

      // Construir params para filtros de backend
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
        getCategoriasVehiculo(),
      ]);
      setAlquileres(aRes.data);
      setClientes(cRes.data);
      setVehiculos(vRes.data);
      setEmpleados(eRes.data);
      setCategorias(catRes.data);

      // Cargar cantidad de multas para cada alquiler
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

  // Verificar disponibilidad cuando cambian las fechas
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
        // Verificar disponibilidad para cada vehículo
        const disponibilidadPromises = vehiculos.map(async (vehiculo) => {
          try {
            const res = await verificarDisponibilidad(
              vehiculo.id_vehiculo,
              form.fecha_inicio,
              form.fecha_fin
            );
            return {
              ...vehiculo,
              disponible: res.data.disponible,
              conflictos: res.data.conflictos || [],
            };
          } catch (err) {
            console.error(`Error verificando vehículo ${vehiculo.id_vehiculo}:`, err);
            return {
              ...vehiculo,
              disponible: false,
              conflictos: [],
            };
          }
        });

        const resultados = await Promise.all(disponibilidadPromises);
        const disponibles = resultados.filter((v) => v.disponible);
        
        setVehiculosDisponibles(resultados);
        
        if (disponibles.length === 0) {
          setDisponibilidadMsg("⚠️ No hay vehículos disponibles en el período seleccionado");
        } else {
          setDisponibilidadMsg(
            `✅ ${disponibles.length} vehículo${disponibles.length !== 1 ? 's' : ''} disponible${disponibles.length !== 1 ? 's' : ''} en el período seleccionado`
          );
        }

        // Si el vehículo seleccionado ya no está disponible, limpiarlo
        if (form.id_vehiculo) {
          const vehiculoSeleccionado = resultados.find(
            (v) => v.id_vehiculo === parseInt(form.id_vehiculo)
          );
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

    // Solo verificar si no estamos editando o si cambiaron las fechas durante edición
    if (editingId === null || (form.fecha_inicio && form.fecha_fin)) {
      verificarVehiculosDisponibles();
    }
  }, [form.fecha_inicio, form.fecha_fin, vehiculos, editingId]);


  // Calcular costo base cuando cambian fechas o vehículo
  useEffect(() => {
    if (form.fecha_inicio && form.fecha_fin && form.id_vehiculo) {
      const fechaInicio = new Date(form.fecha_inicio);
      const fechaFin = new Date(form.fecha_fin);
      const diffTime = Math.abs(fechaFin - fechaInicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      const vehiculo = vehiculos.find(v => v.id_vehiculo === parseInt(form.id_vehiculo));
      if (vehiculo) {
        const categoria = categorias.find(c => c.id_categoria === vehiculo.id_categoria);
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
    
    // Si cambia la fecha inicio, resetear fecha fin
    if (name === "fecha_inicio") {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        fecha_fin: "", // Resetear fecha fin cuando cambia fecha inicio
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Obtener fecha mínima para los inputs (hoy)
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

    // Validaciones de fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(form.fecha_inicio);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(form.fecha_fin);
    fechaFin.setHours(0, 0, 0, 0);

    // Validar que fecha fin no sea anterior a fecha inicio
    if (fechaFin < fechaInicio) {
      setErrorMsg("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }
    
    // Calcular estado automáticamente según fechas
    let estadoCalculado;
    if (hoy < fechaInicio) {
      estadoCalculado = "PENDIENTE"; // Aún no comienza
    } else if (hoy >= fechaInicio && hoy <= fechaFin) {
      estadoCalculado = "EN_CURSO"; // Está en progreso
    } else {
      estadoCalculado = "FINALIZADO"; // Ya terminó
    }

    const payload = {
      id_cliente: form.id_cliente ? parseInt(form.id_cliente, 10) : null,
      id_vehiculo: form.id_vehiculo ? parseInt(form.id_vehiculo, 10) : null,
      id_empleado: form.id_empleado ? parseInt(form.id_empleado, 10) : null,
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
      costo_base: costoBaseCalculado,
      costo_total: costoBaseCalculado, // Inicialmente igual al costo base
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

  // Funciones para Checkout
  const handleAbrirCheckout = async (alquiler) => {
    // Abrir modal primero con datos mínimos para buena UX
    setShowCheckoutModal(true);

    // Intentar obtener el alquiler actualizado para tener km_inicial más fresco
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
      // Si falla el refetch, usar los datos disponibles
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
      // Validaciones
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
        const confirmar = await modalDialogService.Confirm(
          `¿Está seguro? El vehículo recorrió ${kmRecorridos} km, lo cual es inusualmente alto.`
        );
        if (!confirmar) return;
      }

      setLoadingCheckout(true);

      const payload = {
        km_final: kmFinal,
        id_empleado_finalizador: parseInt(checkoutData.idEmpleadoFinalizador, 10),
        observaciones_finalizacion: checkoutData.observacionesFinalizacion || null
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

      // Cerrar modal y refrescar antes de mostrar el mensaje
      setShowCheckoutModal(false);
      setCheckoutData({
        alquilerId: null,
        kmInicial: null,
        kmFinal: "",
        idEmpleadoFinalizador: "",
        observacionesFinalizacion: ""
      });
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

  // Función para abrir el modal de cancelación
  const handleAbrirCancelar = (alquiler) => {
    setCancelarData({
      alquilerId: alquiler.id_alquiler,
      motivoCancelacion: "",
      idEmpleadoCancelador: ""
    });
    setShowCancelarModal(true);
  };

  // Función para cancelar un alquiler
  const handleCancelar = async () => {
    // Validaciones
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
        id_empleado_cancelador: parseInt(cancelarData.idEmpleadoCancelador)
      };

      const response = await cancelarAlquiler(cancelarData.alquilerId, payload);

      if (response.data?.success) {
        // Cerrar modal y refrescar primero para asegurar que se vea el cambio
        setShowCancelarModal(false);
        setCancelarData({
          alquilerId: null,
          motivoCancelacion: "",
          idEmpleadoCancelador: ""
        });
        await loadData();

        // Mostrar confirmación luego de refrescar
        modalDialogService.success(
          `Alquiler cancelado exitosamente. Estado anterior: ${response.data.estado_anterior}`
        );
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

  // Función para obtener el badge de estado con los nombres descriptivos
  const getBadgeEstado = (estado) => {
    const estados = {
      PENDIENTE: { texto: "Reserva", clase: "badge-warning" },
      EN_CURSO: { texto: "Alquiler Activo", clase: "badge-primary" },
      CHECKOUT: { texto: "Período Finalizado", clase: "badge-info" },
      FINALIZADO: { texto: "Alquiler Finalizado", clase: "badge-success" },
      CANCELADO: { texto: "Cancelado", clase: "badge-danger" }
    };
    
    const info = estados[estado] || { texto: estado, clase: "badge-secondary" };
    return (
      <span className={`badge ${info.clase}`}>
        {info.texto}
      </span>
    );
  };

  // Función para calcular estado dinámicamente según fechas
  const calcularEstado = (fechaInicio, fechaFin) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) {
      return { estado: "PENDIENTE", clase: "badge-warning" };
    } else if (hoy >= inicio && hoy <= fin) {
      return { estado: "EN_CURSO", clase: "badge-primary" };
    } else {
      return { estado: "CHECKOUT", clase: "badge-info" }; // Cambiado de FINALIZADO a CHECKOUT
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Formulario */}
        <div className="col-lg-12 col-md-12">
          <div className="card card-primary mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {editingId === null ? "Nuevo alquiler" : "Editar alquiler"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Paso 1: Fechas (PRIMERO) */}
                <div className="row">
                  <div className="col-12 mb-3">
                    <h5 className="text-primary">
                      <i className="fa fa-calendar mr-2"></i>
                      Paso 1: Seleccioná el período de alquiler
                    </h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha Inicio *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="fecha_inicio"
                      value={form.fecha_inicio}
                      onChange={handleChange}
                      min={editingId === null ? getFechaMinima() : undefined}
                      required
                    />
                    {editingId === null && (
                      <small className="text-muted">
                        No se puede seleccionar una fecha anterior a hoy
                      </small>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fecha Fin *</label>
                    <input
                      className="form-control"
                      type="date"
                      name="fecha_fin"
                      value={form.fecha_fin}
                      onChange={handleChange}
                      min={form.fecha_inicio || (editingId === null ? getFechaMinima() : undefined)}
                      disabled={!form.fecha_inicio}
                      required
                    />
                    {!form.fecha_inicio ? (
                      <small className="text-muted">
                        Primero seleccioná la fecha de inicio
                      </small>
                    ) : (
                      <small className="text-muted">
                        Debe ser posterior o igual a la fecha de inicio
                      </small>
                    )}
                  </div>

                  {/* Mensaje de disponibilidad */}
                  {(form.fecha_inicio && form.fecha_fin) && (
                    <div className="col-12 mb-3">
                      {loadingDisponibilidad ? (
                        <div className="alert alert-info mb-0">
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Verificando disponibilidad de vehículos...
                        </div>
                      ) : disponibilidadMsg ? (
                        <div className={`alert ${disponibilidadMsg.startsWith('✅') ? 'alert-success' : 'alert-warning'} mb-0`}>
                          {disponibilidadMsg}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <hr />

                {/* Paso 2: Selección de vehículo, cliente y empleado */}
                <div className="row">
                  <div className="col-12 mb-3">
                    <h5 className="text-primary">
                      <i className="fa fa-car mr-2"></i>
                      Paso 2: Seleccioná el vehículo y completá los datos
                    </h5>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Cliente *</label>
                    <select
                      className="form-control"
                      name="id_cliente"
                      value={form.id_cliente}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {clientes.map((c) => (
                        <option key={c.id_cliente} value={c.id_cliente}>
                          {c.nombre} {c.apellido} - {c.dni}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Vehículo * 
                      {loadingDisponibilidad && (
                        <small className="text-muted ml-2">
                          <i className="fa fa-spinner fa-spin"></i>
                        </small>
                      )}
                    </label>
                    <select
                      className="form-control"
                      name="id_vehiculo"
                      value={form.id_vehiculo}
                      onChange={handleChange}
                      disabled={!form.fecha_inicio || !form.fecha_fin || loadingDisponibilidad}
                      required
                    >
                      <option value="">
                        {!form.fecha_inicio || !form.fecha_fin
                          ? "-- Primero seleccioná las fechas --"
                          : loadingDisponibilidad
                          ? "-- Verificando disponibilidad... --"
                          : "-- Seleccionar vehículo --"}
                      </option>
                      
                      {/* Vehículos DISPONIBLES primero */}
                      {vehiculosDisponibles.filter(v => v.disponible).length > 0 && (
                        <optgroup label="✅ Disponibles">
                          {vehiculosDisponibles
                            .filter(v => v.disponible)
                            .map((v) => (
                              <option key={v.id_vehiculo} value={v.id_vehiculo}>
                                {v.patente} - {v.marca} {v.modelo}
                              </option>
                            ))}
                        </optgroup>
                      )}
                      
                      {/* Vehículos EN MANTENIMIENTO */}
                      {vehiculosDisponibles.filter(v => v.estado_disponibilidad === "En Mantenimiento").length > 0 && (
                        <optgroup label="🔧 En Mantenimiento">
                          {vehiculosDisponibles
                            .filter(v => v.estado_disponibilidad === "En Mantenimiento")
                            .map((v) => (
                              <option key={v.id_vehiculo} value={v.id_vehiculo} disabled>
                                {v.patente} - {v.marca} {v.modelo} (En Mantenimiento)
                              </option>
                            ))}
                        </optgroup>
                      )}
                      
                      {/* Vehículos OCUPADOS (deshabilitados) */}
                      {vehiculosDisponibles.filter(v => !v.disponible && v.estado_disponibilidad !== "En Mantenimiento").length > 0 && (
                        <optgroup label="❌ Ocupados">
                          {vehiculosDisponibles
                            .filter(v => !v.disponible && v.estado_disponibilidad !== "En Mantenimiento")
                            .map((v) => (
                              <option key={v.id_vehiculo} value={v.id_vehiculo} disabled>
                                {v.patente} - {v.marca} {v.modelo} (Ocupado)
                              </option>
                            ))}
                        </optgroup>
                      )}
                    </select>
                    {!form.fecha_inicio || !form.fecha_fin ? (
                      <small className="text-muted">
                        Seleccioná las fechas para ver vehículos disponibles
                      </small>
                    ) : form.id_vehiculo && vehiculosDisponibles.find(v => v.id_vehiculo === parseInt(form.id_vehiculo))?.conflictos?.length > 0 ? (
                      <small className="text-danger">
                        ⚠️ Este vehículo tiene conflictos en las fechas seleccionadas
                      </small>
                    ) : null}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Empleado *</label>
                    <select
                      className="form-control"
                      name="id_empleado"
                      value={form.id_empleado}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {empleados.map((e) => (
                        <option key={e.id_empleado} value={e.id_empleado}>
                          {e.nombre} {e.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Información calculada automáticamente */}
                  {(form.fecha_inicio && form.fecha_fin && form.id_vehiculo) && (
                    <div className="col-md-12 mb-3">
                      <div className="alert alert-info mb-0">
                        <strong>
                          <i className="fa fa-calculator mr-2"></i>
                          Cálculo automático:
                        </strong>
                        <br />
                        Días de alquiler: <strong>{diasAlquiler}</strong> días
                        <br />
                        Costo base (por {diasAlquiler} día{diasAlquiler !== 1 ? 's' : ''}): 
                        <strong> ${costoBaseCalculado.toFixed(2)}</strong>
                        <br />
                        Estado: <strong>{calcularEstado(form.fecha_inicio, form.fecha_fin).estado}</strong>
                        <br />
                        <small className="text-muted">
                          El costo total incluirá multas/daños que se agreguen posteriormente
                        </small>
                      </div>
                    </div>
                  )}

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Observaciones</label>
                    <textarea
                      className="form-control"
                      name="observaciones"
                      value={form.observaciones}
                      onChange={handleChange}
                      rows="3"
                      maxLength="300"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 mt-1" role="alert">
                    {errorMsg}
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary">
                    {editingId === null ? "Crear alquiler" : "Guardar cambios"}
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="col-lg-12 col-md-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Listado de Alquileres</h3>
              {loading && (
                <span className="text-muted small d-flex align-items-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Cargando...
                </span>
              )}
            </div>
            {/* Filtros */}
            <div className="card-body border-bottom">
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group mb-0">
                    <label className="small" htmlFor="filtroPeriodoEstado">Estado por fechas</label>
                    <select
                      id="filtroPeriodoEstado"
                      className="form-control form-control-sm"
                      value={filtroPeriodoEstado}
                      onChange={(e) => setFiltroPeriodoEstado(e.target.value)}
                    >
                      <option value="">Cualquiera</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_curso">En curso</option>
                      <option value="checkout">Período finalizado</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group mb-0">
                    <label className="small" htmlFor="filtroCliente">Cliente</label>
                    <select
                      id="filtroCliente"
                      className="form-control form-control-sm"
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {clientes.map(c => (
                        <option key={c.id_cliente} value={c.id_cliente}>
                          {c.nombre} {c.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group mb-0">
                    <label className="small" htmlFor="filtroVehiculo">Vehículo</label>
                    <select id="filtroVehiculo" className="form-control form-control-sm" value={filtroVehiculo} onChange={(e)=>setFiltroVehiculo(e.target.value)}>
                      <option value="">Todos</option>
                      {vehiculos.map(v => (
                        <option key={v.id_vehiculo} value={v.id_vehiculo}>
                          {v.patente} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group mb-0">
                    <label className="small" htmlFor="filtroEmpleado">Empleado</label>
                    <select id="filtroEmpleado" className="form-control form-control-sm" value={filtroEmpleado} onChange={(e)=>setFiltroEmpleado(e.target.value)}>
                      <option value="">Todos</option>
                      {empleados.map(e => (
                        <option key={e.id_empleado} value={e.id_empleado}>
                          {e.nombre} {e.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-md-3">
                  <div className="form-group mb-0">
                    <label className="small">Rango fecha inicio</label>
                    <div className="d-flex gap-1">
                      <input type="date" className="form-control form-control-sm mr-1" value={filtroFechaInicioDesde} onChange={(e)=>setFiltroFechaInicioDesde(e.target.value)} placeholder="Desde" />
                      <input type="date" className="form-control form-control-sm" value={filtroFechaInicioHasta} onChange={(e)=>setFiltroFechaInicioHasta(e.target.value)} placeholder="Hasta" />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group mb-0">
                    <label className="small">Rango fecha fin</label>
                    <div className="d-flex gap-1">
                      <input type="date" className="form-control form-control-sm mr-1" value={filtroFechaFinDesde} onChange={(e)=>setFiltroFechaFinDesde(e.target.value)} placeholder="Desde" />
                      <input type="date" className="form-control form-control-sm" value={filtroFechaFinHasta} onChange={(e)=>setFiltroFechaFinHasta(e.target.value)} placeholder="Hasta" />
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-end justify-content-end">
                  <div className="btn-group">
                    <button className="btn btn-sm btn-primary" onClick={loadData}>
                      <i className="fa fa-filter mr-1"></i>Aplicar filtros
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => {
                      setFiltroPeriodoEstado("");
                      setFiltroCliente("");
                      setFiltroVehiculo("");
                      setFiltroEmpleado("");
                      setFiltroFechaInicioDesde("");
                      setFiltroFechaInicioHasta("");
                      setFiltroFechaFinDesde("");
                      setFiltroFechaFinHasta("");
                      setErrorMsg("");
                    }}>
                      <i className="fa fa-times mr-1"></i>Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {alquileres.length === 0 && !loading ? (
                <div className="p-3">
                  <div className="alert alert-info mb-0">
                    No hay alquileres cargados.
                  </div>
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
                        // Calcular el estado real según las fechas (para PENDIENTE, EN_CURSO, CHECKOUT)
                        // Solo si el alquiler no está FINALIZADO o CANCELADO
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
                              className={`btn btn-sm ${
                                multasCounts[a.id_alquiler] > 0
                                  ? "btn-warning"
                                  : "btn-outline-secondary"
                              }`}
                              onClick={() => handleVerMultas(a.id_alquiler)}
                              title="Ver multas/daños"
                            >
                              <i className="fa fa-exclamation-triangle mr-1"></i>
                              {multasCounts[a.id_alquiler] || 0}
                            </button>
                          </td>
                          <td>
                            {getBadgeEstado(estadoReal)}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning mr-1"
                              onClick={() => goToMultasPage(a.id_alquiler)}
                              title="Ir a Multas/Daños"
                            >
                              <i className="fa fa-file-invoice-dollar"></i>
                            </button>{" "}
                            {estadoReal === "CHECKOUT" && (
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
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary mr-1"
                              onClick={() => handleEdit(a)}
                            >
                              <i className="fa fa-pencil-alt"></i>
                            </button>{" "}
                            {(estadoReal === "PENDIENTE" || estadoReal === "EN_CURSO") && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger mr-1"
                                  onClick={() => handleAbrirCancelar(a)}
                                  title="Cancelar Alquiler"
                                >
                                  <i className="fa fa-ban"></i>
                                </button>{" "}
                              </>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(a.id_alquiler)}
                            >
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
            {!loading && alquileres.length > 0 && (
              <div className="card-footer text-muted small">
                Total de alquileres: {alquileres.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Multas/Daños */}
      {showMultasModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeMultasModal}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="fa fa-exclamation-triangle mr-2"></i>
                  Multas y Daños
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeMultasModal}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {multasModalData.length === 0 ? (
                  <div className="alert alert-info mb-0">
                    No hay multas o daños registrados para este alquiler.
                  </div>
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
                            <td className="text-right font-weight-bold">
                              ${md.monto}
                            </td>
                            <td>
                              {new Date(md.fecha_registro).toLocaleDateString(
                                "es-AR"
                              )}{" "}
                              {new Date(md.fecha_registro).toLocaleTimeString(
                                "es-AR",
                                { hour: "2-digit", minute: "2-digit" }
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
                              $
                              {multasModalData
                                .reduce(
                                  (sum, md) => sum + parseFloat(md.monto || 0),
                                  0
                                )
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
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeMultasModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckoutModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowCheckoutModal(false)}
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
                  onClick={() => setShowCheckoutModal(false)}
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
                      <strong>Vehículo:</strong>{" "}
                      {
                        vehiculos.find(
                          (v) =>
                            v.id_vehiculo ===
                            alquileres.find(
                              (a) => a.id_alquiler === checkoutData.alquilerId
                            )?.id_vehiculo
                        )?.marca
                      }{" "}
                      {
                        vehiculos.find(
                          (v) =>
                            v.id_vehiculo ===
                            alquileres.find(
                              (a) => a.id_alquiler === checkoutData.alquilerId
                            )?.id_vehiculo
                        )?.modelo
                      }
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      <strong>Fecha Inicio:</strong>{" "}
                      {new Date(
                        alquileres.find(
                          (a) => a.id_alquiler === checkoutData.alquilerId
                        )?.fecha_inicio || ""
                      ).toLocaleDateString("es-AR")}
                    </p>
                    <p className="mb-1">
                      <strong>Fecha Fin:</strong>{" "}
                      {new Date(
                        alquileres.find(
                          (a) => a.id_alquiler === checkoutData.alquilerId
                        )?.fecha_fin || ""
                      ).toLocaleDateString("es-AR")}
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
                  >
                    <option value="">Seleccione un empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.id_empleado} value={emp.id_empleado}>
                        {emp.nombre} {emp.apellido} - {emp.puesto}
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
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={loadingCheckout}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? (
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
      )}

      

      {/* Modal de Cancelación */}
      {showCancelarModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowCancelarModal(false)}
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
                  onClick={() => setShowCancelarModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fa fa-exclamation-triangle mr-2"></i>
                  ¿Está seguro de que desea cancelar este alquiler? Esta acción no se puede deshacer.
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
                  >
                    <option value="">Seleccione un empleado</option>
                    {empleados.map((emp) => (
                      <option key={emp.id_empleado} value={emp.id_empleado}>
                        {emp.nombre} {emp.apellido} - {emp.cargo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCancelarModal(false)}
                  disabled={loadingCancelar}
                >
                  Volver
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancelar}
                  disabled={loadingCancelar}
                >
                  {loadingCancelar ? (
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
      )}
    </div>
  );
}

export { AlquilerPage };
