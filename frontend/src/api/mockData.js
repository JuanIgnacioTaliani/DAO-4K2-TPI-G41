// Datos mockeados para desarrollo/testing
// Basados en el modelo de datos de SQLAlchemy

export const mockClientes = [
  {
    id_cliente: 1,
    nombre: "Juan",
    apellido: "Pérez",
    dni: "12345678",
    telefono: "351-1234567",
    email: "juan.perez@email.com",
    direccion: "Av. Colón 1234, Córdoba",
    estado: true,
  },
  {
    id_cliente: 2,
    nombre: "María",
    apellido: "González",
    dni: "87654321",
    telefono: "351-7654321",
    email: "maria.gonzalez@email.com",
    direccion: "Bv. San Juan 5678, Córdoba",
    estado: true,
  },
  {
    id_cliente: 3,
    nombre: "Carlos",
    apellido: "López",
    dni: "11223344",
    telefono: "351-5556677",
    email: "carlos.lopez@email.com",
    direccion: "Av. Vélez Sarsfield 910, Córdoba",
    estado: true,
  },
  {
    id_cliente: 4,
    nombre: "Ana",
    apellido: "Martínez",
    dni: "44332211",
    telefono: "351-9998877",
    email: "ana.martinez@email.com",
    direccion: "Recta Martinolli 2345, Córdoba",
    estado: true,
  },
];

export const mockEmpleados = [
  {
    id_empleado: 1,
    nombre: "Roberto",
    apellido: "Sánchez",
    dni: "20123456",
    legajo: "EMP001",
    email: "roberto.sanchez@empresa.com",
    telefono: "351-4445566",
    rol: "Vendedor",
    estado: true,
  },
  {
    id_empleado: 2,
    nombre: "Laura",
    apellido: "Fernández",
    dni: "20654321",
    legajo: "EMP002",
    email: "laura.fernandez@empresa.com",
    telefono: "351-3332244",
    rol: "Gerente",
    estado: true,
  },
  {
    id_empleado: 3,
    nombre: "Diego",
    apellido: "Rodríguez",
    dni: "20987654",
    legajo: "EMP003",
    email: "diego.rodriguez@empresa.com",
    telefono: "351-7778899",
    rol: "Vendedor",
    estado: true,
  },
  {
    id_empleado: 4,
    nombre: "Sofía",
    apellido: "Ramírez",
    dni: "20456789",
    legajo: "EMP004",
    email: "sofia.ramirez@empresa.com",
    telefono: "351-6665544",
    rol: "Asistente",
    estado: true,
  },
];

export const mockCategoriasVehiculo = [
  {
    id_categoria: 1,
    nombre: "Económico",
    descripcion: "Vehículos compactos de bajo consumo",
    tarifa_diaria: "3500.00",
  },
  {
    id_categoria: 2,
    nombre: "Sedan",
    descripcion: "Vehículos medianos confortables",
    tarifa_diaria: "5000.00",
  },
  {
    id_categoria: 3,
    nombre: "SUV",
    descripcion: "Vehículos deportivos utilitarios",
    tarifa_diaria: "7500.00",
  },
  {
    id_categoria: 4,
    nombre: "Premium",
    descripcion: "Vehículos de alta gama y lujo",
    tarifa_diaria: "12000.00",
  },
];

export const mockEstadosVehiculo = [
  {
    id_estado: 1,
    nombre: "Disponible",
    descripcion: "Vehículo listo para alquilar",
  },
  {
    id_estado: 2,
    nombre: "Alquilado",
    descripcion: "Vehículo actualmente en alquiler",
  },
  {
    id_estado: 3,
    nombre: "Mantenimiento",
    descripcion: "Vehículo en reparación o servicio",
  },
  {
    id_estado: 4,
    nombre: "Reservado",
    descripcion: "Vehículo con reserva confirmada",
  },
  {
    id_estado: 5,
    nombre: "Fuera de Servicio",
    descripcion: "Vehículo no operativo",
  },
];

