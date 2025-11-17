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
