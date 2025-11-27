from pydantic import BaseModel
from typing import List, Optional


class AlquilerDetalle(BaseModel):
    id_alquiler: int
    id_cliente: int
    cliente_nombre: Optional[str] = None
    cliente_apellido: Optional[str] = None
    id_vehiculo: int
    vehiculo_patente: Optional[str] = None
    fecha_inicio: str
    fecha_fin: Optional[str] = None
    dias: Optional[int] = None
    monto: Optional[float] = None
    estado: Optional[str] = None


class AlquileresPorClienteResponse(BaseModel):
    client_id: int
    desde: Optional[str] = None
    hasta: Optional[str] = None
    total: int
    page: int
    size: int
    items: List[AlquilerDetalle]


class VehiculoTopItem(BaseModel):
    id_vehiculo: int
    patente: Optional[str] = None
    modelo: Optional[str] = None
    categoria: Optional[str] = None
    cantidad_alquileres: int


class VehiculosMasAlquiladosResponse(BaseModel):
    desde: Optional[str] = None
    hasta: Optional[str] = None
    items: List[VehiculoTopItem]


class AlquilerPeriodoItem(BaseModel):
    periodo: str  # e.g. "2025-11" o "2025-Q4"
    cantidad_alquileres: int


class AlquileresPorPeriodoResponse(BaseModel):
    periodo: str  # "mes" | "trimestre"
    desde: Optional[str] = None
    hasta: Optional[str] = None
    items: List[AlquilerPeriodoItem]


class FacturacionMensualItem(BaseModel):
    mes: int  # 1..12
    monto_total: float


class FacturacionMensualResponse(BaseModel):
    anio: int
    items: List[FacturacionMensualItem]
