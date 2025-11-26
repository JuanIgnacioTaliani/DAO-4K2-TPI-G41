import React, { useState, useEffect } from "react";
import { useOutlet, useOutletContext } from "react-router-dom";

import AlquileresListado from "./AlquileresListado";
import AlquileresBuscar from "./AlquileresBuscar";
import AlquileresRegistro from "./AlquileresRegistro";
import AlquileresConsulta from "./AlquileresConsulta.jsx";

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
      }
      catch (err) {
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
    if (vehiculo !== undefined && vehiculo !== "") params.id_vehiculo = vehiculo;
    if (empleado !== undefined && empleado !== "") params.id_empleado = empleado;
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
      km_final: 0,
      motivo_cancelacion: "",
      fecha_cancelacion: "",
      id_empleado_cancelador: 0,
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
              Buscar={Buscar}
              Consultar={Consultar}
              Modificar={Modificar}
              Eliminar={Eliminar}
            />
          ) : (
            <div className="alert alert-info mensajesAlert">
              <i className="fa fa-exclamation-sign" /> No se encontraron
              Alquileres.
            </div>
          )}
        </>
      )}

      {AccionABMC === "A" && (
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

      {AccionABMC === "C" && <AlquileresConsulta Item={Item} Volver={Volver} />}
    </div>
  );
}
