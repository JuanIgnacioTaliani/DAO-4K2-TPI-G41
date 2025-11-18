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


class EstadoVehiculo(Base):
    __tablename__ = "estado_vehiculo"

    id_estado = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(200))

    vehiculos = relationship("Vehiculo", back_populates="estado")
