from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class AlquilerBase(BaseModel):
    id_cliente: int
    id_vehiculo: int
    id_empleado: int
    id_reserva: Optional[int] = None  # opcional

    fecha_inicio: date
    fecha_fin: date

    costo_base: Decimal
    costo_total: Optional[Decimal] = None

    estado: str = "EN_CURSO"
    observaciones: Optional[str] = None


class AlquilerCreate(AlquilerBase):
    pass


class AlquilerUpdate(BaseModel):
    id_cliente: Optional[int] = None
    id_vehiculo: Optional[int] = None
    id_empleado: Optional[int] = None
    id_reserva: Optional[int] = None

    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

    costo_base: Optional[Decimal] = None
    costo_total: Optional[Decimal] = None

    estado: Optional[str] = None
    observaciones: Optional[str] = None


class AlquilerOut(AlquilerBase):
    id_alquiler: int

    class Config:
        orm_mode = True
