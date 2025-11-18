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
from ..database import Base


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