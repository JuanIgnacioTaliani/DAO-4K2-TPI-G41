import React from "react";
import { useForm } from "react-hook-form";

export default function EmpleadosRegistro({
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
                {...register("nombre", { required: true })}
                className="form-control"
              />
                {errors.nombre && (
                  <span className="text-danger">El nombre es requerido</span>
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
                {...register("apellido", { required: true })}
                className="form-control"
              />
                {errors.apellido && (
                  <span className="text-danger">El apellido es requerido</span>
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
                {...register("dni", { required: true })}
                className="form-control"
              />
                {errors.dni && (
                  <span className="text-danger">El DNI es requerido</span>
                )}
            </div>
          </div>

          {/* Teléfono */}
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Teléfono:</label>
            </div>
            <div className="col-sm-8 col-md-6">
                <input {...register("telefono", { required: true })} className="form-control" />
                {errors.telefono && (
                  <span className="text-danger">El teléfono es requerido</span>
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
                  {...register("email", { required: true, pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Formato de email inválido" } })}
                  type="email"
                  className="form-control"
                />
                {errors.email?.type === "required" && (
                  <span className="text-danger">El email es requerido</span>
                )}
                {errors.email?.type === "pattern" && (
                  <span className="text-danger">{errors.email.message}</span>
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
