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

import modalDialogService from "../../api/modalDialog.service";

export default function Vehiculos() {
  const { setTitulo } = useOutletContext();

  useEffect(() => {
    setTitulo("Gestión de Vehículos");
    Buscar();
  }, [setTitulo]);

  const [AccionABMC, setAccionABMC] = useState("L");

  // filtros
  const [Patente, setPatente] = useState("");
  const [Marca, setMarca] = useState("");
  const [Modelo, setModelo] = useState("");
  const [IdCategoria, setIdCategoria] = useState("");
  const [IdEstado, setIdEstado] = useState("");
  const [AnioDesde, setAnioDesde] = useState("");
  const [AnioHasta, setAnioHasta] = useState("");
  const [KmDesde, setKmDesde] = useState("");
  const [KmHasta, setKmHasta] = useState("");
  const [FumDesde, setFumDesde] = useState("");
  const [FumHasta, setFumHasta] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null);

  async function Buscar(override) {
    // get all then apply filters client-side (mock doesn't filter)
    const res = await getVehiculos();
    let data = res.data;

    const patente = override && Object.prototype.hasOwnProperty.call(override, "patente") ? override.patente : Patente;
    const marca = override && Object.prototype.hasOwnProperty.call(override, "marca") ? override.marca : Marca;
    const modelo = override && Object.prototype.hasOwnProperty.call(override, "modelo") ? override.modelo : Modelo;
    const id_categoria = override && Object.prototype.hasOwnProperty.call(override, "id_categoria") ? override.id_categoria : IdCategoria;
    const id_estado = override && Object.prototype.hasOwnProperty.call(override, "id_estado") ? override.id_estado : IdEstado;
    const anio_desde = override && Object.prototype.hasOwnProperty.call(override, "anio_desde") ? override.anio_desde : AnioDesde;
    const anio_hasta = override && Object.prototype.hasOwnProperty.call(override, "anio_hasta") ? override.anio_hasta : AnioHasta;
    const km_desde = override && Object.prototype.hasOwnProperty.call(override, "km_desde") ? override.km_desde : KmDesde;
    const km_hasta = override && Object.prototype.hasOwnProperty.call(override, "km_hasta") ? override.km_hasta : KmHasta;
    const fum_desde = override && Object.prototype.hasOwnProperty.call(override, "fecha_ultimo_mantenimiento_desde") ? override.fecha_ultimo_mantenimiento_desde : FumDesde;
    const fum_hasta = override && Object.prototype.hasOwnProperty.call(override, "fecha_ultimo_mantenimiento_hasta") ? override.fecha_ultimo_mantenimiento_hasta : FumHasta;

    if (patente) data = data.filter((v) => v.patente.toLowerCase().includes(String(patente).toLowerCase()));
    if (marca) data = data.filter((v) => v.marca.toLowerCase().includes(String(marca).toLowerCase()));
    if (modelo) data = data.filter((v) => v.modelo.toLowerCase().includes(String(modelo).toLowerCase()));
    if (id_categoria !== undefined && id_categoria !== "") data = data.filter((v) => String(v.id_categoria) === String(id_categoria));
    if (id_estado !== undefined && id_estado !== "") data = data.filter((v) => String(v.id_estado) === String(id_estado));
    if (anio_desde !== undefined && anio_desde !== "") {
      const desde = parseInt(anio_desde, 10);
      if (!Number.isNaN(desde)) data = data.filter((v) => Number(v.anio) >= desde);
    }
    if (anio_hasta !== undefined && anio_hasta !== "") {
      const hasta = parseInt(anio_hasta, 10);
      if (!Number.isNaN(hasta)) data = data.filter((v) => Number(v.anio) <= hasta);
    }
    if (km_desde !== undefined && km_desde !== "") {
      const desdeKm = parseInt(km_desde, 10);
      if (!Number.isNaN(desdeKm)) data = data.filter((v) => Number(v.km_actual) >= desdeKm);
    }
    if (km_hasta !== undefined && km_hasta !== "") {
      const hastaKm = parseInt(km_hasta, 10);
      if (!Number.isNaN(hastaKm)) data = data.filter((v) => Number(v.km_actual) <= hastaKm);
    }
    if (fum_desde) {
      data = data.filter((v) => v.fecha_ultimo_mantenimiento && v.fecha_ultimo_mantenimiento >= fum_desde);
    }
    if (fum_hasta) {
      data = data.filter((v) => v.fecha_ultimo_mantenimiento && v.fecha_ultimo_mantenimiento <= fum_hasta);
    }

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
          modalDialogService.Alert(err?.response?.data?.detail ?? "Error al eliminar");
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
          <VehiculosBuscar
            Patente={Patente}
            setPatente={setPatente}
            Marca={Marca}
            setMarca={setMarca}
            Modelo={Modelo}
            setModelo={setModelo}
            IdCategoria={IdCategoria}
            setIdCategoria={setIdCategoria}
            IdEstado={IdEstado}
            setIdEstado={setIdEstado}
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
              <i className="fa fa-exclamation-sign" /> No se encontraron vehículos.
            </div>
          )}
        </>
      )}

      {AccionABMC !== "L" && (
        <VehiculosRegistro AccionABMC={AccionABMC} Item={Item} Grabar={Grabar} Volver={Volver} />
      )}
    </div>
  );
}