export const mockVehiculos = [
  {
    id_vehiculo: 1,
    patente: "ABC123",
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2022,
    id_categoria: 2,
    id_estado: 1,
    km_actual: 15000,
    fecha_ultimo_mantenimiento: "2025-10-15",
  },
  {
    id_vehiculo: 2,
    patente: "DEF456",
    marca: "Chevrolet",
    modelo: "Onix",
    anio: 2023,
    id_categoria: 1,
    id_estado: 1,
    km_actual: 8000,
    fecha_ultimo_mantenimiento: "2025-11-01",
  },
  {
    id_vehiculo: 3,
    patente: "GHI789",
    marca: "Ford",
    modelo: "Ranger",
    anio: 2021,
    id_categoria: 3,
    id_estado: 2,
    km_actual: 45000,
    fecha_ultimo_mantenimiento: "2025-09-20",
  },
  {
    id_vehiculo: 4,
    patente: "JKL012",
    marca: "Volkswagen",
    modelo: "Vento",
    anio: 2023,
    id_categoria: 2,
    id_estado: 1,
    km_actual: 5000,
    fecha_ultimo_mantenimiento: "2025-10-30",
  },
  {
    id_vehiculo: 5,
    patente: "MNO345",
    marca: "Audi",
    modelo: "A4",
    anio: 2024,
    id_categoria: 4,
    id_estado: 1,
    km_actual: 2000,
    fecha_ultimo_mantenimiento: "2025-11-10",
  },
  {
    id_vehiculo: 6,
    patente: "PQR678",
    marca: "Fiat",
    modelo: "Cronos",
    anio: 2022,
    id_categoria: 1,
    id_estado: 3,
    km_actual: 32000,
    fecha_ultimo_mantenimiento: "2025-11-15",
  },
];

export const mockReservas = [
  {
    id_reserva: 1,
    id_cliente: 1,
    id_vehiculo: 5,
    fecha_inicio: "2025-11-25",
    fecha_fin: "2025-11-30",
    estado: "CONFIRMADA",
    monto_senia: "6000.00",
    fecha_creacion: "2025-11-10T10:30:00",
  },
  {
    id_reserva: 2,
    id_cliente: 2,
    id_vehiculo: 2,
    fecha_inicio: "2025-12-01",
    fecha_fin: "2025-12-05",
    estado: "PENDIENTE",
    monto_senia: "2000.00",
    fecha_creacion: "2025-11-12T14:15:00",
  },
];

export const mockAlquileres = [
  {
    id_alquiler: 1,
    id_cliente: 1,
    id_vehiculo: 3,
    id_empleado: 1,
    id_reserva: null,
    fecha_inicio: "2025-11-10",
    fecha_fin: "2025-11-15",
    costo_base: "37500.00",
    costo_total: "37500.00",
    estado: "FINALIZADO",
    observaciones: "Cliente dejó el vehículo en perfectas condiciones",
  },
  {
    id_alquiler: 2,
    id_cliente: 2,
    id_vehiculo: 1,
    id_empleado: 2,
    id_reserva: null,
    fecha_inicio: "2025-11-14",
    fecha_fin: "2025-11-20",
    costo_base: "30000.00",
    costo_total: "32500.00",
    estado: "EN_CURSO",
    observaciones: "Incluye seguro adicional - $2500",
  },
  {
    id_alquiler: 3,
    id_cliente: 3,
    id_vehiculo: 4,
    id_empleado: 1,
    id_reserva: null,
    fecha_inicio: "2025-11-05",
    fecha_fin: "2025-11-08",
    costo_base: "15000.00",
    costo_total: "15000.00",
    estado: "FINALIZADO",
    observaciones: null,
  },
  {
    id_alquiler: 4,
    id_cliente: 4,
    id_vehiculo: 2,
    id_empleado: 3,
    id_reserva: null,
    fecha_inicio: "2025-11-12",
    fecha_fin: "2025-11-14",
    costo_base: "7000.00",
    costo_total: "7000.00",
    estado: "CANCELADO",
    observaciones: "Cancelado por el cliente con 24hs de anticipación",
  },
];

export const mockMultasDanios = [
  {
    id_multa_danio: 1,
    id_alquiler: 1,
    tipo: "multa",
    descripcion: "Multa de tránsito por exceso de velocidad",
    monto: "5000.00",
    fecha_registro: "2025-11-13T16:45:00",
  },
  {
    id_multa_danio: 2,
    id_alquiler: 2,
    tipo: "daño",
    descripcion: "Rayón en puerta trasera derecha",
    monto: "15000.00",
    fecha_registro: "2025-11-18T11:20:00",
  },
];

export const mockMantenimientos = [
  {
    id_mantenimiento: 1,
    id_vehiculo: 6,
    fecha_inicio: "2025-11-15",
    fecha_fin: "2025-11-20",
    tipo: "preventivo",
    descripcion: "Service 30.000 km - cambio aceite y filtros",
    costo: "25000.00",
    id_empleado: 4,
  },
  {
    id_mantenimiento: 2,
    id_vehiculo: 3,
    fecha_inicio: "2025-10-05",
    fecha_fin: "2025-10-08",
    tipo: "correctivo",
    descripcion: "Reparación de frenos delanteros",
    costo: "18000.00",
    id_empleado: 4,
  },
];

// Función helper para simular delay de API
export const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Función para generar ID único
let nextId = 100;
export const generateId = () => ++nextId;
