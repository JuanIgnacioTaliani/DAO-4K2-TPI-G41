from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date, datetime

from ..database import get_db
from ..schemas import vehiculos as vehiculoSchema
from ..schemas.vehiculos import VehiculoDisponibilidadOut
from ..services.exceptions import DomainNotFound, BusinessRuleError
from ..services import vehiculos as vehiculoService


router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("/", response_model=vehiculoSchema.VehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_vehiculo(vehiculo_in: vehiculoSchema.VehiculoCreate, db: Session = Depends(get_db)):
    try:
        return vehiculoService.crear_vehiculo(db, vehiculo_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al crear el vehículo")


@router.get("/", response_model=List[vehiculoSchema.VehiculoOut])
def listar_vehiculos(
    patente: Optional[str] = None,
    marca: Optional[str] = None,
    modelo: Optional[str] = None,
    anio_desde: Optional[int] = None,
    anio_hasta: Optional[int] = None,
    categoria: Optional[int] = None,
    estado: Optional[int] = None,
    km_desde: Optional[int] = None,
    km_hasta: Optional[int] = None,
    fecha_ultimo_mantenimiento_desde: Optional[date] = None,
    fecha_ultimo_mantenimiento_hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    return vehiculoService.listar_vehiculos(
        db,
        patente,
        marca,
        modelo,
        anio_desde,
        anio_hasta,
        categoria,
        estado,
        km_desde,
        km_hasta,
        fecha_ultimo_mantenimiento_desde,
        fecha_ultimo_mantenimiento_hasta
    )

@router.get("/{vehiculo_id}", response_model=vehiculoSchema.VehiculoOut)
def obtener_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    try:
        return vehiculoService.obtener_vehiculo(db, vehiculo_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al obtener el vehículo")
    

@router.put("/{vehiculo_id}", response_model=vehiculoSchema.VehiculoOut)
def actualizar_vehiculo(vehiculo_id: int, vehiculo_in: vehiculoSchema.VehiculoUpdate, db: Session = Depends(get_db)):
    try:
        return vehiculoService.actualizar_vehiculo(db, vehiculo_id, vehiculo_in.model_dump(exclude_unset=True))
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al actualizar el vehículo")


@router.delete("/{vehiculo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    try:
        vehiculoService.eliminar_vehiculo(db, vehiculo_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al eliminar el vehículo")


@router.get("/disponibilidad/all", response_model=List[VehiculoDisponibilidadOut])
def obtener_vehiculos_con_disponibilidad(db: Session = Depends(get_db)):
    """
    Obtiene todos los vehículos con su estado de disponibilidad.
    Estados posibles: 'Disponible', 'Ocupado', 'En Mantenimiento'
    """
    try:
        return vehiculoService.obtener_vehiculos_con_disponibilidad(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
