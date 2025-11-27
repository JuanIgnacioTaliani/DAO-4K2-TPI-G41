from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import alquileres as m_alquileres
from app.models import clientes as m_clientes
from app.models import vehiculos as m_vehiculos
from app.repositories.alquiler_repository import fetch_alquileres_by_cliente
from app.services.period_strategies import get_period_strategy


def get_alquileres_por_cliente(
    db: Session,
    client_id: int,
    page: int = 1,
    size: int = 10,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
) -> Tuple[int, List[dict]]:
    total, rows = fetch_alquileres_by_cliente(db, client_id, page=page, size=size, desde=desde, hasta=hasta)
    result: List[dict] = []
    for row in rows:
        dias = None
        if row.fecha_inicio and row.fecha_fin:
            try:
                dias = (row.fecha_fin - row.fecha_inicio).days
            except Exception:
                dias = None
        result.append(
            {
                "id_alquiler": row.id_alquiler,
                "id_cliente": row.id_cliente,
                "cliente_nombre": row.cliente_nombre,
                "cliente_apellido": row.cliente_apellido,
                "id_vehiculo": row.id_vehiculo,
                "vehiculo_patente": row.vehiculo_patente,
                "fecha_inicio": row.fecha_inicio.isoformat() if row.fecha_inicio else None,
                "fecha_fin": row.fecha_fin.isoformat() if row.fecha_fin else None,
                "dias": dias,
                "monto": float(row.costo_total) if row.costo_total is not None else None,
                "estado": row.estado,
            }
        )
    return total, result


def get_vehiculos_mas_alquilados(
    db: Session,
    limit: int = 10,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
) -> List[dict]:
    query = (
        db.query(
            m_vehiculos.Vehiculo.id_vehiculo,
            m_vehiculos.Vehiculo.patente,
            m_vehiculos.Vehiculo.modelo,
            func.count(m_alquileres.Alquiler.id_alquiler).label("cantidad")
        )
        .join(m_alquileres.Alquiler, m_alquileres.Alquiler.id_vehiculo == m_vehiculos.Vehiculo.id_vehiculo)
        .group_by(
            m_vehiculos.Vehiculo.id_vehiculo,
            m_vehiculos.Vehiculo.patente,
            m_vehiculos.Vehiculo.modelo,
        )
        .order_by(func.count(m_alquileres.Alquiler.id_alquiler).desc())
    )

    if desde:
        query = query.filter(m_alquileres.Alquiler.fecha_inicio >= desde)
    if hasta:
        query = query.filter(m_alquileres.Alquiler.fecha_inicio <= hasta)

    rows = query.limit(limit).all()
    return [
        {
            "id_vehiculo": r.id_vehiculo,
            "patente": r.patente,
            "modelo": r.modelo,
            "cantidad_alquileres": int(r.cantidad),
        }
        for r in rows
    ]


def get_alquileres_por_periodo(
    db: Session,
    periodo: str = "mes",
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
) -> List[dict]:
    strategy = get_period_strategy(periodo)
    return strategy.aggregate(db, desde=desde, hasta=hasta)


def get_facturacion_mensual(
    db: Session,
    anio: int,
) -> List[dict]:
    # Suma de montos por mes del año indicado usando fecha_inicio
    date_col = m_alquileres.Alquiler.fecha_inicio
    q = (
        db.query(
            func.extract('month', date_col).label('mes'),
            func.coalesce(func.sum(m_alquileres.Alquiler.costo_total), 0).label('monto_total')
        )
        .filter(func.extract('year', date_col) == anio)
        .group_by(func.extract('month', date_col))
        .order_by(func.extract('month', date_col).asc())
    )
    rows = q.all()
    return [
        {"mes": int(r.mes), "monto_total": float(r.monto_total)}
        for r in rows
    ]
