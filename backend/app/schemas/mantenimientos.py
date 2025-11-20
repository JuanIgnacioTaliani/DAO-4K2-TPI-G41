from pydantic import BaseModel, validator
from typing import Optional
from datetime import date
from decimal import Decimal
from app.schemas.vehiculos import VehiculoOut
from app.schemas.empleados import EmpleadoOut


class MantenimientoBase(BaseModel):
    id_vehiculo: int
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    tipo: Optional[str] = None  # preventivo, correctivo
    descripcion: Optional[str] = None
    costo: Optional[Decimal] = None
    id_empleado: Optional[int] = None

    @validator("fecha_fin", pre=True)
    def _coerce_empty_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


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


class MantenimientoOut(BaseModel):
    id_mantenimiento: int
    id_vehiculo: int
    vehiculo: VehiculoOut
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    tipo: Optional[str] = None  # preventivo, correctivo
    descripcion: Optional[str] = None
    costo: Optional[Decimal] = None
    id_empleado: Optional[int] = None
    empleado: EmpleadoOut
