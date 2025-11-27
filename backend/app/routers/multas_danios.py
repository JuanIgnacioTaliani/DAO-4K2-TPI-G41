from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..schemas import multas_danios as multaDanioSchema
from ..services import multas_danios as multaDanioService
from ..services.exceptions import DomainNotFound, BusinessRuleError
from ..models import MultaDanio, Alquiler

router = APIRouter(
    prefix="/multas-danios",
    tags=["Multas y Daños"],
)


@router.get("/", response_model=List[multaDanioSchema.MultaDanioOut])
def listar_multas_danios(
    id_alquiler: Optional[int] = None,
    tipo: Optional[List[str]] = Query(None),
    monto_desde: Optional[float] = None,
    monto_hasta: Optional[float] = None,
    fecha_desde: Optional[datetime] = None,
    fecha_hasta: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Listar todas las multas y daños con filtros opcionales"""
    return multaDanioService.listar_multas_danios(
        db,
        id_alquiler=id_alquiler,
        tipo=tipo,
        monto_desde=monto_desde,
        monto_hasta=monto_hasta,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
    )


@router.get("/alquiler/{id_alquiler}", response_model=List[multaDanioSchema.MultaDanioOut])
def listar_multas_por_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    """Listar multas y daños de un alquiler específico"""
    try:
        return multaDanioService.listar_multas_por_alquiler(db, id_alquiler)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.get("/{id_multa_danio}", response_model=multaDanioSchema.MultaDanioOut)
def obtener_multa_danio(id_multa_danio: int, db: Session = Depends(get_db)):
    """Obtener una multa/daño específico"""
    try:
        return multaDanioService.get_multa_danio_by_id(db, id_multa_danio)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.post("/", response_model=multaDanioSchema.MultaDanioOut, status_code=status.HTTP_201_CREATED)
def crear_multa_danio(multa_danio_in: multaDanioSchema.MultaDanioCreate, db: Session = Depends(get_db)):
    """Crear una nueva multa o daño"""
    try:
        multa_danio = multaDanioService.crear_multa_danio(db, multa_danio_in)
        return multa_danio
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.put("/{id_multa_danio}", response_model=multaDanioSchema.MultaDanioOut)
def actualizar_multa_danio(
    id_multa_danio: int,
    multa_danio_in: multaDanioSchema.MultaDanioUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar una multa o daño existente"""
    try:
        multa_danio = multaDanioService.actualizar_multa_danio(db, id_multa_danio, multa_danio_in)
        return multa_danio
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")


@router.delete("/{id_multa_danio}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_multa_danio(id_multa_danio: int, db: Session = Depends(get_db)):
    """Eliminar una multa o daño"""
    try:
        multaDanioService.eliminar_multa_danio(db, id_multa_danio)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")
