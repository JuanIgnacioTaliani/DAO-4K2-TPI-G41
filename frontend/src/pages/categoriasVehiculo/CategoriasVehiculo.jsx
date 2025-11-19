import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import CategoriasBuscar from "./CategoriasBuscar";
import CategoriasListado from "./CategoriasListado";
import CategoriasRegistro from "./CategoriasRegistro";

import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../../api/categoriasVehiculoApi";

import modalDialogService from "../../api/modalDialog.service";

export default function CategoriasVehiculo() {
  const { setTitulo } = useOutletContext();

  useEffect(() => {
    setTitulo("Gestión de Categorías");
    Buscar();
  }, [setTitulo]);

  const [AccionABMC, setAccionABMC] = useState("L");

  // filtros
  const [Nombre, setNombre] = useState("");
  const [TarifaDesde, setTarifaDesde] = useState("");
  const [TarifaHasta, setTarifaHasta] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null);

  async function Buscar(override) {
    let params = {};
    const nombre = override && Object.prototype.hasOwnProperty.call(override, "nombre") ? override.nombre : Nombre;
    const tarifa_desde = override && Object.prototype.hasOwnProperty.call(override, "tarifa_desde") ? override.tarifa_desde : TarifaDesde;
    const tarifa_hasta = override && Object.prototype.hasOwnProperty.call(override, "tarifa_hasta") ? override.tarifa_hasta : TarifaHasta;
    if (nombre) params.nombre = nombre;
    if (tarifa_desde !== undefined && tarifa_desde !== "") params.tarifa_desde = tarifa_desde;
    if (tarifa_hasta !== undefined && tarifa_hasta !== "") params.tarifa_hasta = tarifa_hasta;

    const res = await getCategorias(params);
    setItems(res.data);
  }

  async function BuscarPorId(id, accionABMC) {
    const res = await getCategoriaById(id);
    setItem(res.data);
    setAccionABMC(accionABMC);
  }

  const Consultar = (item) => BuscarPorId(item.id_categoria, "C");

  const Modificar = (item) => BuscarPorId(item.id_categoria, "M");

  const Agregar = () => {
    setAccionABMC("A");
    setItem({ id_categoria: 0, nombre: "", descripcion: "", tarifa_diaria: "" });
  };

  const Eliminar = (item) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar esta categoría?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteCategoria(item.id_categoria);
          await Buscar();
          modalDialogService.Alert("Registro eliminado correctamente");
        } catch (err) {
          modalDialogService.Alert(err?.response?.data?.detail ?? "Error al eliminar");
        }
      }
    );
  };

  const Grabar = async (data) => {
    try {
      if (AccionABMC === "A") {
        await createCategoria(data);
      } else {
        await updateCategoria(data.id_categoria, data);
      }
    } catch (err) {
      modalDialogService.Alert(err?.response?.data?.detail ?? "Error al grabar");
      return;
    }

    await Buscar();
    Volver();
    setTimeout(() => {
      modalDialogService.Alert(`Registro ${AccionABMC === "A" ? "agregado" : "modificado"} correctamente`);
    }, 0);
  };

  const Volver = () => setAccionABMC("L");

  return (
    <div>
      {AccionABMC === "L" && (
        <>
          <CategoriasBuscar
            Nombre={Nombre}
            setNombre={setNombre}
            TarifaDesde={TarifaDesde}
            setTarifaDesde={setTarifaDesde}
            TarifaHasta={TarifaHasta}
            setTarifaHasta={setTarifaHasta}
            Buscar={Buscar}
            Agregar={Agregar}
          />

          {Items?.length > 0 ? (
            <CategoriasListado
              Items={Items}
              Buscar={Buscar}
              Consultar={Consultar}
              Modificar={Modificar}
              Eliminar={Eliminar}
            />
          ) : (
            <div className="alert alert-info mensajesAlert">
              <i className="fa fa-exclamation-sign" /> No se encontraron categorías.
            </div>
          )}
        </>
      )}

      {AccionABMC !== "L" && (
        <CategoriasRegistro AccionABMC={AccionABMC} Item={Item} Grabar={Grabar} Volver={Volver} />
      )}
    </div>
  );
}
