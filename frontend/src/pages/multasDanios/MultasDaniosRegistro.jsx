import React from "react";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../assets/selectStyles";
import Select from "react-select";

export default function MultasDaniosRegistro({
  AccionABMC,
  Alquileres,
  Item,
  Grabar,
  Volver,
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: Item });

  // Ensure form resets when Item changes (preselect alquiler on Agregar)
  React.useEffect(() => {
    reset(Item);
  }, [Item, reset]);
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
              <Controller
                name="id_alquiler"
                control={control}
                rules={{ required: true, validate: (a) => a !== "" }}
                render={({ field }) => {
                  const options = (Alquileres || []).map((a) => ({
                    value: a.id_alquiler,
                    label: `Alquiler #${a.id_alquiler} - ${a.fecha_inicio}`,
                  }));
                  const selected =
                    options.find((o) => o.value === field.value) || null;
                  return (
                    <Select
                      options={options}
                      value={selected}
                      styles={selectStyles}
                      onChange={(opt) => {
                        const val = opt ? opt.value : "";
                        field.onChange(val);
                        // reuse existing handler to load disponibilidad and clear dates
                        handleVehiculoChange({ target: { value: val } });
                      }}
                      isClearable
                      placeholder="-- seleccione --"
                      classNamePrefix="react-select"
                    />
                  );
                }}
              />
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
