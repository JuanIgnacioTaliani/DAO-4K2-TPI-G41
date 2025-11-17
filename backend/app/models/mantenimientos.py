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
