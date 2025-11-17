from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("/", response_model=schemas.VehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_vehiculo(vehiculo_in: schemas.VehiculoCreate, db: Session = Depends(get_db)):
    # patente única
    existente = db.query(models.Vehiculo).filter(models.Vehiculo.patente == vehiculo_in.patente).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un vehículo con esa patente")

    vehiculo = models.Vehiculo(**vehiculo_in.model_dump())
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get("/", response_model=List[schemas.VehiculoOut])
def listar_vehiculos(db: Session = Depends(get_db)):
    return db.query(models.Vehiculo).all()


@router.get("/{vehiculo_id}", response_model=schemas.VehiculoOut)
def obtener_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    vehiculo = db.query(models.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehiculo


@router.put("/{vehiculo_id}", response_model=schemas.VehiculoOut)
def actualizar_vehiculo(vehiculo_id: int, vehiculo_in: schemas.VehiculoUpdate, db: Session = Depends(get_db)):
    vehiculo = db.query(models.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    data = vehiculo_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(vehiculo, field, value)

    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.delete("/{vehiculo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    vehiculo = db.query(models.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    db.delete(vehiculo)
    db.commit()
    return None
