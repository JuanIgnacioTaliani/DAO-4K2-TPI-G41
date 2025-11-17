from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Date,
    DateTime,
    DECIMAL,
)
from sqlalchemy.orm import relationship
from .database import Base


class Cliente(Base):
    __tablename__ = "cliente"

    id_cliente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True, nullable=False)
    telefono = Column(String(30))
    email = Column(String(100))
    direccion = Column(String(200))
    estado = Column(Boolean, default=True)

    alquileres = relationship("Alquiler", back_populates="cliente")
    reservas = relationship("Reserva", back_populates="cliente")


class CategoriaVehiculo(Base):
    __tablename__ = "categoria_vehiculo"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(200))
    tarifa_diaria = Column(DECIMAL(10, 2), nullable=False)

    vehiculos = relationship("Vehiculo", back_populates="categoria")


class EstadoVehiculo(Base):
    __tablename__ = "estado_vehiculo"

    id_estado = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(200))

    vehiculos = relationship("Vehiculo", back_populates="estado")


class Vehiculo(Base):
    __tablename__ = "vehiculo"

    id_vehiculo = Column(Integer, primary_key=True, index=True)
    patente = Column(String(20), unique=True, nullable=False)
    marca = Column(String(50), nullable=False)
    modelo = Column(String(50), nullable=False)
    anio = Column(Integer)
    id_categoria = Column(
        Integer, ForeignKey("categoria_vehiculo.id_categoria"), nullable=False
    )
    id_estado = Column(
        Integer, ForeignKey("estado_vehiculo.id_estado"), nullable=False
    )
    km_actual = Column(Integer)
    fecha_ultimo_mantenimiento = Column(Date)

    categoria = relationship("CategoriaVehiculo", back_populates="vehiculos")
    estado = relationship("EstadoVehiculo", back_populates="vehiculos")

    alquileres = relationship("Alquiler", back_populates="vehiculo")
    mantenimientos = relationship("Mantenimiento", back_populates="vehiculo")
    reservas = relationship("Reserva", back_populates="vehiculo")


class Empleado(Base):
    __tablename__ = "empleado"

    id_empleado = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dni = Column(String(20), unique=True)
    legajo = Column(String(20), unique=True)
    email = Column(String(100))
    telefono = Column(String(30))
    rol = Column(String(50))
    estado = Column(Boolean, default=True)

    alquileres = relationship("Alquiler", back_populates="empleado")
    mantenimientos = relationship("Mantenimiento", back_populates="empleado")


class Reserva(Base):
    __tablename__ = "reserva"

    id_reserva = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"), nullable=False)
    id_vehiculo = Column(Integer, ForeignKey("vehiculo.id_vehiculo"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    estado = Column(String(30))  # PENDIENTE, CONFIRMADA, CANCELADA, VENCIDA
    monto_senia = Column(DECIMAL(10, 2))
    fecha_creacion = Column(
        DateTime
    )  # si querés default en DB lo podemos agregar más adelante

    cliente = relationship("Cliente", back_populates="reservas")
    vehiculo = relationship("Vehiculo", back_populates="reservas")
    alquiler = relationship("Alquiler", back_populates="reserva", uselist=False)


class Alquiler(Base):
    __tablename__ = "alquiler"

    id_alquiler = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"), nullable=False)
    id_vehiculo = Column(Integer, ForeignKey("vehiculo.id_vehiculo"), nullable=False)
    id_empleado = Column(Integer, ForeignKey("empleado.id_empleado"), nullable=False)
    id_reserva = Column(
        Integer, ForeignKey("reserva.id_reserva"), nullable=True
    )  # puede ser null

    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    costo_base = Column(DECIMAL(10, 2), nullable=False)
    costo_total = Column(DECIMAL(10, 2), nullable=False)
    estado = Column(String(30))  # EN_CURSO, FINALIZADO, CANCELADO, etc.
    observaciones = Column(String(300))

    cliente = relationship("Cliente", back_populates="alquileres")
    vehiculo = relationship("Vehiculo", back_populates="alquileres")
    empleado = relationship("Empleado", back_populates="alquileres")
    reserva = relationship("Reserva", back_populates="alquiler")

    multas_danios = relationship("MultaDanio", back_populates="alquiler")


class MultaDanio(Base):
    __tablename__ = "multa_danio"

    id_multa_danio = Column(Integer, primary_key=True, index=True)
    id_alquiler = Column(Integer, ForeignKey("alquiler.id_alquiler"), nullable=False)
    tipo = Column(String(50))  # multa, daño, retraso, otro
    descripcion = Column(String(300))
    monto = Column(DECIMAL(10, 2), nullable=False)
    fecha_registro = Column(DateTime)

    alquiler = relationship("Alquiler", back_populates="multas_danios")


class Mantenimiento(Base):
    __tablename__ = "mantenimiento"

    id_mantenimiento = Column(Integer, primary_key=True, index=True)
    id_vehiculo = Column(Integer, ForeignKey("vehiculo.id_vehiculo"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date)  # puede ser estimada
    tipo = Column(String(50))  # preventivo, correctivo
    descripcion = Column(String(300))
    costo = Column(DECIMAL(10, 2))
    id_empleado = Column(
        Integer, ForeignKey("empleado.id_empleado"), nullable=True
    )  # responsable

    vehiculo = relationship("Vehiculo", back_populates="mantenimientos")
    empleado = relationship("Empleado", back_populates="mantenimientos")
