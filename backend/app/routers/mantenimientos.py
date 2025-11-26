from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import date

from ..database import get_db
from ..schemas import mantenimientos as mantenimientoSchema
from ..models import Mantenimiento, Vehiculo, Empleado, Alquiler
from ..services import mantenimientos as mantenimientos_service
from ..services.exceptions import DomainNotFound, BusinessRuleError

router = APIRouter(
    prefix="/mantenimientos",
    tags=["Mantenimientos"],
)


@router.get("/", response_model=List[mantenimientoSchema.MantenimientoOut])
def listar_mantenimientos(
    vehiculo: Optional[int] = Query(None, description="Filtro por id_vehiculo"),
    tipo: Optional[str] = Query(None, description="Filtro por tipo de mantenimiento"),
    empleado: Optional[int] = Query(None, description="Filtro por id_empleado"),
    estado: Optional[str] = Query(None, description='Filtro por estado: "en_curso" o "finalizado"'),
    db: Session = Depends(get_db),
):
    """Lista todos los mantenimientos. Permite filtrar por vehículo, tipo y estado.

    - `estado="en_curso"`: devuelve mantenimientos cuya `fecha_fin` sea hoy o posterior, o `NULL` (sin fecha de fin).
    - `estado="finalizado"`: devuelve mantenimientos cuya `fecha_fin` sea anterior a hoy.
    """
    return mantenimientos_service.list_mantenimientos(db, vehiculo, tipo, empleado, estado)


@router.get("/{id_mantenimiento}", response_model=mantenimientoSchema.MantenimientoOut)
def obtener_mantenimiento(id_mantenimiento: int, db: Session = Depends(get_db)):
    """Obtiene un mantenimiento por ID"""
    try:
        mantenimiento = mantenimientos_service.get_mantenimiento(db, id_mantenimiento)
        return mantenimiento
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al obtener mantenimiento")


@router.post("/", response_model=mantenimientoSchema.MantenimientoOut, status_code=status.HTTP_201_CREATED)
def crear_mantenimiento(mantenimiento_in: mantenimientoSchema.MantenimientoCreate, db: Session = Depends(get_db)):
    """Crea un nuevo mantenimiento delegando validaciones y persistencia a la capa de servicios."""
    try:
        nuevo = mantenimientos_service.create_mantenimiento(db, mantenimiento_in)
        return nuevo
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        # No exponer detalles, dejar que el logger o el middleware lo registre si existe
        raise HTTPException(status_code=500, detail="Error interno al crear mantenimiento")


@router.put("/{id_mantenimiento}", response_model=mantenimientoSchema.MantenimientoOut)
def actualizar_mantenimiento(id_mantenimiento: int,mantenimiento_in: mantenimientoSchema.MantenimientoUpdate,db: Session = Depends(get_db)):
    """Actualiza un mantenimiento existente delegando validaciones y persistencia a la capa de servicios."""
    try:
        actualizado = mantenimientos_service.update_mantenimiento(db, id_mantenimiento, mantenimiento_in)
        return actualizado
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al actualizar mantenimiento")


@router.delete("/{id_mantenimiento}")
def eliminar_mantenimiento(id_mantenimiento: int, db: Session = Depends(get_db)):
    """Elimina un mantenimiento y actualiza el estado del vehículo si corresponde."""
    try:
        mantenimientos_service.delete_mantenimiento(db, id_mantenimiento)
        return {"message": "Mantenimiento eliminado exitosamente"}
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al eliminar mantenimiento")


@router.get("/vehiculo/{id_vehiculo}", response_model=List[mantenimientoSchema.MantenimientoOut])
def obtener_mantenimientos_vehiculo(id_vehiculo: int, db: Session = Depends(get_db)):
    """Obtiene todos los mantenimientos de un vehículo específico"""
    try:
        mantenimientos = mantenimientos_service.get_mantenimientos_by_vehiculo(db, id_vehiculo)
        return mantenimientos
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al obtener mantenimientos del vehículo")
