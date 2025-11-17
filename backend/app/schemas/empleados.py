from pydantic import BaseModel, EmailStr
from typing import Optional


class EmpleadoBase(BaseModel):
    nombre: str
    apellido: str
    dni: Optional[str] = None
    legajo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None
    estado: Optional[bool] = True


class EmpleadoCreate(EmpleadoBase):
    pass


class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    dni: Optional[str] = None
    legajo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None
    estado: Optional[bool] = None


class EmpleadoOut(EmpleadoBase):
    id_empleado: int

    class Config:
        from_attributes = True
