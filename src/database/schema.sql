CREATE TABLE marca (
    id_marca INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE categoria_vehiculo (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE estado_vehiculo (
    id_estado_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE estado_alquiler (
    id_estado_alquiler INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE tipo_multa (
    id_tipo_multa INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

CREATE TABLE cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE,
    telefono TEXT,
    direccion TEXT,
    activo INTEGER DEFAULT 1
);

CREATE TABLE empleado (
    id_empleado INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dni INTEGER UNIQUE NOT NULL,
    cargo TEXT NOT NULL,
    activo INTEGER DEFAULT 1
);

CREATE TABLE vehiculo (
    id_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
    patente TEXT UNIQUE NOT NULL,
    marca_id INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    costo_por_dia REAL NOT NULL,
    estado_vehiculo_id INTEGER NOT NULL,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY (marca_id) REFERENCES marca(id_marca),
    FOREIGN KEY (categoria_id) REFERENCES categoria_vehiculo(id_categoria),
    FOREIGN KEY (estado_id) REFERENCES estado_vehiculo(id_estado)
);

CREATE TABLE mantenimiento (
    id_mantenimiento INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    costo REAL NOT NULL,
    descripcion TEXT,
    vehiculo_id INTEGER NOT NULL,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id_vehiculo)
);

CREATE TABLE alquiler (
    id_alquiler INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT,
    costo_total REAL NOT NULL,
    importe_final REAL NOT NULL,
    km_recorridos REAL,
    cliente_id INTEGER NOT NULL,
    vehiculo_id INTEGER NOT NULL,
    empleado_id INTEGER NOT NULL,
    estado_alquiler_id INTEGER NOT NULL,
    fecha_reserva TEXT,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id_cliente),
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculo(id_vehiculo),
    FOREIGN KEY (empleado_id) REFERENCES empleado(id_empleado),
    FOREIGN KEY (estado_alquiler_id) REFERENCES estado_alquiler(id_estado)
);

CREATE TABLE IF NOT EXISTS multas (
    id_multa INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT NOT NULL,
    tipo_multa_id INTEGER NOT NULL,
    costo REAL NOT NULL,
    descripcion TEXT,
    alquiler_id INTEGER NOT NULL,
    activo INTEGER DEFAULT 1,
    FOREIGN KEY (tipo_multa_id) REFERENCES tipo_multa(id_tipo_multa),
    FOREIGN KEY (id_alquiler) REFERENCES alquileres(id_alquiler)
);