import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import MantenimientosBuscar from "./MantenimientosBuscar";
import MantenimientosListado from "./MantenimientosListado";
import MantenimientosRegistro from "./MantenimientosRegistro";

import {
    getMantenimientos,
    getMantenimiento,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
} from "../../api/mantenimientosApi";
import { getVehiculos } from "../../api/vehiculosApi";
import { getEmpleados } from "../../api/empleadosApi";

import modalDialogService from "../../api/modalDialog.service";

export default function Mantenimientos() {
    const { setTitulo } = useOutletContext();

    useEffect(() => {
        setTitulo("Gestión de Mantenimientos");
        Buscar();
        (async () => {
            try {
                const veh = await getVehiculos();
                const emp = await getEmpleados();
                setVehiculos(veh.data ?? []);
                setEmpleados(emp.data ?? []);

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

    //arrays de los select
    const [Vehiculos, setVehiculos] = useState([]);
    const [Empleados, setEmpleados] = useState([]);

    // filtros
    const [Vehiculo, setVehiculo] = useState("");
    const [Tipo, setTipo] = useState("");
    const [Estado, setEstado] = useState(""); // en_curso, finalizado, todos

    const [Items, setItems] = useState(null);
    const [Item, setItem] = useState(null);

    async function Buscar(override) {
        let params = {};

        const vehiculo =
            override && Object.prototype.hasOwnProperty.call(override, "vehiculo")
                ? override.vehiculo
                : Vehiculo;

        const tipo =
            override && Object.prototype.hasOwnProperty.call(override, "tipo")
                ? override.tipo
                : Tipo;

        const estado =
            override && Object.prototype.hasOwnProperty.call(override, "estado")
                ? override.estado
                : Estado

        if (vehiculo !== undefined && vehiculo !== "") params.vehiculo = vehiculo;
        if (tipo) params.tipo = tipo;
        if (estado !== undefined && estado !== "") params.estado = estado;

        const res = await getMantenimientos(params);
        const data = res.data;

        setItems(data);
    }

    async function BuscarPorId(id, accionABMC) {
        const res = await getMantenimiento(id);
        setItem(res.data);
        setAccionABMC(accionABMC);
    }

    const Consultar = (item) => BuscarPorId(item.id_mantenimiento, "C");

    const Modificar = (item) => BuscarPorId(item.id_mantenimiento, "M");

    const Agregar = () => {
        setAccionABMC("A");
        setItem({
            id_mantenimiento: 0,
            id_vehiculo: "",
            fecha_inicio: "",
            fecha_fin: "",
            tipo: "",
            descripcion: "",
            costo: "",
            id_empleado: "",
        });
    };

    const Eliminar = (item) => {
        modalDialogService.Confirm(
            "¿Seguro que querés eliminar este mantenimiento?",
            undefined,
            undefined,
            undefined,
            async () => {
                try {
                    await deleteMantenimiento(item.id_mantenimiento);
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
                await createMantenimiento(data);
            } else {
                await updateMantenimiento(data.id_mantenimiento, data);
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
                `Registro ${AccionABMC === "A" ? "agregado" : "modificado"
                } correctamente`
            );
        }, 0);
    };

    const Volver = () => setAccionABMC("L");

    return (
        <div>
            {AccionABMC === "L" && (
                <>
                    <MantenimientosBuscar
                        Vehiculos={Vehiculos}
                        Vehiculo={Vehiculo}
                        setVehiculo={setVehiculo}
                        Tipo={Tipo}
                        setTipo={setTipo}
                        Estado={Estado}
                        setEstado={setEstado}
                        Buscar={Buscar}
                        Agregar={Agregar}
                    />

                    {Items?.length > 0 ? (
                        <MantenimientosListado
                            Items={Items}
                            Buscar={Buscar}
                            Consultar={Consultar}
                            Modificar={Modificar}
                            Eliminar={Eliminar}
                        />
                    ) : (
                        <div className="alert alert-info mensajesAlert">
                            <i className="fa fa-exclamation-sign" /> No se encontraron
                            mantenimientos.
                        </div>
                    )}
                </>
            )}

            {AccionABMC !== "L" && (
                <MantenimientosRegistro
                    AccionABMC={AccionABMC}
                    Vehiculos={Vehiculos}
                    Empleados={Empleados}
                    Item={Item}
                    Grabar={Grabar}
                    Volver={Volver}
                />
            )}
        </div>
    );
}