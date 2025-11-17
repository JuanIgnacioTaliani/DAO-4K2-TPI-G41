from pydantic import BaseModel, EmailStr
from typing import Optional


class ClienteBase(BaseModel):
    nombre: str
    apellido: str
    dni: str
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = True


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    estado: Optional[bool] = None


class ClienteOut(ClienteBase):
    id_cliente: int

    class Config:
        from_attributes = True
