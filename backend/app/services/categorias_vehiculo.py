from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional

from ..models import CategoriaVehiculo, Vehiculo
from .exceptions import DomainNotFound, BusinessRuleError


def listar_categorias_vehiculo(
    db: Session,
    nombre: Optional[str] = None,
    descripcion: Optional[str] = None,
    tarifa_desde: Optional[float] = None,
    tarifa_hasta: Optional[float] = None,
) -> List[CategoriaVehiculo]:
    query = db.query(CategoriaVehiculo)

    if nombre:
        query = query.filter(CategoriaVehiculo.nombre.ilike(f"%{nombre}%"))
    if descripcion:
        query = query.filter(CategoriaVehiculo.descripcion.ilike(f"%{descripcion}%"))
    if tarifa_desde is not None:
        query = query.filter(CategoriaVehiculo.tarifa_diaria >= tarifa_desde)
    if tarifa_hasta is not None:
        query = query.filter(CategoriaVehiculo.tarifa_diaria <= tarifa_hasta)

    return query.all()


def obtener_categoria_vehiculo(db: Session, categoria_id: int) -> CategoriaVehiculo:
    categoria = db.query(CategoriaVehiculo).get(categoria_id)
    if not categoria:
        raise DomainNotFound(f"Categoria con id {categoria_id} no encontrada")
    return categoria


def crear_categoria_vehiculo(db: Session, categoria_in) -> CategoriaVehiculo:
    nueva_categoria = CategoriaVehiculo(**categoria_in.model_dump())
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria


def actualizar_categoria_vehiculo(db: Session, categoria_id: int, categoria_in) -> CategoriaVehiculo:
    categoria = obtener_categoria_vehiculo(db, categoria_id)

    for field, value in categoria_in.model_dump(exclude_unset=True).items():
        setattr(categoria, field, value)

    db.commit()
    db.refresh(categoria)
    return categoria


def eliminar_categoria_vehiculo(db: Session, categoria_id: int) -> None:
    categoria = obtener_categoria_vehiculo(db, categoria_id)

    vehiculos_asociados = db.query(Vehiculo).filter(Vehiculo.id_categoria == categoria_id).first()
    if vehiculos_asociados:
        raise BusinessRuleError("No se puede eliminar la categoria porque hay vehiculos asociados a ella.")

    db.delete(categoria)
    db.commit()
