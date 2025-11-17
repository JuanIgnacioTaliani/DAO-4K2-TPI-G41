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
