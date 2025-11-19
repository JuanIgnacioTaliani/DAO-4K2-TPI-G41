import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import EmpleadosBuscar from "./EmpleadosBuscar";
import EmpleadosListado from "./EmpleadosListado";
import EmpleadosRegistro from "./EmpleadosRegistro";


import {
  getEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
} from "../../api/empleadosApi";

import modalDialogService from "../../api/modalDialog.service";

export default function Empleados() {
  const { setTitulo } = useOutletContext();

  useEffect(() => {
    setTitulo("Gestión de Empleados");
    Buscar();
  }, [setTitulo]);

  const [AccionABMC, setAccionABMC] = useState("L");

  // filtros
  const [Nombre, setNombre] = useState("");
  const [Apellido, setApellido] = useState("");
  const [Dni, setDni] = useState("");
  const [Legajo, setLegajo] = useState("");
  const [Estado, setEstado] = useState("");

  const [Items, setItems] = useState(null);
  const [Item, setItem] = useState(null); 

  async function Buscar(override) {
    let params = {};

    const nombre = override && Object.prototype.hasOwnProperty.call(override, "nombre") ? override.nombre : Nombre;
    const apellido = override && Object.prototype.hasOwnProperty.call(override, "apellido") ? override.apellido : Apellido;
    const dni = override && Object.prototype.hasOwnProperty.call(override, "dni") ? override.dni : Dni;
    const legajo = override && Object.prototype.hasOwnProperty.call(override, "legajo") ? override.legajo : Legajo;
    const estado = override && Object.prototype.hasOwnProperty.call(override, "estado") ? override.estado : Estado;

    if (nombre) params.nombre = nombre;
    if (apellido) params.apellido = apellido;
    if (dni) params.dni = dni;
    if (legajo) params.legajo = legajo;
    if (estado !== undefined && estado !== "") params.estado = estado;

    const res = await getEmpleados(params);
    const data = res.data;

    setItems(data);
  }

  async function BuscarPorId(id, accionABMC) {
    const res = await getEmpleadoById(id);
    setItem(res.data);
    setAccionABMC(accionABMC);
  }

  const Consultar = (item) => BuscarPorId(item.id_empleado, "C");

  const Modificar = (item) => BuscarPorId(item.id_empleado, "M");

  const Agregar = () => {
    setAccionABMC("A");
    setItem({
    id_empleado: 1,
    nombre: "",
    apellido: "",
    dni: "",
    legajo: "",
    email: "",
    telefono: "",
    rol: "",
    estado: true,
    });
  };

  const Eliminar = (item) => {
    modalDialogService.Confirm(
      "¿Seguro que querés eliminar este empleado?",
      undefined,
      undefined,
      undefined,
      async () => {
        try {
          await deleteEmpleado(item.id_empleado);
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
        await createEmpleado(data);
      } else {
        await updateEmpleado(data.id_empleado, data);
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
          <EmpleadosBuscar
            Nombre={Nombre}
            setNombre={setNombre}
            Apellido={Apellido}
            setApellido={setApellido}
            Dni={Dni}
            setDni={setDni}
            Legajo={Legajo}
            setLegajo={setLegajo}
            Estado={Estado}
            setEstado={setEstado}
            Buscar={Buscar}
            Agregar={Agregar}
          />

          {Items?.length > 0 ? (
            <EmpleadosListado
              Items={Items}
              Buscar={Buscar}
              Consultar={Consultar}
              Modificar={Modificar}
              Eliminar={Eliminar}
            />
          ) : (
            <div className="alert alert-info mensajesAlert">
              <i className="fa fa-exclamation-sign" /> No se encontraron empleados.
            </div>
          )}
        </>
      )}

      {AccionABMC !== "L" && (
        <EmpleadosRegistro
          AccionABMC={AccionABMC}
          Item={Item}
          Grabar={Grabar}
          Volver={Volver}
        />
      )}
    </div>
  );
}
