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
