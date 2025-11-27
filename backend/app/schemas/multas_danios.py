from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

from app.schemas.alquileres import AlquilerOut


class MultaDanioBase(BaseModel):
    id_alquiler: int
    tipo: str  # multa, daño, retraso, otro
    descripcion: Optional[str] = None
    monto: Decimal
    fecha_registro: datetime


class MultaDanioCreate(MultaDanioBase):
    pass


class MultaDanioUpdate(BaseModel):
    id_alquiler: Optional[int] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    monto: Optional[Decimal] = None
    fecha_registro: Optional[datetime] = None


class MultaDanioOut(MultaDanioBase):
    id_multa_danio: int
    id_alquiler: int
    alquiler: AlquilerOut
    tipo: str  # multa, daño, retraso, otro
    descripcion: Optional[str] = None
    monto: Decimal
    fecha_registro: datetime
