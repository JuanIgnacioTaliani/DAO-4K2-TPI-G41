from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import Optional, List

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
