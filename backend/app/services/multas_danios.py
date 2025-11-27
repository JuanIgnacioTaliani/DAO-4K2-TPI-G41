from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from ..models import MultaDanio, Alquiler
from .exceptions import DomainNotFound, BusinessRuleError
from ..schemas.multas_danios import MultaDanioOut


def listar_multas_danios(
    db: Session,
    id_alquiler: Optional[int] = None,
    tipo: Optional[List[str]] = None,
    monto_desde: Optional[float] = None,
    monto_hasta: Optional[float] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
) -> list[MultaDanio]:
    """Listar todas las multas y daños con filtros opcionales"""
    query = db.query(MultaDanio)

    if id_alquiler is not None:
        query = query.filter(MultaDanio.id_alquiler == id_alquiler)
    if tipo:
        query = query.filter(MultaDanio.tipo.in_(tipo))
    if monto_desde is not None:
        query = query.filter(MultaDanio.monto >= monto_desde)
    if monto_hasta is not None:
        query = query.filter(MultaDanio.monto <= monto_hasta)
    if fecha_desde is not None:
        query = query.filter(MultaDanio.fecha_registro >= fecha_desde)
    if fecha_hasta is not None:
        query = query.filter(MultaDanio.fecha_registro <= fecha_hasta)

    query = query.order_by(MultaDanio.fecha_registro.desc())

    return query.all()


def get_multa_danio_by_id(db: Session, id_multa_danio: int) -> MultaDanio:
    """Obtener una multa/daño por su ID"""
    multa_danio = db.query(MultaDanio).get(id_multa_danio)
    if not multa_danio:
        raise DomainNotFound(f"Multa/Daño con ID {id_multa_danio} no encontrado")
    return multa_danio


def crear_multa_danio(db: Session, multa_danio_in) -> MultaDanio:
    """Crear una nueva multa/daño"""
    # Validar que el alquiler existe
    alquiler = db.query(Alquiler).get(multa_danio_in.id_alquiler)
    if not alquiler:
        raise HTTPException(status_code=400, detail="Alquiler no encontrado")
    
    # Crear la multa/daño con fecha_registro automática
    data = multa_danio_in.dict()
    data["fecha_registro"] = datetime.now()
    
    nueva_multa = MultaDanio(**data)
    db.add(nueva_multa)
    
    # Actualizar el costo_total del alquiler sumando el monto de la multa
    alquiler.costo_total = float(alquiler.costo_total or 0) + float(multa_danio_in.monto)
    
    db.commit()
    db.refresh(nueva_multa)
    return nueva_multa


def listar_multas_por_alquiler(db: Session, id_alquiler: int) -> list[MultaDanio]:
    """Listar multas y daños de un alquiler específico"""
    # Verificar que el alquiler existe
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == id_alquiler).first()
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")
    
    return db.query(MultaDanio).filter(MultaDanio.id_alquiler == id_alquiler).all()


def actualizar_multa_danio(db: Session, id_multa_danio: int, multa_danio_in: dict) -> MultaDanio:
    multa_danio = (
        db.query(MultaDanio)
        .filter(MultaDanio.id_multa_danio == id_multa_danio)
        .first()
    )
    if not multa_danio:
        raise HTTPException(status_code=404, detail="Multa/Daño no encontrado")
    
    # Obtener el alquiler para actualizar el costo_total
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == multa_danio.id_alquiler).first()
    
    # Si cambia el monto, actualizar el costo_total del alquiler
    monto_anterior = float(multa_danio.monto)
    
    data = multa_danio_in.dict(exclude_unset=True)
    
    # Validar si cambia el id_alquiler
    if "id_alquiler" in data and data["id_alquiler"] != multa_danio.id_alquiler:
        nuevo_alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == data["id_alquiler"]).first()
        if not nuevo_alquiler:
            raise HTTPException(status_code=400, detail="Alquiler no encontrado")
        
        # Restar del alquiler anterior y sumar al nuevo
        alquiler.costo_total = float(alquiler.costo_total or 0) - monto_anterior
        nuevo_alquiler.costo_total = float(nuevo_alquiler.costo_total or 0) + float(data.get("monto", monto_anterior))
    elif "monto" in data:
        # Solo cambia el monto en el mismo alquiler
        monto_nuevo = float(data["monto"])
        alquiler.costo_total = float(alquiler.costo_total or 0) - monto_anterior + monto_nuevo
    
    for field, value in data.items():
        setattr(multa_danio, field, value)
    
    db.commit()
    db.refresh(multa_danio)
    return multa_danio


def eliminar_multa_danio(db: Session, id_multa_danio: int) -> None:
    """Eliminar una multa o daño"""
    multa_danio = (
        db.query(MultaDanio)
        .filter(MultaDanio.id_multa_danio == id_multa_danio)
        .first()
    )
    if not multa_danio:
        raise DomainNotFound(f"Multa/Daño no encontrado")
    
    # Actualizar el costo_total del alquiler restando el monto de la multa
    alquiler = db.query(Alquiler).get(multa_danio.id_alquiler)
    if alquiler:
        alquiler.costo_total = float(alquiler.costo_total or 0) - float(multa_danio.monto)
    
    db.delete(multa_danio)
    db.commit()
    return None
