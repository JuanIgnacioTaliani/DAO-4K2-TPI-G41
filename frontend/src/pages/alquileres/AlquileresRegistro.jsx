import React, { useState } from "react";
import { useForm } from "react-hook-form";

export default function AlquileresRegistro({
  AccionABMC,
  Item,
  Vehiculos,
  Empleados,
  Clientes,
  Grabar,
  Volver,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ values: Item });
  const onSubmit = (data) => Grabar(data);

  const [VehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  const handleVehiculoChange = (event) => {
    const selectedId = event.target.value;
    const selectedVehiculo = Vehiculos.find(v => v.id_vehiculo === selectedId);
    setVehiculoSeleccionado(selectedVehiculo);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-12 col-md-12">
          <div className="card card-primary mb-4">
            <div className="card-header">
              <h3 className="card-title mb-0">
                {AccionABMC === "A" ? "Nuevo alquiler" : "Modificar alquiler"}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row">
                  <div className="col-12 mb-3">
                    <h5 className="text-primary">
                      <i className="fa fa-calendar mr-2"></i>
                      Paso 1: Seleccioná el vehiculo.
                    </h5>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Vehículo:</label>
                    <select
                      {...register("id_vehiculo", {
                        required: true,
                        validate: (value) => value !== "",
                      })}
                      className="form-control"
                    >
                      <option value="" disabled defaultValue>
                        -- seleccione --
                      </option>

                      {Vehiculos.map((v) => (
                        <option
                          key={v.id_vehiculo}
                          value={v.id_vehiculo}
                        >
                          {v.marca} {v.modelo} ({v.patente}) - {v.km_actual} km{" "}
                          {v.estado.nombre ? ` - ${v.estado.nombre}` : ""}
                        </option>
                      ))}
                    </select>
                    {errors.id_vehiculo && (
                      <div className="text-danger">
                        El vehículo es obligatorio.
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
