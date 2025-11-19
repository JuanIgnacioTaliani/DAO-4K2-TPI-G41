import React from "react";
import { useForm } from "react-hook-form";
import { mockCategoriasVehiculo, mockEstadosVehiculo } from "../../api/mockData";

export default function VehiculosRegistro({ AccionABMC, Item, Grabar, Volver }) {
  const { register, handleSubmit } = useForm({ values: Item });
  const onSubmit = (data) => Grabar(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container-fluid">
        <fieldset disabled={AccionABMC === "C"}>

          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Patente:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input {...register("patente", { required: true })} className="form-control" />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Marca:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input {...register("marca")} className="form-control" />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Modelo:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input {...register("modelo")} className="form-control" />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Año:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input type="number" {...register("anio")} className="form-control" />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Categoría:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <select {...register("id_categoria")} className="form-control">
                <option value="">-- seleccione --</option>
                {mockCategoriasVehiculo.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Estado:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <select {...register("id_estado")} className="form-control">
                <option value="">-- seleccione --</option>
                {mockEstadosVehiculo.map((s) => (
                  <option key={s.id_estado} value={s.id_estado}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>KM actual:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input type="number" {...register("km_actual")} className="form-control" />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Fecha último mantenimiento:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input type="date" {...register("fecha_ultimo_mantenimiento")} className="form-control" />
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
