from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.reports import (
    AlquileresPorClienteResponse,
    VehiculosMasAlquiladosResponse,
    AlquileresPorPeriodoResponse,
    FacturacionMensualResponse,
)
from app.services import reports as svc


router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/alquileres-por-cliente", response_model=AlquileresPorClienteResponse)
def alquileres_por_cliente(
    client_id: int = Query(..., description="ID del cliente"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    desde: Optional[str] = Query(None, description="Fecha ISO desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha ISO hasta (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    d_dt = datetime.fromisoformat(desde) if desde else None
    h_dt = datetime.fromisoformat(hasta) if hasta else None
    if d_dt and h_dt and h_dt < d_dt:
        raise ValueError("La fecha fin no puede ser menor a la fecha inicio")
    total, items = svc.get_alquileres_por_cliente(db, client_id=client_id, page=page, size=size, desde=d_dt, hasta=h_dt)
    return {
        "client_id": client_id,
        "desde": desde,
        "hasta": hasta,
        "total": total,
        "page": page,
        "size": size,
        "items": items,
    }


@router.get("/vehiculos-mas-alquilados", response_model=VehiculosMasAlquiladosResponse)
def vehiculos_mas_alquilados(
    limit: int = Query(10, ge=1, le=100),
    desde: Optional[str] = Query(None, description="Fecha ISO desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha ISO hasta (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    d_dt = datetime.fromisoformat(desde) if desde else None
    h_dt = datetime.fromisoformat(hasta) if hasta else None
    items = svc.get_vehiculos_mas_alquilados(db, limit=limit, desde=d_dt, hasta=h_dt)
    return {
        "desde": desde,
        "hasta": hasta,
        "items": items,
    }


@router.get("/alquileres-por-periodo", response_model=AlquileresPorPeriodoResponse)
def alquileres_por_periodo(
    periodo: str = Query("mes", regex="^(mes|trimestre)$"),
    desde: Optional[str] = Query(None, description="Fecha ISO desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha ISO hasta (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    d_dt = datetime.fromisoformat(desde) if desde else None
    h_dt = datetime.fromisoformat(hasta) if hasta else None
    items = svc.get_alquileres_por_periodo(db, periodo=periodo, desde=d_dt, hasta=h_dt)
    return {
        "periodo": periodo,
        "desde": desde,
        "hasta": hasta,
        "items": items,
    }


@router.get("/facturacion-mensual", response_model=FacturacionMensualResponse)
def facturacion_mensual(
    anio: int = Query(..., ge=1900, le=2100),
    db: Session = Depends(get_db),
):
    items = svc.get_facturacion_mensual(db, anio=anio)
    return {
        "anio": anio,
        "items": items,
    }
