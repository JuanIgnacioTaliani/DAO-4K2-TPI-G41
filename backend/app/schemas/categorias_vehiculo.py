from pydantic import BaseModel, EmailStr
from typing import Optional


class CategoriaVehiculoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tarifa_diaria: float  # o Decimal si querés ser más preciso


class CategoriaVehiculoCreate(CategoriaVehiculoBase):
    pass


class CategoriaVehiculoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    tarifa_diaria: Optional[float] = None


class CategoriaVehiculoOut(CategoriaVehiculoBase):
    id_categoria: int

    class Config:
        from_attributes = True
