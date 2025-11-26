from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional

from ..models import Empleado, Alquiler, Mantenimiento
from .exceptions import DomainNotFound, BusinessRuleError


def listar_empleados(
    db: Session,
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    dni: Optional[str] = None,
    legajo: Optional[str] = None,
    email: Optional[str] = None,
    telefono: Optional[str] = None,
    rol: Optional[str] = None,
    estado: Optional[bool] = None,
) -> List[Empleado]:
    query = db.query(Empleado)

    if nombre:
        query = query.filter(Empleado.nombre.ilike(f"%{nombre}%"))
    if apellido:
        query = query.filter(Empleado.apellido.ilike(f"%{apellido}%"))
    if dni:
        query = query.filter(Empleado.dni.ilike(f"%{dni}%"))
    if legajo:
        query = query.filter(Empleado.legajo.ilike(f"%{legajo}%"))
    if email:
        query = query.filter(Empleado.email.ilike(f"%{email}%"))
    if telefono:
        query = query.filter(Empleado.telefono.ilike(f"%{telefono}%"))
    if rol:
        query = query.filter(Empleado.rol.ilike(f"%{rol}%"))
    if estado is not None:
        query = query.filter(Empleado.estado == estado)

    return query.all()


def crear_empleado(db: Session, empleado_in) -> Empleado:
    if empleado_in.dni:
        existente_dni = db.query(Empleado).filter(Empleado.dni == empleado_in.dni).first()
        if existente_dni:
            raise BusinessRuleError("Ya existe un empleado con ese DNI")

    if empleado_in.legajo:
        existente_legajo = db.query(Empleado).filter(Empleado.legajo == empleado_in.legajo).first()
        if existente_legajo:
            raise BusinessRuleError("Ya existe un empleado con ese legajo")

    empleado = Empleado(**empleado_in.model_dump())
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado


def actualizar_empleado(db: Session, empleado_id: int, empleado_in) -> Empleado:
    empleado = db.query(Empleado).get(empleado_id)
    if not empleado:
        raise DomainNotFound("Empleado no encontrado")

    if empleado_in.dni and empleado_in.dni != empleado.dni:
        existente_dni = db.query(Empleado).filter(Empleado.dni == empleado_in.dni).first()
        if existente_dni:
            raise BusinessRuleError("Ya existe un empleado con ese DNI")

    if empleado_in.legajo and empleado_in.legajo != empleado.legajo:
        existente_legajo = db.query(Empleado).filter(Empleado.legajo == empleado_in.legajo).first()
        if existente_legajo:
            raise BusinessRuleError("Ya existe un empleado con ese legajo")
    
    data = empleado_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(empleado, field, value)

    db.commit()
    db.refresh(empleado)
    return empleado


def eliminar_empleado(db: Session, empleado_id: int) -> None:
    empleado = db.query(Empleado).get(empleado_id)
    if not empleado:
        raise DomainNotFound("Empleado no encontrado")

    alquileres_asignados = db.query(Alquiler).filter(Alquiler.id_empleado == empleado_id).first()
    if alquileres_asignados:
        raise BusinessRuleError("No se puede eliminar el empleado porque tiene alquileres asignados")
    
    mantenimientos_asignados = db.query(Mantenimiento).filter(Mantenimiento.id_empleado == empleado_id).first()
    if mantenimientos_asignados:
        raise BusinessRuleError("No se puede eliminar el empleado porque tiene mantenimientos asignados")

    db.delete(empleado)
    db.commit()


def obtener_empleado_por_id(db: Session, empleado_id: int) -> Empleado:
    empleado = db.query(Empleado).get(empleado_id)
    if not empleado:
        raise DomainNotFound("Empleado no encontrado")
    return empleado
