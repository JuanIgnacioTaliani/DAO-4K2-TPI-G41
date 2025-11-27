import React, { useState, useEffect } from "react";
import { useOutlet, useOutletContext } from "react-router-dom";

import AlquileresListado from "./AlquileresListado";
import AlquileresBuscar from "./AlquileresBuscar";
import AlquileresRegistro from "./AlquileresRegistro";
import ModalCancelacion from "./ModalCancelacion";
import ModalCheckout from "./ModalCheckout";
import ModalMultas from "./ModalMultas";

import {
  getAlquileres,
  getAlquiler,
  createAlquiler,
  updateAlquiler,
  deleteAlquiler,
} from "../../api/alquileresApi";
import { getClientes } from "../../api/clientesApi";
import { getVehiculos } from "../../api/vehiculosApi";
import { getEmpleados } from "../../api/empleadosApi";
import { getMultasDaniosByAlquiler } from "../../api/multasDaniosApi";

import modalDialogService from "../../api/modalDialog.service";

export default function Alquileres() {
  const { setTitulo } = useOutletContext();

  useEffect(() => {
    setTitulo("Gestión de Alquileres");
    Buscar();
    (async () => {
      try {
        const veh = await getVehiculos();
        const emp = await getEmpleados();
        const cli = await getClientes();
        setVehiculos(veh.data ?? []);
        setEmpleados(emp.data ?? []);
        setClientes(cli.data ?? []);
      } catch (err) {
        setVehiculos([]);
        setEmpleados([]);
        setClientes([]);
        modalDialogService.Alert(
          err?.response?.data?.detail ?? "Error al cargar datos"
        );
      }
    })();
  }, [setTitulo]);

  const TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)",
  };

  const [AccionABMC, setAccionABMC] = useState("L");

  //arrays de los select
  const [Vehiculos, setVehiculos] = useState([]);
  const [Empleados, setEmpleados] = useState([]);
  const [Clientes, setClientes] = useState([]);

  //filtros
  const [Estado, setEstado] = useState("");
  const [Cliente, setCliente] = useState("");
  const [Vehiculo, setVehiculo] = useState("");
  const [Empleado, setEmpleado] = useState("");
  const [FechaInicioDesde, setFechaInicioDesde] = useState("");
  const [FechaInicioHasta, setFechaInicioHasta] = useState("");
  const [FechaFinDesde, setFechaFinDesde] = useState("");
  const [FechaFinHasta, setFechaFinHasta] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null);

  // Estados para modal de cancelación
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [cancelarData, setCancelarData] = useState({
    alquilerId: null,
    motivoCancelacion: "",
    idEmpleadoCancelador: "",
  });
  const [loadingCancelar, setLoadingCancelar] = useState(false);

  // Estados para modal de checkout
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    alquilerId: null,
    kmInicial: null,
    kmFinal: "",
    idEmpleadoFinalizador: "",
    observacionesFinalizacion: "",
  });

  // Estados para modal de multas/daños
  const [showMultasModal, setShowMultasModal] = useState(false);
  const [multasModalData, setMultasModalData] = useState([]);
  const [multasCounts, setMultasCounts] = useState({});

  async function Buscar(override) {
    let params = {};

    const estado =
      override && Object.prototype.hasOwnProperty.call(override, "estado")
        ? override.estado
        : Estado;
    const cliente =
      override && Object.prototype.hasOwnProperty.call(override, "cliente")
        ? override.cliente
        : Cliente;
    const vehiculo =
      override && Object.prototype.hasOwnProperty.call(override, "vehiculo")
        ? override.vehiculo
        : Vehiculo;
    const empleado =
      override && Object.prototype.hasOwnProperty.call(override, "empleado")
        ? override.empleado
        : Empleado;
    const fechaInicioDesde =
      override &&
      Object.prototype.hasOwnProperty.call(override, "fechaInicioDesde")
        ? override.fechaInicioDesde
        : FechaInicioDesde;
    const fechaInicioHasta =
      override &&
      Object.prototype.hasOwnProperty.call(override, "fechaInicioHasta")
        ? override.fechaInicioHasta
        : FechaInicioHasta;
    const fechaFinDesde =
      override &&
      Object.prototype.hasOwnProperty.call(override, "fechaFinDesde")
        ? override.fechaFinDesde
        : FechaFinDesde;
    const fechaFinHasta =
      override &&
      Object.prototype.hasOwnProperty.call(override, "fechaFinHasta")
        ? override.fechaFinHasta
        : FechaFinHasta;

    if (estado !== undefined && estado !== "") params.estado = estado;
    if (cliente !== undefined && cliente !== "") params.id_cliente = cliente;
    if (vehiculo !== undefined && vehiculo !== "")
      params.id_vehiculo = vehiculo;
    if (empleado !== undefined && empleado !== "")
      params.id_empleado = empleado;
    if (fechaInicioDesde !== undefined && fechaInicioDesde !== "")
      params.fechaInicioDesde = fechaInicioDesde;
    if (fechaInicioHasta !== undefined && fechaInicioHasta !== "")
      params.fechaInicioHasta = fechaInicioHasta;
    if (fechaFinDesde !== undefined && fechaFinDesde !== "")
      params.fechaFinDesde = fechaFinDesde;
    if (fechaFinHasta !== undefined && fechaFinHasta !== "")
      params.fechaFinHasta = fechaFinHasta;

    const res = await getAlquileres(params);
    const data = res.data;
    setItems(data);

    // Cargar cantidad de multas por alquiler (para mostrar el badge en el listado)
    try {
      const counts = {};
      await Promise.all(
        (data || []).map(async (alquiler) => {
          try {
            const multasRes = await getMultasDaniosByAlquiler(alquiler.id_alquiler);
            counts[alquiler.id_alquiler] = multasRes.data.length;
          } catch (e) {
            counts[alquiler.id_alquiler] = 0;
          }
        })
      );
      setMultasCounts(counts);
    } catch (e) {
      setMultasCounts({});
    }
  }

  async function BuscarPorId(id, AccionABMC) {
    const res = await getAlquiler(id);
    const data = res.data;
    setItem(data);
    setAccionABMC(AccionABMC);
  }

  const Consultar = (item) => BuscarPorId(item.id_alquiler, "C");

  const Modificar = (item) => BuscarPorId(item.id_alquiler, "M");

  const Agregar = () => {
    setAccionABMC("A");
    setItem({
      id_alquiler: 0,
      id_cliente: 0,
      id_vehiculo: 0,
      id_empleado: 0,
      fecha_inicio: "",
      fecha_fin: "",
      costo_base: 0,
      costo_total: 0,
      estado: "",
      observaciones: "",
      km_inicial: 0,
    });
  };

  const Eliminar = (item) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este Alquiler?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteAlquiler(item.id_alquiler);
          await Buscar();
          modalDialogService.Alert("Registro eliminado correctamente");
        } catch (err) {
          modalDialogService.Alert(
            err?.response?.data?.detail ?? "Error al eliminar"
          );
        }
      }
    );
  };

  const Grabar = async (data) => {
    try {
      if (AccionABMC === "A") {
        await createAlquiler(data);
      } else {
        await updateAlquiler(data.id_alquiler, data);
      }
    } catch (err) {
      modalDialogService.Alert(
        err?.response?.data?.detail ?? "Error al grabar"
      );
      return;
    }

    await Buscar();
    Volver();
    setTimeout(() => {
      modalDialogService.Alert(
        `Registro ${
          AccionABMC === "A" ? "agregado" : "modificado"
        } correctamente`
      );
    }, 0);
  };

  const Volver = () => setAccionABMC("L");

  // Función para abrir el modal de cancelación
  const handleAbrirCancelar = (alquiler) => {
    setCancelarData({
      alquilerId: alquiler.id_alquiler,
      motivoCancelacion: "",
      idEmpleadoCancelador: "",
    });
    setShowCancelarModal(true);
  };

  // Función para abrir el modal de checkout
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
        vehiculoInfo: `${data.vehiculo?.marca ?? ""} ${
          data.vehiculo?.modelo ?? ""
        } (${data.vehiculo?.patente ?? ""})`.trim(),
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
        vehiculoInfo: `${alquiler.vehiculo?.marca ?? ""} ${
          alquiler.vehiculo?.modelo ?? ""
        } (${alquiler.vehiculo?.patente ?? ""})`.trim(),
        fechaInicio: alquiler.fecha_inicio,
        fechaFin: alquiler.fecha_fin,
      });
    }
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

  return (
    <div>
      {AccionABMC === "L" && (
        <>
          <AlquileresBuscar
            Estado={Estado}
            setEstado={setEstado}
            Clientes={Clientes}
            Cliente={Cliente}
            setCliente={setCliente}
            Vehiculos={Vehiculos}
            Vehiculo={Vehiculo}
            setVehiculo={setVehiculo}
            Empleados={Empleados}
            Empleado={Empleado}
            setEmpleado={setEmpleado}
            FechaInicioDesde={FechaInicioDesde}
            setFechaInicioDesde={setFechaInicioDesde}
            FechaInicioHasta={FechaInicioHasta}
            setFechaInicioHasta={setFechaInicioHasta}
            FechaFinDesde={FechaFinDesde}
            setFechaFinDesde={setFechaFinDesde}
            FechaFinHasta={FechaFinHasta}
            setFechaFinHasta={setFechaFinHasta}
            Buscar={Buscar}
            Agregar={Agregar}
          />

          {Items?.length > 0 ? (
            <AlquileresListado
              Items={Items}
              Empleados={Empleados}
              multasCounts={multasCounts}
              Consultar={Consultar}
              Modificar={Modificar}
              Eliminar={Eliminar}
              handleAbrirCancelar={handleAbrirCancelar}
              handleAbrirCheckout={handleAbrirCheckout}
              handleVerMultas={handleVerMultas}
            />
          ) : (
            <div className="alert alert-info mensajesAlert">
              <i className="fa fa-exclamation-sign" /> No se encontraron
              Alquileres.
            </div>
          )}
        </>
      )}

      {(AccionABMC === "A" || AccionABMC === "M") && (
        <AlquileresRegistro
          AccionABMC={AccionABMC}
          Item={Item}
          Vehiculos={Vehiculos}
          Empleados={Empleados}
          Clientes={Clientes}
          Grabar={Grabar}
          Volver={Volver}
        />
      )}

      {/* Modal de Cancelación */}
      <ModalCancelacion
        show={showCancelarModal}
        cancelarData={cancelarData}
        setCancelarData={setCancelarData}
        empleados={Empleados}
        onClose={() => setShowCancelarModal(false)}
        onCancelarExitoso={Buscar}
      />

      {/* Modal de Checkout */}
      <ModalCheckout
        show={showCheckoutModal}
        checkoutData={checkoutData}
        setCheckoutData={setCheckoutData}
        empleados={Empleados}
        onClose={() => setShowCheckoutModal(false)}
        onCheckoutExitoso={Buscar}
      />

      {/* Modal de Multas/Daños */}
      <ModalMultas
        show={showMultasModal}
        multasModalData={multasModalData}
        onClose={() => setShowMultasModal(false)}
      />
    </div>
  );
}
