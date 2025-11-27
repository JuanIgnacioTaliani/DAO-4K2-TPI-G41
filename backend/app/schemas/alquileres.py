from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.schemas.clientes import ClienteOut
from app.schemas.vehiculos import VehiculoOut
from app.schemas.empleados import EmpleadoOut


class AlquilerBase(BaseModel):
    id_cliente: int
    id_vehiculo: int
    id_empleado: int

    fecha_inicio: date
    fecha_fin: date

    costo_base: Decimal
    costo_total: Optional[Decimal] = None

    estado: str = "PENDIENTE"
    observaciones: Optional[str] = None
    
    km_inicial: Optional[int] = None
    km_final: Optional[int] = None
    
    motivo_cancelacion: Optional[str] = None
    fecha_cancelacion: Optional[datetime] = None
    id_empleado_cancelador: Optional[int] = None


class AlquilerCreate(AlquilerBase):
    pass


class AlquilerUpdate(BaseModel):
    id_cliente: Optional[int] = None
    id_vehiculo: Optional[int] = None
    id_empleado: Optional[int] = None

    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

    costo_base: Optional[Decimal] = None
    costo_total: Optional[Decimal] = None

    estado: Optional[str] = None
    observaciones: Optional[str] = None
    
    km_inicial: Optional[int] = None
    km_final: Optional[int] = None
    
    motivo_cancelacion: Optional[str] = None
    fecha_cancelacion: Optional[datetime] = None
    id_empleado_cancelador: Optional[int] = None


class AlquilerOut(BaseModel):
    id_alquiler: int
    id_cliente: int
    cliente: ClienteOut
    id_vehiculo: int
    vehiculo: VehiculoOut
    id_empleado: int
    empleado: EmpleadoOut

    fecha_inicio: date
    fecha_fin: date

    costo_base: Decimal
    costo_total: Optional[Decimal] = None

    estado: str = "PENDIENTE"
    observaciones: Optional[str] = None
    
    km_inicial: Optional[int] = None
    km_final: Optional[int] = None
    
    motivo_cancelacion: Optional[str] = None
    fecha_cancelacion: Optional[datetime] = None
    id_empleado_cancelador: Optional[int] = None
    empleado_cancelador: Optional[EmpleadoOut] = None


    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    km_final: int
    id_empleado_finalizador: int  # Empleado que realiza el checkout
    observaciones_finalizacion: Optional[str] = None


class CheckoutResponse(BaseModel):
    success: bool
    message: str
    alquiler_id: int
    km_recorridos: int
    requiere_mantenimiento: bool
    nuevo_estado_vehiculo: str
    mantenimiento_creado: Optional[int] = None  # ID del mantenimiento si se creó


class CancelarRequest(BaseModel):
    motivo_cancelacion: str
    id_empleado_cancelador: int  # Empleado que realiza la cancelación


class CancelarResponse(BaseModel):
    success: bool
    message: str
    alquiler_id: int
    estado_anterior: str
    fecha_cancelacion: str
