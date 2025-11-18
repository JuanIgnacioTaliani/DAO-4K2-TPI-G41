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

    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    costo_base = Column(DECIMAL(10, 2), nullable=False)
    costo_total = Column(DECIMAL(10, 2), nullable=False)
    estado = Column(String(30))  # PENDIENTE, EN_CURSO, CHECKOUT, FINALIZADO, CANCELADO
    observaciones = Column(String(300))
    
    # Kilometraje para control de mantenimiento
    km_inicial = Column(Integer, nullable=True)  # KM del vehículo al iniciar alquiler
    km_final = Column(Integer, nullable=True)    # KM del vehículo al finalizar alquiler
    
    # Datos de cancelación
    motivo_cancelacion = Column(String(300), nullable=True)
    fecha_cancelacion = Column(DateTime, nullable=True)
    id_empleado_cancelador = Column(Integer, ForeignKey("empleado.id_empleado"), nullable=True)

    cliente = relationship("Cliente", back_populates="alquileres")
    vehiculo = relationship("Vehiculo", back_populates="alquileres")
    empleado = relationship("Empleado", back_populates="alquileres", foreign_keys=[id_empleado])
    empleado_cancelador = relationship("Empleado", foreign_keys=[id_empleado_cancelador])

    multas_danios = relationship("MultaDanio", back_populates="alquiler")
