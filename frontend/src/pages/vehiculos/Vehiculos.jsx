import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import VehiculosBuscar from "./VehiculosBuscar";
import VehiculosListado from "./VehiculosListado";
import VehiculosRegistro from "./VehiculosRegistro";

import {
  getVehiculos,
  getVehiculoById,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
} from "../../api/vehiculosApi";
import { getCategorias } from "../../api/categoriasVehiculoApi";
import { getEstadosVehiculo } from "../../api/estadosVehiculoApi";

import modalDialogService from "../../api/modalDialog.service";

export default function Vehiculos() {
  const { setTitulo } = useOutletContext();

  useEffect(() => {
    setTitulo("Gestión de Vehículos");
    Buscar();
    (async () => {
      try {
        const cat = await getCategorias();
        const est = await getEstadosVehiculo();
        setCategorias(cat.data ?? []);
        setEstados(est.data ?? []);
        
      } catch (e) {
        console.error("Error cargando Categorias o Estados", e);
        setPermisos([]);
        modalDialogService.Alert("No se pudieron cargar Categorias o Estados.");
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

  // filtros
  //arrays de los select
  const [Categorias, setCategorias] = useState([]);
  const [Estados, setEstados] = useState([]);

  const [Patente, setPatente] = useState("");
  const [Marca, setMarca] = useState("");
  const [Modelo, setModelo] = useState("");
  const [Categoria, setCategoria] = useState("");
  const [Estado, setEstado] = useState("");
  const [AnioDesde, setAnioDesde] = useState("");
  const [AnioHasta, setAnioHasta] = useState("");
  const [KmDesde, setKmDesde] = useState("");
  const [KmHasta, setKmHasta] = useState("");
  const [FumDesde, setFumDesde] = useState("");
  const [FumHasta, setFumHasta] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null);

  async function Buscar(override) {
    let params = {};

    const patente =
      override && Object.prototype.hasOwnProperty.call(override, "patente")
        ? override.patente
        : Patente;
    const marca =
      override && Object.prototype.hasOwnProperty.call(override, "marca")
        ? override.marca
        : Marca;
    const modelo =
      override && Object.prototype.hasOwnProperty.call(override, "modelo")
        ? override.modelo
        : Modelo;
    const categoria =
      override && Object.prototype.hasOwnProperty.call(override, "categoria")
        ? override.categoria
        : Categoria;
    const estado =
      override && Object.prototype.hasOwnProperty.call(override, "estado")
        ? override.estado
        : Estado;
    const anio_desde =
      override && Object.prototype.hasOwnProperty.call(override, "anio_desde")
        ? override.anio_desde
        : AnioDesde;
    const anio_hasta =
      override && Object.prototype.hasOwnProperty.call(override, "anio_hasta")
        ? override.anio_hasta
        : AnioHasta;
    const km_desde =
      override && Object.prototype.hasOwnProperty.call(override, "km_desde")
        ? override.km_desde
        : KmDesde;
    const km_hasta =
      override && Object.prototype.hasOwnProperty.call(override, "km_hasta")
        ? override.km_hasta
        : KmHasta;
    const fum_desde =
      override &&
      Object.prototype.hasOwnProperty.call(
        override,
        "fecha_ultimo_mantenimiento_desde"
      )
        ? override.fecha_ultimo_mantenimiento_desde
        : FumDesde;
    const fum_hasta =
      override &&
      Object.prototype.hasOwnProperty.call(
        override,
        "fecha_ultimo_mantenimiento_hasta"
      )
        ? override.fecha_ultimo_mantenimiento_hasta
        : FumHasta;

    if (patente) params.patente = patente.toLowerCase();
    if (marca) params.marca = marca.toLowerCase();
    if (modelo) params.modelo = modelo.toLowerCase();
    if (categoria !== undefined && categoria !== "") params.categoria = categoria;
    if (estado !== undefined && estado !== "") params.estado = estado;
    if (anio_desde !== undefined && anio_desde !== "") params.anio_desde = anio_desde;
    if (anio_hasta !== undefined && anio_hasta !== "") params.anio_hasta = anio_hasta;
    if (km_desde !== undefined && km_desde !== "") params.km_desde = km_desde;
    if (km_hasta !== undefined && km_hasta !== "") params.km_hasta = km_hasta;
    if (fum_desde) params.fum_desde = fum_desde;
    if (fum_hasta) params.fum_hasta = fum_hasta;
    
    const res = await getVehiculos(params);
    const data = res.data;

    setItems(data);
  }

  async function BuscarPorId(id, accionABMC) {
    const res = await getVehiculoById(id);
    setItem(res.data);
    setAccionABMC(accionABMC);
  }

  const Consultar = (item) => BuscarPorId(item.id_vehiculo, "C");

  const Modificar = (item) => BuscarPorId(item.id_vehiculo, "M");

  const Agregar = () => {
    setAccionABMC("A");
    setItem({
      id_vehiculo: 0,
      patente: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      id_categoria: "",
      id_estado: "",
      km_actual: 0,
      fecha_ultimo_mantenimiento: null,
    });
  };

  const Eliminar = (item) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este vehículo?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteVehiculo(item.id_vehiculo);
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
        await createVehiculo(data);
      } else {
        await updateVehiculo(data.id_vehiculo, data);
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
          <VehiculosBuscar
            Patente={Patente}
            setPatente={setPatente}
            Marca={Marca}
            setMarca={setMarca}
            Modelo={Modelo}
            setModelo={setModelo}
            Categorias={Categorias}
            Categoria={Categoria}
            setCategoria={setCategoria}
            Estados={Estados}
            Estado={Estado}
            setEstado={setEstado}
            AnioDesde={AnioDesde}
            setAnioDesde={setAnioDesde}
            AnioHasta={AnioHasta}
            setAnioHasta={setAnioHasta}
            KmDesde={KmDesde}
            setKmDesde={setKmDesde}
            KmHasta={KmHasta}
            setKmHasta={setKmHasta}
            FumDesde={FumDesde}
            setFumDesde={setFumDesde}
            FumHasta={FumHasta}
            setFumHasta={setFumHasta}
            Buscar={Buscar}
            Agregar={Agregar}
          />

          {Items?.length > 0 ? (
            <VehiculosListado
              Items={Items}
              Buscar={Buscar}
              Consultar={Consultar}
              Modificar={Modificar}
              Eliminar={Eliminar}
            />
          ) : (
            <div className="alert alert-info mensajesAlert">
              <i className="fa fa-exclamation-sign" /> No se encontraron
              vehículos.
            </div>
          )}
        </>
      )}

      {AccionABMC !== "L" && (
        <VehiculosRegistro
          AccionABMC={AccionABMC}
          Item={Item}
          Grabar={Grabar}
          Volver={Volver}
        />
      )}
    </div>
  );
}
