import React from "react";
import { useForm } from "react-hook-form";

export default function VehiculosRegistro({ AccionABMC, Vehiculos, Empleados, Item, Grabar, Volver }) {
    const { register, handleSubmit, formState: { errors } } = useForm({ values: Item });
    const onSubmit = (data) => Grabar(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="container-fluid">
                <fieldset disabled={AccionABMC === "C"}>

                    <div className="row">
                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Vehiculo:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <select {...register("id_vehiculo", { required: true, validate: value => value !== "" })} className="form-control">
                                <option value="" disabled defaultValue>-- seleccione --</option>
                                {Vehiculos.map((v) => (
                                    <option
                                        key={v.id_vehiculo}
                                        value={v.id_vehiculo}
                                        disabled={v.estado.nombre !== "Disponible"}>
                                        {v.marca} {v.modelo} ({v.patente}) - {v.km_actual} km
                                        {" "}
                                        {v.estado.nombre
                                            ? ` - ${v.estado.nombre}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted">
                                Solo se puede crear mantenimiento si el vehículo no esta alquilado. Si el vehículo tiene reservas futuras, el mantenimiento debe finalizar antes del inicio del alquiler; de lo contrario, la reserva será cancelada automáticamente.
                            </small>
                            {errors.id_vehiculo && (
                                <span className="text-danger">El Vehiculo es requerida</span>
                            )}
                        </div>

                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Responsable:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <select {...register("id_empleado", { required: true, validate: value => value !== "" })} className="form-control">
                                <option value="" disabled defaultValue>Sin Asignar</option>
                                {Empleados.map((e) => (
                                    <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>
                                ))}
                            </select>
                            {errors.id_empleado && (
                                <span className="text-danger">El Responsable es requerida</span>
                            )}
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Fecha Inicio:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <input type="date" {...register("fecha_inicio", { required: true })} className="form-control" />
                            {errors.fecha_inicio && (
                                <span className="text-danger">La Fecha de Inicio es requerida</span>
                            )}
                        </div>
                    </div>
                    <div className="row mt-2">

                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Fecha Fin:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <input type="date" {...register("fecha_fin")} className="form-control" />
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Tipo:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <select {...register("tipo")} className="form-control">
                                <option value="" disabled defaultValue>Seleccione tipo</option>
                                <option value="preventivo">Preventivo</option>
                                <option value="correctivo">Correctivo</option>
                            </select>
                            {errors.tipo && (
                                <span className="text-danger">El Tipo es requerida</span>
                            )}
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Descripcion:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <textarea {...register("descripcion")} className="form-control" rows="3" placeholder="Descripción del mantenimiento" />
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-sm-4 col-md-3 offset-md-1">
                            <label>Costo:</label>
                        </div>
                        <div className="col-sm-8 col-md-6">
                            <input {...register("costo", { required: true })} className="form-control" type="number" step="0.01" />
                            {errors.costo && (
                                <span className="text-danger">La tarifa diaria es requerida</span>
                            )}
                        </div>
                    </div>
                </fieldset>

                <hr />
                <div className="row text-center">
                    <div className="col">
                        {AccionABMC !== "C" && (
                            <button type="submit" className="btn btn-primary m-1">
                                <i className="fa fa-check" /> Grabar
                            </button>
                        )}

                        <button type="button" className="btn btn-warning" onClick={Volver}>
                            <i className="fa fa-undo" /> {AccionABMC === "C" ? "Volver" : "Cancelar"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
