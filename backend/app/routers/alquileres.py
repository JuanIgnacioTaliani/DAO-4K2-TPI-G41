from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from decimal import Decimal

from ..database import get_db

from ..schemas import alquileres as alquilerSchema
from ..services import alquileres as alquiler_service
from ..services.exceptions import DomainNotFound, BusinessRuleError

router = APIRouter(
    prefix="/alquileres",
    tags=["Alquileres"],
)


@router.get("/", response_model=List[alquilerSchema.AlquilerOut])
def listar_alquileres(
    db: Session = Depends(get_db),
    estado: List[str] | None = Query(default=None),
    id_cliente: int | None = None,
    id_vehiculo: int | None = None,
    id_empleado: int | None = None,
    fecha_inicio_desde: date | None = None,
    fecha_inicio_hasta: date | None = None,
    fecha_fin_desde: date | None = None,
    fecha_fin_hasta: date | None = None,
):
    return alquiler_service.listar_alquileres(
        db,
        estado,
        id_cliente,
        id_vehiculo,
        id_empleado,
        fecha_inicio_desde,
        fecha_inicio_hasta,
        fecha_fin_desde,
        fecha_fin_hasta,
    )


@router.get("/{id_alquiler}", response_model=alquilerSchema.AlquilerOut)
def obtener_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    try:
        return alquiler_service.get_alquiler(db, id_alquiler)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al obtener el alquiler")


@router.post("/", response_model=alquilerSchema.AlquilerOut, status_code=status.HTTP_201_CREATED)
def crear_alquiler(alquiler_in: alquilerSchema.AlquilerCreate, db: Session = Depends(get_db)):
    try:
        return alquiler_service.create_alquiler(db, alquiler_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id_alquiler}", response_model=alquilerSchema.AlquilerOut)
def actualizar_alquiler(id_alquiler: int,alquiler_in: alquilerSchema.AlquilerUpdate,db: Session = Depends(get_db),):
    try:
        return alquiler_service.update_alquiler(db, id_alquiler, alquiler_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al actualizar el alquiler")


@router.delete("/{id_alquiler}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    try:
        alquiler_service.eliminar_alquiler(db, id_alquiler)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al eliminar el alquiler")


@router.put("/{id_alquiler}/checkout", response_model=alquilerSchema.CheckoutResponse)
def realizar_checkout(
    id_alquiler: int,
    checkout_data: alquilerSchema.CheckoutRequest,
    db: Session = Depends(get_db)
):
    """
    Realiza el checkout de un alquiler que esté en estado EN_CURSO.
    Calcula el monto total a pagar y actualiza el estado del alquiler a CHECKOUT.
    """
    try:
        return alquiler_service.realizar_checkout(db, id_alquiler, checkout_data)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al realizar el checkout")


@router.put("/{id_alquiler}/cancelar", response_model=alquilerSchema.CancelarResponse)
def cancelar_alquiler(
    id_alquiler: int,
    datos_cancelacion: alquilerSchema.CancelarRequest,
    db: Session = Depends(get_db)
):
    """
    Cancela un alquiler que esté en estado PENDIENTE o EN_CURSO.
    Calcula la penalización por cancelación si aplica y actualiza el estado del alquiler a CANCELADO.
    """
    try:
        return alquiler_service.cancelar_alquiler(db, id_alquiler, datos_cancelacion)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("actualizar-estado-alquileres", response_model=int)
def actualizar_estado_alquileres(db: Session = Depends(get_db)):
    """
    Actualiza el estado de los alquileres basándose en la fecha actual.
    - De PENDIENTE a EN_CURSO si la fecha de inicio es hoy o anterior.
    - De EN_CURSO a CHECKOUT si la fecha de fin es anterior a hoy.
    
    Retorna la cantidad de alquileres actualizados.
    """
    try:
        cantidad_actualizados = alquiler_service.actualizar_estados_alquileres(db)
        return cantidad_actualizados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
