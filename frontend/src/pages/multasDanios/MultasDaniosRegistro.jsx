import React from "react";
import { useForm } from "react-hook-form";

export default function MultasDaniosRegistro({
  AccionABMC,
  Alquileres,
  Item,
  Grabar,
  Volver,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ values: Item });
  const onSubmit = (data) => Grabar(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="container-fluid">
        <fieldset disabled={AccionABMC === "C"}>
          <div className="row">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Alquiler:</label>
            </div>

            <div className="col-sm-8 col-md-7">
              <select
                className="form-control form-control-sm"
                {...register("id_alquiler", { required: true })}
              >
                <option value="" defaultValue>
                  -- Seleccione --
                </option>
                {Alquileres.map((a) => (
                  <option key={a.id_alquiler} value={a.id_alquiler}>
                    Alquiler #{a.id_alquiler} - {a.fecha_inicio}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-4 col-md-3 offset-md-1 mt-2">
              <label>Tipo:</label>
            </div>
            <div className="col-sm-8 col-md-7 mt-2">
              <select
                className="form-control"
                {...register("tipo", { required: true })}
              >
                <option value="multa">Multa</option>
                <option value="daño">Daño</option>
                <option value="retraso">Retraso</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="col-sm-4 col-md-3 offset-md-1 mt-2">
              <label>Descripción:</label>
            </div>
            <div className="col-sm-8 col-md-7 mt-2">
              <textarea
                className="form-control"
                {...register("descripcion", { required: true })}
              />
            </div>

            <div className="col-sm-4 col-md-3 offset-md-1 mt-2">
              <label>Monto:</label>
            </div>
            <div className="col-sm-8 col-md-7 mt-2">
              <input
                type="number"
                step="0.01"
                className="form-control"
                {...register("monto", { required: true, min: 0 })}
              />
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
              <i className="fa fa-undo" />{" "}
              {AccionABMC === "C" ? "Volver" : "Cancelar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
