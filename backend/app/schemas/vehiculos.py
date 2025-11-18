from pydantic import BaseModel, EmailStr
from typing import Optional


class VehiculoBase(BaseModel):
    patente: str
    marca: str
    modelo: str
    anio: Optional[int] = None
    id_categoria: int
    id_estado: int
    km_actual: Optional[int] = None


class VehiculoCreate(VehiculoBase):
    pass


class VehiculoUpdate(BaseModel):
    patente: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    anio: Optional[int] = None
    id_categoria: Optional[int] = None
    id_estado: Optional[int] = None
    km_actual: Optional[int] = None


class VehiculoOut(VehiculoBase):
    id_vehiculo: int

    class Config:
        from_attributes = True