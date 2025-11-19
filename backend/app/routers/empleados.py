from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from ..database import get_db
from ..models import empleados as empleadoModel
from ..models import Alquiler
from ..schemas import empleados as empleadoSchema

router = APIRouter(prefix="/empleados", tags=["empleados"])


@router.post("/", response_model=empleadoSchema.EmpleadoOut, status_code=status.HTTP_201_CREATED)
def crear_empleado(empleado_in: empleadoSchema.EmpleadoCreate, db: Session = Depends(get_db)):
    # opcional: validar legajo o dni únicos si vienen cargados
    if empleado_in.dni:
        existente_dni = db.query(empleadoModel.Empleado).filter(empleadoModel.Empleado.dni == empleado_in.dni).first()
        if existente_dni:
            raise HTTPException(status_code=400, detail="Ya existe un empleado con ese DNI")

    if empleado_in.legajo:
        existente_legajo = db.query(empleadoModel.Empleado).filter(empleadoModel.Empleado.legajo == empleado_in.legajo).first()
        if existente_legajo:
            raise HTTPException(status_code=400, detail="Ya existe un empleado con ese legajo")

    empleado = empleadoModel.Empleado(**empleado_in.model_dump())
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado


@router.get("/", response_model=List[empleadoSchema.EmpleadoOut])
def listar_empleados(
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    dni: Optional[str] = None,
    legajo: Optional[str] = None,
    email: Optional[str] = None,
    telefono: Optional[str] = None,
    rol: Optional[str] = None,
    estado: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(empleadoModel.Empleado)

    if nombre:
        query = query.filter(empleadoModel.Empleado.nombre.ilike(f"%{nombre}%"))
    if apellido:
        query = query.filter(empleadoModel.Empleado.apellido.ilike(f"%{apellido}%"))
    if dni:
        query = query.filter(empleadoModel.Empleado.dni.ilike(f"%{dni}%"))
    if legajo:
        query = query.filter(empleadoModel.Empleado.legajo.ilike(f"%{legajo}%"))
    if email:
        query = query.filter(empleadoModel.Empleado.email.ilike(f"%{email}%"))
    if telefono:
        query = query.filter(empleadoModel.Empleado.telefono.ilike(f"%{telefono}%"))
    if rol:
        query = query.filter(empleadoModel.Empleado.rol.ilike(f"%{rol}%"))
    if estado is not None:
        query = query.filter(empleadoModel.Empleado.estado == estado)

    return query.all()


@router.get("/{empleado_id}", response_model=empleadoSchema.EmpleadoOut)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.query(empleadoModel.Empleado).get(empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado


@router.put("/{empleado_id}", response_model=empleadoSchema.EmpleadoOut)
def actualizar_empleado(empleado_id: int, empleado_in: empleadoSchema.EmpleadoUpdate, db: Session = Depends(get_db)):
    empleado = db.query(empleadoModel.Empleado).get(empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    data = empleado_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(empleado, field, value)

    db.commit()
    db.refresh(empleado)
    return empleado


@router.delete("/{empleado_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    empleado = db.query(empleadoModel.Empleado).get(empleado_id)
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    # ¿Tiene alquileres asociados (como empleado que atendió o que canceló)?
    alquiler_existente = (
        db.query(Alquiler)
        .filter((Alquiler.id_empleado == empleado_id) | (Alquiler.id_empleado_cancelador == empleado_id))
        .first()
    )

    if alquiler_existente:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el empleado porque tiene alquileres asociados",
        )

    try:
        db.delete(empleado)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el empleado porque está asociado a uno o más registros (p. ej. alquileres).",
        )

    return None
