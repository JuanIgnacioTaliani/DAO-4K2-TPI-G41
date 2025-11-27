import React, { useState, useEffect, use } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";

import MultasDaniosListado from "./MultasDaniosListado.jsx";
import MultasDaniosBuscar from "./MultasDaniosBuscar.jsx";
import MultasDaniosRegistro from "./MultasDaniosRegistro.jsx";

import {
  getMultasDanios,
  getMultaDanioById,
  createMultaDanio,
  updateMultaDanio,
  deleteMultaDanio,
} from "../../api/multasDaniosApi.js";

import { getAlquileres } from "../../api/alquileresApi.js";

import modalDialogService from "../../api/modalDialog.service";

export default function MultasDanios() {
  const { setTitulo } = useOutletContext();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setTitulo("Gestión de Multas y Daños");

    // If the page is opened with ?id_alquiler=..., use it to filter and preselect
    const idAlq = searchParams.get("id_alquiler");
    if (idAlq) {
      setAlquiler(idAlq);
      Buscar({ alquiler: idAlq });
    } else {
      Buscar();
    }

    (async () => {
      try {
        const alq = await getAlquileres();
        setAlquileres(alq.data ?? []);
      } catch (err) {
        console.error("Error al cargar los alquileres", err);
        setAlquileres([]);
        modalDialogService.Alert("No se pudieron cargar los alquileres");
      }
    })();
  }, [setTitulo, searchParams]);

  const TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)",
  };

  const [AccionABMC, setAccionABMC] = useState("L");

  const [Alquileres, setAlquileres] = useState([]);

  const [Alquiler, setAlquiler] = useState("");
  const [Tipo, setTipo] = useState("");
  const [MontoDesde, setMontoDesde] = useState("");
  const [MontoHasta, setMontoHasta] = useState("");
  const [FechaDesde, setFechaDesde] = useState("");
  const [FechaHasta, setFechaHasta] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null);

  async function Buscar(override) {
    let params = {};

    const alquiler =
      override && Object.prototype.hasOwnProperty.call(override, "alquiler")
        ? override.alquiler
        : Alquiler;

    const tipo =
      override && Object.prototype.hasOwnProperty.call(override, "tipo")
        ? override.tipo
        : Tipo;

    const montoDesde =
      override && Object.prototype.hasOwnProperty.call(override, "montoDesde")
        ? override.montoDesde
        : MontoDesde;

    const montoHasta =
      override && Object.prototype.hasOwnProperty.call(override, "montoHasta")
        ? override.montoHasta
        : MontoHasta;

    const fechaDesde =
      override && Object.prototype.hasOwnProperty.call(override, "fechaDesde")
        ? override.fechaDesde
        : FechaDesde;

    const fechaHasta =
      override && Object.prototype.hasOwnProperty.call(override, "fechaHasta")
        ? override.fechaHasta
        : FechaHasta;

    if (alquiler !== undefined && alquiler !== "")
      params.id_alquiler = alquiler;
    if (tipo !== undefined && tipo !== "") params.tipo = tipo;
    if (montoDesde !== undefined && montoDesde !== "")
      params.monto_desde = montoDesde;
    if (montoHasta !== undefined && montoHasta !== "")
      params.monto_hasta = montoHasta;
    if (fechaDesde !== undefined && fechaDesde !== "")
      params.fecha_desde = fechaDesde;
    if (fechaHasta !== undefined && fechaHasta !== "")
      params.fecha_hasta = fechaHasta;

    const res = await getMultasDanios(params);
    const data = res.data;
    setItems(data);
  }

  async function BuscarPorId(id, AccionABMC) {
    const res = await getMultaDanioById(id);
    const data = res.data;
    setItem(data);
    setAccionABMC(AccionABMC);
  }

  const Consultar = (item) => BuscarPorId(item.id_multa_danio, "C");

  const Modificar = (item) => BuscarPorId(item.id_multa_danio, "M");

  const Agregar = () => {
    setAccionABMC("A");
    setItem({
      id_multa_danio: 0,
      id_alquiler: Number(Alquiler) || 0,
      tipo: "",
      descripcion: "",
      monto: 0,
      fecha_registro: new Date().toISOString().split("T")[0],
    });
  };

  const Eliminar = (item) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar esta Multa/Daño?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteMultaDanio(item.id_multa_danio);
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
        await createMultaDanio(data);
      } else {
        await updateMultaDanio(data.id_multa_danio, data);
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
          <MultasDaniosBuscar
            Alquileres={Alquileres}
            Alquiler={Alquiler}
            setAlquiler={setAlquiler}
            Tipo={Tipo}
            setTipo={setTipo}
            MontoDesde={MontoDesde}
            setMontoDesde={setMontoDesde}
            MontoHasta={MontoHasta}
            setMontoHasta={setMontoHasta}
            FechaDesde={FechaDesde}
            setFechaDesde={setFechaDesde}
            FechaHasta={FechaHasta}
            setFechaHasta={setFechaHasta}
            Buscar={Buscar}
            Agregar={Agregar}
          />

          {Items?.length > 0 ? (
            <MultasDaniosListado
              Items={Items}
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

      {AccionABMC !== "L" && (
        <MultasDaniosRegistro
          AccionABMC={AccionABMC}
          Alquileres={Alquileres}
          Item={Item}
          Grabar={Grabar}
          Volver={Volver}
        />
      )}
    </div>
  );
}
