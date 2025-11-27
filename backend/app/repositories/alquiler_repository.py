from typing import Optional, Tuple, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import alquileres as m_alquileres
from app.models import clientes as m_clientes
from app.models import vehiculos as m_vehiculos


def fetch_alquileres_by_cliente(
    db: Session,
    client_id: int,
    page: int = 1,
    size: int = 10,
    desde: Optional[datetime] = None,
    hasta: Optional[datetime] = None,
) -> Tuple[int, List[object]]:
    """Repository function to retrieve alquileres for a given client with optional date filters.
    Returns total count and ORM result rows.
    """
    query = (
        db.query(
            m_alquileres.Alquiler.id_alquiler,
            m_alquileres.Alquiler.id_cliente,
            m_alquileres.Alquiler.id_vehiculo,
            m_alquileres.Alquiler.fecha_inicio,
            m_alquileres.Alquiler.fecha_fin,
            m_alquileres.Alquiler.costo_total,
            m_alquileres.Alquiler.estado.label("estado"),
            m_clientes.Cliente.nombre.label("cliente_nombre"),
            m_clientes.Cliente.apellido.label("cliente_apellido"),
            m_vehiculos.Vehiculo.patente.label("vehiculo_patente"),
        )
        .join(m_clientes.Cliente, m_clientes.Cliente.id_cliente == m_alquileres.Alquiler.id_cliente)
        .join(m_vehiculos.Vehiculo, m_vehiculos.Vehiculo.id_vehiculo == m_alquileres.Alquiler.id_vehiculo)
        .filter(m_alquileres.Alquiler.id_cliente == client_id)
        .order_by(m_alquileres.Alquiler.fecha_inicio.desc())
    )

    if desde:
        query = query.filter(m_alquileres.Alquiler.fecha_inicio >= desde)
    if hasta:
        query = query.filter(m_alquileres.Alquiler.fecha_inicio <= hasta)

    total = query.count()
    rows = query.offset((page - 1) * size).limit(size).all()
    return total, rows
