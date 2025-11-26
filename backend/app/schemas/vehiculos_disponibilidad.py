from __future__ import annotations

from typing import List, Optional, TYPE_CHECKING
from pydantic import BaseModel

# Importaciones reales en runtime (no solo TYPE_CHECKING) para que Pydantic pueda construir el schema
from app.schemas.vehiculos import VehiculoOut
from app.schemas.alquileres import AlquilerOut
from app.schemas.mantenimientos import MantenimientoOut


class VehiculoDisponibilidadDetalleOut(BaseModel):
    vehiculo: VehiculoOut
    alquileres: Optional[List[AlquilerOut]] = None
    mantenimientos: Optional[List[MantenimientoOut]] = None
    
    class Config:
        from_attributes = True
