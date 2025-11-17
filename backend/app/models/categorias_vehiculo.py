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


class CategoriaVehiculo(Base):
    __tablename__ = "categoria_vehiculo"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(200))
    tarifa_diaria = Column(DECIMAL(10, 2), nullable=False)

    vehiculos = relationship("Vehiculo", back_populates="categoria")
    