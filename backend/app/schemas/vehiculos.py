from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date
from app.schemas.categorias_vehiculo import CategoriaVehiculoOut
from app.schemas.estados_vehiculo import EstadoVehiculoOut


class VehiculoBase(BaseModel):
    patente: str
    marca: str
    modelo: str
    anio: Optional[int] = None
    id_categoria: int
    id_estado: int
    km_actual: Optional[int] = None
    fecha_ultimo_mantenimiento: Optional[date] = None

    @validator("km_actual", "anio", pre=True)
    def _coerce_empty_or_numeric_to_int(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            # aceptar cadenas numéricas como "123"
            if v.isdigit():
                return int(v)
            # aceptar cadenas con signo o espacios
            try:
                return int(v.strip())
            except Exception:
                return v
        return v

    @validator("id_categoria", "id_estado", pre=True)
    def _coerce_numeric_strings_to_int(cls, v):
        if isinstance(v, str) and v.isdigit():
            return int(v)
        return v

    @validator("fecha_ultimo_mantenimiento", pre=True)
    def _coerce_empty_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


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
    fecha_ultimo_mantenimiento: Optional[date] = None

    @validator("km_actual", "anio", pre=True)
    def _coerce_empty_or_numeric_to_int(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            if v.isdigit():
                return int(v)
            try:
                return int(v.strip())
            except Exception:
                return v
        return v

    @validator("id_categoria", "id_estado", pre=True)
    def _coerce_numeric_strings_to_int(cls, v):
        if isinstance(v, str) and v.isdigit():
            return int(v)
        return v


class VehiculoOut(BaseModel):
    id_vehiculo: int
    patente: str
    marca: str
    modelo: str
    anio: Optional[int] = None
    id_categoria: int
    categoria: CategoriaVehiculoOut
    id_estado: int
    estado: EstadoVehiculoOut
    km_actual: Optional[int] = None
    fecha_ultimo_mantenimiento: Optional[date] = None

    @validator("km_actual", "anio", pre=True)
    def _coerce_empty_or_numeric_to_int(cls, v):
        if v == "" or v is None:
            return None
        if isinstance(v, str):
            # aceptar cadenas numéricas como "123"
            if v.isdigit():
                return int(v)
            # aceptar cadenas con signo o espacios
            try:
                return int(v.strip())
            except Exception:
                return v
        return v

    @validator("id_estado", pre=True)
    def _coerce_numeric_strings_to_int(cls, v):
        if isinstance(v, str) and v.isdigit():
            return int(v)
        return v

    @validator("fecha_ultimo_mantenimiento", pre=True)
    def _coerce_empty_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v

    class Config:
        from_attributes = True


class VehiculoDisponibilidadOut(BaseModel):
    vehiculo: VehiculoOut
    estado_disponibilidad: str
    ocupacion_detalle: Optional[str] = None
