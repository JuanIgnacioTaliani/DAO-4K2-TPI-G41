import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { selectStyles } from "../../assets/selectStyles";

import { getDisponibilidad } from "../../api/vehiculosApi";
import modalDialogService from "../../api/modalDialog.service";

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
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({ values: Item });
  const onSubmit = (data) => {
    calcularCostoBase(data);
    definirEstadoInicial(data);
    Grabar(data);
  };

  useEffect(() => {
      if (AccionABMC === "M") {
        cargarDisponibilidad(Item.id_vehiculo);
      }
  }, []);

  const cargarDisponibilidad = async (id_vehiculo) => {
    try {
        const response = await getDisponibilidad(id_vehiculo);
        // Excluir el alquiler actual de la disponibilidad
        response.data.alquileres = response.data.alquileres.filter(
          (alq) => alq.id_alquiler !== Item.id_alquiler
        );
        setDisponibilidad(response.data);
    } catch (error) {
      modalDialogService.Alert(
        error?.response?.data?.detail ?? "Error al cargar disponibilidad"
      );
      setDisponibilidad(null);
    }
  };

  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);

  const fechaInicio = watch("fecha_inicio");
  const fechaFin = watch("fecha_fin");

  const handleVehiculoChange = async (event) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      setDisponibilidad(null);
      return;
    }

    setLoadingDisponibilidad(true);
    try {
      await cargarDisponibilidad(selectedId);
      // Limpiar fechas seleccionadas al cambiar de vehículo
      setValue("fecha_inicio", "");
      setValue("fecha_fin", "");
    } catch (error) {
      modalDialogService.Alert(
        error?.response?.data?.detail ?? "Error al cargar disponibilidad"
      );
      setDisponibilidad(null);
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  // Función para verificar si una fecha está en un rango ocupado
  const esFechaOcupada = (fecha) => {
    if (!disponibilidad) return false;

    const fechaCheck = new Date(fecha + "T00:00:00");

    // Verificar alquileres
    const ocupadaPorAlquiler = disponibilidad.alquileres?.some((alq) => {
      const inicio = new Date(alq.fecha_inicio + "T00:00:00");
      const fin = new Date(alq.fecha_fin + "T00:00:00");
      return fechaCheck >= inicio && fechaCheck <= fin;
    });

    // Verificar mantenimientos
    const ocupadaPorMantenimiento = disponibilidad.mantenimientos?.some(
      (mant) => {
        const inicio = new Date(mant.fecha_inicio + "T00:00:00");
        const fin = new Date(mant.fecha_fin + "T00:00:00");
        return fechaCheck >= inicio && fechaCheck <= fin;
      }
    );

    return ocupadaPorAlquiler || ocupadaPorMantenimiento;
  };

  // Validar que el rango seleccionado no tenga fechas ocupadas
  const validarRangoDisponible = () => {
    if (!fechaInicio || !fechaFin) return true;

    const inicio = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
      const fechaStr = d.toISOString().split("T")[0];
      if (esFechaOcupada(fechaStr)) {
        return false;
      }
    }
    return true;
  };

  const calcularCostoBase = (data) => {
    if (!disponibilidad || !fechaInicio || !fechaFin) {
      data.costo_base = 0;
      data.costo_total = 0;
      return;
    }

    const tarifaDiaria = disponibilidad.vehiculo.categoria.tarifa_diaria || 0;
    const inicio = new Date(fechaInicio + "T00:00:00");
    const fin = new Date(fechaFin + "T00:00:00");
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de fin
    data.costo_base = tarifaDiaria * diffDays;
    data.costo_total = data.costo_base;
    return;
  }

  const definirEstadoInicial = (data) => {
    // Si la fecha de inicio es hoy o anterior, el estado es 'EN_CURSO', sino 'PENDIENTE'
    const hoy = new Date();
    const inicio = new Date(fechaInicio + "T00:00:00");
    if (inicio <= hoy) {
      data.estado = "EN_CURSO";
    } else {
      data.estado = "PENDIENTE";
    }
    return;
  }

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
                    <Controller
                      name="id_vehiculo"
                      control={control}
                      rules={{ required: true, validate: (v) => v !== "" }}
                      render={({ field }) => {
                        const options = (Vehiculos || []).map((v) => ({
                          value: v.id_vehiculo,
                          label: `${v.marca} ${v.modelo} (${v.patente}) - ${v.km_actual} km`,
                        }));
                        const selected = options.find((o) => o.value === field.value) || null;
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
                    {errors.id_vehiculo && (
                      <div className="text-danger">El vehículo es obligatorio.</div>
                    )}
                  </div>
                </div>

                {/* Disponibilidad y Selección de Fechas */}
                {loadingDisponibilidad && (
                  <div className="row mt-3">
                    <div className="col-12 text-center">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">
                          Cargando disponibilidad...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {disponibilidad && !loadingDisponibilidad && (
                  <>
                    <div className="row mt-4">
                      <div className="col-12 mb-3">
                        <h5 className="text-primary">
                          <i className="fa fa-calendar mr-2"></i>
                          Paso 2: Selecciona el rango de fechas
                        </h5>
                      </div>
                    </div>

                    {/* Información del vehículo */}
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <div className="alert alert-info">
                          <strong>Vehículo seleccionado:</strong>{" "}
                          {disponibilidad.vehiculo.marca}{" "}
                          {disponibilidad.vehiculo.modelo} (
                          {disponibilidad.vehiculo.patente})
                          <br />
                          <strong>Estado:</strong>{" "}
                          {disponibilidad.vehiculo.estado.nombre}
                          <br />
                          <strong>Categoría:</strong>{" "}
                          {disponibilidad.vehiculo.categoria.nombre} - $
                          {disponibilidad.vehiculo.categoria.tarifa_diaria} por
                          día
                        </div>
                      </div>
                    </div>

                    {/* Períodos ocupados */}
                    {(disponibilidad.alquileres?.length > 0 ||
                      disponibilidad.mantenimientos?.length > 0) && (
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="card card-warning">
                            <div className="card-header">
                              <h3 className="card-title">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                Períodos no disponibles
                              </h3>
                            </div>
                            <div className="card-body">
                              {disponibilidad.alquileres?.length > 0 && (
                                <div className="mb-2">
                                  <strong>Alquileres:</strong>
                                  <ul className="mb-0">
                                    {disponibilidad.alquileres.map((alq) => (
                                      <li key={alq.id_alquiler}>
                                        {alq.fecha_inicio} al {alq.fecha_fin} -
                                        Cliente: {alq.cliente.nombre}{" "}
                                        {alq.cliente.apellido} (Estado:{" "}
                                        {alq.estado})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {disponibilidad.mantenimientos?.length > 0 && (
                                <div>
                                  <strong>Mantenimientos:</strong>
                                  <ul className="mb-0">
                                    {disponibilidad.mantenimientos.map(
                                      (mant) => (
                                        <li key={mant.id_mantenimiento}>
                                          {mant.fecha_inicio} al{" "}
                                          {mant.fecha_fin} - Tipo: {mant.tipo}{" "}
                                          (Costo: ${mant.costo})
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Selección de fechas */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label>Fecha de inicio:</label>
                        <input
                          type="date"
                          {...register("fecha_inicio", {
                            required: "La fecha de inicio es obligatoria",
                          })}
                          className="form-control"
                          // si AccionABMC === "M" no contemplar minima fecha de hoy
                          min={AccionABMC === "M" ? undefined : new Date().toISOString().split("T")[0]}
                        />
                        {errors.fecha_inicio && (
                          <div className="text-danger">
                            {errors.fecha_inicio.message}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label>Fecha de fin:</label>
                        <input
                          type="date"
                          {...register("fecha_fin", {
                            required: "La fecha de fin es obligatoria",
                            validate: {
                              afterStart: (value) =>
                                !fechaInicio ||
                                value >= fechaInicio ||
                                "La fecha de fin debe ser posterior a la de inicio",
                              disponible: () =>
                                validarRangoDisponible() ||
                                "El rango seleccionado incluye fechas no disponibles",
                            },
                          })}
                          className="form-control"
                          min={
                            fechaInicio ||
                            new Date().toISOString().split("T")[0]
                          }
                        />
                        {errors.fecha_fin && (
                          <div className="text-danger">
                            {errors.fecha_fin.message}
                          </div>
                        )}
                      </div>
                    </div>

                    {fechaInicio && fechaFin && validarRangoDisponible() && (
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="alert alert-success">
                            <i className="fas fa-check-circle mr-2"></i>
                            <strong>¡Fechas disponibles!</strong> El vehículo
                            está disponible del {fechaInicio} al {fechaFin}
                          </div>
                        </div>
                      </div>
                    )}

                    {fechaInicio && fechaFin && !validarRangoDisponible() && (
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <div className="alert alert-danger">
                            <i className="fas fa-times-circle mr-2"></i>
                            <strong>¡Atención!</strong> El rango seleccionado
                            incluye fechas no disponibles. Por favor, elige
                            otras fechas.
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="row mt-2">
                      <div className="col-12 mb-3">
                        <h5 className="text-primary">
                          <i className="fa fa-user mr-2"></i>
                          Paso 3: Completar Informacion Requerida.
                        </h5>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Empleado:</label>
                        <Controller
                          name="id_empleado"
                          control={control}
                          rules={{ required: true, validate: (v) => v !== "" }}
                          render={({ field }) => {
                            const options = (Empleados || []).map((e) => ({
                              value: e.id_empleado,
                              label: `${e.nombre} ${e.apellido}`,
                            }));
                            const selected = options.find((o) => o.value === field.value) || null;
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
                          <div className="text-danger">Este campo es obligatorio</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label>Cliente:</label>
                        <Controller
                          name="id_cliente"
                          control={control}
                          rules={{ required: true, validate: (v) => v !== "" }}
                          render={({ field }) => {
                            const options = (Clientes || []).map((c) => ({
                              value: c.id_cliente,
                              label: `${c.nombre} ${c.apellido}`,
                            }));
                            const selected = options.find((o) => o.value === field.value) || null;
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
                        {errors.id_cliente && (
                          <div className="text-danger">Este campo es obligatorio</div>
                        )}
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Observaciones</label>
                        <textarea
                          {...register("observaciones") } className="form-control"
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Kilometraje Inicial</label>
                        <input
                          type="number"
                          {...register("km_inicial", {
                            required: true,
                            min: 0,
                          })}
                          className="form-control"
                        />
                        {errors.kilometraje_actual && (
                          <div className="text-danger">
                            Este campo es obligatorio y debe ser un número
                            positivo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="row mt-4">
                      <div className="col-12 text-center">
                        <button
                          type="submit"
                          className="btn btn-primary m-1"
                          disabled={!validarRangoDisponible()}
                        >
                          <i className="fa fa-check" /> Grabar
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={Volver}
                        >
                          <i className="fa fa-undo" /> Cancelar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
