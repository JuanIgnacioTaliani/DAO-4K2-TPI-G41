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
