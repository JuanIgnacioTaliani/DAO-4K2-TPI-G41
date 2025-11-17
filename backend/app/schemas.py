from pydantic import BaseModel, EmailStr
from typing import Optional


# ---------- CLIENTE ----------

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


# ---------- EMPLEADO ----------

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


# ---------- VEHICULO ----------

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


from pydantic import BaseModel, EmailStr
from typing import Optional
# si no está ya:
# from decimal import Decimal


# ... acá ya tenés Cliente*, Empleado*, Vehiculo* ...


# ---------- CATEGORIA VEHICULO ----------

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


# ---------- ESTADO VEHICULO ----------

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
