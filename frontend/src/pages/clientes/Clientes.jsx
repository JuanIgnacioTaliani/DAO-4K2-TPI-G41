import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import ClientesBuscar from "./ClientesBuscar";
import ClientesListado from "./ClientesListado";
import ClientesRegistro from "./ClientesRegistro";

import {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../../api/clientesApi";

import modalDialogService from "../../api/modalDialog.service";

export default function Clientes() {
  const { setTitulo } = useOutletContext();

  useEffect(() => {
    setTitulo("Gestión de Clientes");
    Buscar();
  }, [setTitulo]);

  const [AccionABMC, setAccionABMC] = useState("L");

  // filtros
  const [Nombre, setNombre] = useState("");
  const [Apellido, setApellido] = useState("");
  const [Dni, setDni] = useState("");
  const [Estado, setEstado] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null); 

  async function Buscar(override) {
    let params = {};

    const nombre = override && Object.prototype.hasOwnProperty.call(override, "nombre") ? override.nombre : Nombre;
    const apellido = override && Object.prototype.hasOwnProperty.call(override, "apellido") ? override.apellido : Apellido;
    const dni = override && Object.prototype.hasOwnProperty.call(override, "dni") ? override.dni : Dni;
    const estado = override && Object.prototype.hasOwnProperty.call(override, "estado") ? override.estado : Estado;

    if (nombre) params.nombre = nombre;
    if (apellido) params.apellido = apellido;
    if (dni) params.dni = dni;
    if (estado !== undefined && estado !== "") params.estado = estado;

    const res = await getClientes(params);
    const data = res.data;

    setItems(data);
  }

  async function BuscarPorId(id, accionABMC) {
    const res = await getClienteById(id);
    setItem(res.data);
    setAccionABMC(accionABMC);
  }

  const Consultar = (item) => BuscarPorId(item.id_cliente, "C");

  const Modificar = (item) => BuscarPorId(item.id_cliente, "M");

  const Agregar = () => {
    setAccionABMC("A");
    setItem({
      id_cliente: 0,
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      direccion: "",
      estado: true,
    });
  };

  const Eliminar = (item) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este cliente?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteCliente(item.id_cliente);
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
        await createCliente(data);
      } else {
        await updateCliente(data.id_cliente, data);
      }
    } catch (err) {
      modalDialogService.Alert(err?.response?.data?.detail ?? "Error al grabar");
      return;
    }

    await Buscar();
    Volver();
    setTimeout(() => {
      modalDialogService.Alert(
        `Registro ${AccionABMC === "A" ? "agregado" : "modificado"} correctamente`
      );
    }, 0);
  };

  const Volver = () => setAccionABMC("L");

  return (
    <div>
      {AccionABMC === "L" && (
        <>
          <ClientesBuscar
            Nombre={Nombre}
            setNombre={setNombre}
            Apellido={Apellido}
            setApellido={setApellido}
            Dni={Dni}
            setDni={setDni}
            Estado={Estado}
            setEstado={setEstado}
            Buscar={Buscar}
            Agregar={Agregar}
          />

          {Items?.length > 0 ? (
            <ClientesListado
              Items={Items}
              Buscar={Buscar}
              Consultar={Consultar}
              Modificar={Modificar}
              Eliminar={Eliminar}
            />
          ) : (
            <div className="alert alert-info mensajesAlert">
              <i className="fa fa-exclamation-sign" /> No se encontraron clientes.
            </div>
          )}
        </>
      )}

      {AccionABMC !== "L" && (
        <ClientesRegistro
          AccionABMC={AccionABMC}
          Item={Item}
          Grabar={Grabar}
          Volver={Volver}
        />
      )}
    </div>
  );
}
