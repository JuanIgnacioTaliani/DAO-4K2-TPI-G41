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


class MultaDanio(Base):
    __tablename__ = "multa_danio"

    id_multa_danio = Column(Integer, primary_key=True, index=True)
    id_alquiler = Column(Integer, ForeignKey("alquiler.id_alquiler"), nullable=False)
    tipo = Column(String(50))  # multa, daño, retraso, otro
    descripcion = Column(String(300))
    monto = Column(DECIMAL(10, 2), nullable=False)
    fecha_registro = Column(DateTime)

    alquiler = relationship("Alquiler", back_populates="multas_danios")
