import React from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { selectStyles } from "../../assets/selectStyles";

export default function VehiculosRegistro({
  AccionABMC,
  Vehiculos,
  Empleados,
  Item,
  Grabar,
  Volver,
}) {
  const {
    register,
    control,
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
              <label>Vehiculo:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <Controller
                name="id_vehiculo"
                control={control}
                rules={{ required: true, validate: (v) => v !== "" }}
                render={({ field }) => {
                  const options = (Vehiculos || []).map((v) => ({
                    value: v.id_vehiculo,
                    label: `${v.marca} ${v.modelo} (${v.patente}) - ${v.km_actual} km`,
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
              <small className="form-text text-muted">
                Solo se puede crear mantenimiento si el vehículo no esta
                alquilado. Si el vehículo tiene reservas futuras, el
                mantenimiento debe finalizar antes del inicio del alquiler; de
                lo contrario, la reserva será cancelada automáticamente.
              </small>
              {errors.id_vehiculo && (
                <span className="text-danger">El Vehiculo es requerida</span>
              )}
            </div>

            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Responsable:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <Controller
                name="id_empleado"
                control={control}
                rules={{ required: true, validate: (v) => v !== "" }}
                render={({ field }) => {
                  const options = (Empleados || []).map((e) => ({
                    value: e.id_empleado,
                    label: `${e.nombre} ${e.apellido}`,
                  }));
                  const selected =
                    options.find((o) => o.value === field.value) || null;
                  return (
                    <Select
                      options={options}
                      value={selected}
                      styles={selectStyles}
                      onChange={(opt) => field.onChange(opt ? opt.value : "")}
                      isClearable
                      placeholder="-- seleccione --"
                      classNamePrefix="react-select"
                    />
                  );
                }}
              />
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
              <input
                type="date"
                {...register("fecha_inicio", { required: true })}
                className="form-control"
              />
              {errors.fecha_inicio && (
                <span className="text-danger">
                  La Fecha de Inicio es requerida
                </span>
              )}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Fecha Fin:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input
                type="date"
                {...register("fecha_fin")}
                className="form-control"
              />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Tipo:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <select {...register("tipo")} className="form-control">
                <option value="" disabled defaultValue>
                  Seleccione tipo
                </option>
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
              <textarea
                {...register("descripcion")}
                className="form-control"
                rows="3"
                placeholder="Descripción del mantenimiento"
              />
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-sm-4 col-md-3 offset-md-1">
              <label>Costo:</label>
            </div>
            <div className="col-sm-8 col-md-6">
              <input
                {...register("costo", { required: true })}
                className="form-control"
                type="number"
                step="0.01"
              />
              {errors.costo && (
                <span className="text-danger">
                  La tarifa diaria es requerida
                </span>
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
              <i className="fa fa-undo" />{" "}
              {AccionABMC === "C" ? "Volver" : "Cancelar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
