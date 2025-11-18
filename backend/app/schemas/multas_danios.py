from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class MultaDanioBase(BaseModel):
    id_alquiler: int
    tipo: str  # multa, daño, retraso, otro
    descripcion: Optional[str] = None
    monto: Decimal


class MultaDanioCreate(MultaDanioBase):
    pass


class MultaDanioUpdate(BaseModel):
    id_alquiler: Optional[int] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    monto: Optional[Decimal] = None


class MultaDanioOut(MultaDanioBase):
    id_multa_danio: int
    fecha_registro: datetime

    class Config:
        orm_mode = True
