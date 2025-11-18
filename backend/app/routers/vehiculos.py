from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import vehiculos as vehiculoModel
from ..schemas import vehiculos as vehiculoSchema

router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("/", response_model=vehiculoSchema.VehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_vehiculo(vehiculo_in: vehiculoSchema.VehiculoCreate, db: Session = Depends(get_db)):
    # patente única
    existente = db.query(vehiculoModel.Vehiculo).filter(vehiculoModel.Vehiculo.patente == vehiculo_in.patente).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un vehículo con esa patente")

    vehiculo = vehiculoModel.Vehiculo(**vehiculo_in.model_dump())
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get("/", response_model=List[vehiculoSchema.VehiculoOut])
def listar_vehiculos(db: Session = Depends(get_db)):
    return db.query(vehiculoModel.Vehiculo).all()


@router.get("/{vehiculo_id}", response_model=vehiculoSchema.VehiculoOut)
def obtener_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    vehiculo = db.query(vehiculoModel.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehiculo


@router.put("/{vehiculo_id}", response_model=vehiculoSchema.VehiculoOut)
def actualizar_vehiculo(vehiculo_id: int, vehiculo_in: vehiculoSchema.VehiculoUpdate, db: Session = Depends(get_db)):
    vehiculo = db.query(vehiculoModel.Vehiculo).get(vehiculo_id)
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
    vehiculo = db.query(vehiculoModel.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    db.delete(vehiculo)
    db.commit()
    return None
