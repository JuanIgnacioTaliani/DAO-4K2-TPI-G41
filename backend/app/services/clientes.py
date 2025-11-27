from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Optional, List
from difflib import SequenceMatcher

from ..models import Cliente, Alquiler
from .exceptions import DomainNotFound, BusinessRuleError


def listar_clientes(nombre: Optional[str],apellido: Optional[str],dni: Optional[str],telefono: Optional[str],email: Optional[str],direccion: Optional[str],estado: Optional[bool],db: Session,) -> List[Cliente]:
    query = db.query(Cliente)

    if nombre:
        query = query.filter(Cliente.nombre.ilike(f"%{nombre}%"))
    if apellido:
        query = query.filter(Cliente.apellido.ilike(f"%{apellido}%"))
    if dni:
        query = query.filter(Cliente.dni.ilike(f"%{dni}%"))
    if telefono:
        query = query.filter(Cliente.telefono.ilike(f"%{telefono}%"))
    if email:
        query = query.filter(Cliente.email.ilike(f"%{email}%"))
    if direccion:
        query = query.filter(Cliente.direccion.ilike(f"%{direccion}%"))
    if estado is not None:
        query = query.filter(Cliente.estado == estado)

    return query.all()


def obtener_cliente_por_id(db: Session, id_cliente: int) -> Cliente:
    cliente = db.query(Cliente).get(id_cliente)
    if not cliente:
        raise DomainNotFound("Cliente no encontrado")
    return cliente


def crear_cliente(db:Session, cliente_in) -> Cliente:
    existing = db.query(Cliente).filter(Cliente.dni == cliente_in.dni).first()
    if existing:
        raise BusinessRuleError("Ya existe un cliente con ese DNI")

    cliente = Cliente(**cliente_in.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


def actualizar_cliente(db: Session, id_cliente: int, cliente_in) -> Cliente:
    cliente = db.query(Cliente).get(id_cliente)
    if not cliente:
        raise DomainNotFound("Cliente no encontrado")

    for var, value in vars(cliente_in).items():
        setattr(cliente, var, value) if value else None

    db.commit()
    db.refresh(cliente)
    return cliente


def eliminar_cliente(db: Session, id_cliente: int) -> None:
    cliente = db.query(Cliente).get(id_cliente)
    if not cliente:
        raise DomainNotFound("Cliente no encontrado")

    alquiler_existente = (
        db.query(Alquiler)
        .filter(Alquiler.id_cliente == id_cliente)
        .first()
    )

    if alquiler_existente:
        raise BusinessRuleError("No se puede eliminar el cliente porque tiene alquileres asociados")

    db.delete(cliente)
    db.commit()


def sugerir_clientes(db: Session, query: str, limit: int) -> List[dict]:
    q = query.strip()
    if not q:
        return []
    pattern = f"%{q.lower()}%"
    # Buscar hasta 200 candidatos por substring
    candidatos = db.query(Cliente).filter(
        or_(
            Cliente.nombre.ilike(pattern),
            Cliente.apellido.ilike(pattern)
        )
    ).limit(200).all()
    # Si no hay candidatos por substring y la query es >=2 chars, traer primeros 50 para similitud general
    if not candidatos and len(q) >= 2:
        candidatos = db.query(Cliente).limit(50).all()

    scored = []
    q_lower = q.lower()
    for c in candidatos:
        full = f"{c.nombre} {c.apellido}".lower()
        nombre_lower = c.nombre.lower()
        apellido_lower = c.apellido.lower()
        # Scoring base
        ratio = SequenceMatcher(None, q_lower, full).ratio()
        # Boost si empieza con query
        starts_boost = 0.15 if (nombre_lower.startswith(q_lower) or apellido_lower.startswith(q_lower)) else 0.0
        # Boost si query está totalmente contenido en nombre/apellido
        contains_boost = 0.05 if (q_lower in nombre_lower or q_lower in apellido_lower) else 0.0
        score = ratio + starts_boost + contains_boost
        scored.append((score, ratio, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    seleccion = scored[:limit]
    return [
        {
            "id_cliente": c.id_cliente,
            "nombre": c.nombre,
            "apellido": c.apellido,
            "similaridad": round(ratio, 4),
        }
        for score, ratio, c in seleccion
    ]