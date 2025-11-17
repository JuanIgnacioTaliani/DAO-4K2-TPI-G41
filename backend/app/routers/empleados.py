from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import empleados as empleadoModel
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
def listar_empleados(db: Session = Depends(get_db)):
    return db.query(empleadoModel.Empleado).all()


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

    db.delete(empleado)
    db.commit()
    return None
