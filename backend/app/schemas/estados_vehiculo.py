from pydantic import BaseModel, EmailStr
from typing import Optional


class EstadoVehiculoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class EstadoVehiculoCreate(EstadoVehiculoBase):
    pass


class EstadoVehiculoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class EstadoVehiculoOut(EstadoVehiculoBase):
    id_estado: int

    class Config:
        from_attributes = True
