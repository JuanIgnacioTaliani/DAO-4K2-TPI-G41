import React from "react";
import { useForm } from "react-hook-form";

export default function ClientesRegistro({
  AccionABMC,
  Item,
  Grabar,
  Volver
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields }
  } = useForm({ values: Item });

  const onSubmit = (data) => Grabar(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container-fluid">
        
        <fieldset disabled={AccionABMC === "C"}>

          {/* Nombre */}
          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Nombre:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input
                {...register("nombre", { required: "El nombre es obligatorio" })}
                className="form-control"
              />
              {errors.nombre && (
                <div className="text-danger small mt-1">{errors.nombre.message}</div>
              )}
            </div>
          </div>

          {/* Apellido */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Apellido:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input 
                {...register("apellido", { required: "El apellido es obligatorio" })}
                className="form-control"
              />
              {errors.apellido && (
                <div className="text-danger small mt-1">{errors.apellido.message}</div>
              )}
            </div>
          </div>

          {/* DNI */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>DNI:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input 
                {...register("dni", { required: "El DNI es obligatorio" })}
                className="form-control"
              />
              {errors.dni && (
                <div className="text-danger small mt-1">{errors.dni.message}</div>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Teléfono:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input {...register("telefono", { required: "El teléfono es obligatorio" })} className="form-control" />
              {errors.telefono && (
                <div className="text-danger small mt-1">{errors.telefono.message}</div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Email:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input 
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Debe ingresar un email válido"
                  }
                })}
                type="email"
                className="form-control"
              />
              {errors.email && (
                <div className="text-danger small mt-1">{errors.email.message}</div>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Dirección:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input 
                {...register("direccion", { required: "La dirección es obligatoria" })}
                className="form-control"
              />
              {errors.direccion && (
                <div className="text-danger small mt-1">{errors.direccion.message}</div>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Activo:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <select 
                {...register("estado")}
                className="form-control"
              >
              <option value={true}>SI</option>
              <option value={false}>NO</option>
              </select>
            </div>
          </div>

        </fieldset>

        {/* BOTONES */}
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
