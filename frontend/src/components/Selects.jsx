import Select from "react-select";
import { selectStyles } from "../assets/selectStyles";

const ClienteSelect = ({ Clientes, Cliente, setCliente }) => {
  const options = (Clientes || []).map((c) => ({
    value: c.id_cliente,
    label: `${c.nombre} ${c.apellido}`,
  }));

  const selected = options.find((o) => o.value === Cliente) || null;

  return (
    <Select
      options={options}
      value={selected}
      styles={selectStyles}
      onChange={(opt) => setCliente(opt ? opt.value : "")}
      isClearable
      placeholder="Seleccione un cliente"
      classNamePrefix="react-select"
    />
  );
};

const VehiculoSelect = ({ Vehiculos, Vehiculo, setVehiculo }) => {
  const options = (Vehiculos || []).map((v) => ({
    value: v.id_vehiculo,
    label: `${v.marca} ${v.modelo} - ${v.patente}`,
  }));

  const selected = options.find((o) => o.value === Vehiculo) || null;

  return (
    <Select
      options={options}
      value={selected}
      styles={selectStyles}
      onChange={(opt) => setVehiculo(opt ? opt.value : "")}
      isClearable
      placeholder="Seleccione un vehículo"
      classNamePrefix="react-select"
    />
  );
};

const EmpleadosSelect = ({ Empleados, Empleado, setEmpleado }) => {
  const options = (Empleados || []).map((e) => ({
    value: e.id_empleado,
    label: `${e.nombre} ${e.apellido} - ${e.legajo}`,
  }));

  const selected = options.find((o) => o.value === Empleado) || null;

  return (
    <Select
      options={options}
      value={selected}
      styles={selectStyles}
      onChange={(opt) => setEmpleado(opt ? opt.value : "")}
      isClearable
      placeholder="Seleccione un empleado"
      classNamePrefix="react-select"
    />
  );
};

export { ClienteSelect, VehiculoSelect, EmpleadosSelect };