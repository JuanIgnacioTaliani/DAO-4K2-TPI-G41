from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal


class MantenimientoBase(BaseModel):
    id_vehiculo: int
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    tipo: Optional[str] = None  # preventivo, correctivo
    descripcion: Optional[str] = None
    costo: Optional[Decimal] = None
    id_empleado: Optional[int] = None


class MantenimientoCreate(MantenimientoBase):
    pass


class MantenimientoUpdate(BaseModel):
    id_vehiculo: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    tipo: Optional[str] = None
    descripcion: Optional[str] = None
    costo: Optional[Decimal] = None
    id_empleado: Optional[int] = None


class MantenimientoOut(MantenimientoBase):
    id_mantenimiento: int

    class Config:
        orm_mode = True
