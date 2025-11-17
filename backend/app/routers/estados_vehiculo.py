from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import estados_vehiculo as estadoModel
from ..schemas import estados_vehiculo as estadoSchema

router = APIRouter(
    prefix="/estados-vehiculo",
    tags=["estados_vehiculo"],
)


@router.post("/", response_model=estadoSchema.EstadoVehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_estado(estado_in: estadoSchema.EstadoVehiculoCreate, db: Session = Depends(get_db)):
    existente = (
        db.query(estadoModel.EstadoVehiculo)
        .filter(estadoModel.EstadoVehiculo.nombre == estado_in.nombre)
        .first()
    )
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un estado con ese nombre")

    estado = estadoModel.EstadoVehiculo(**estado_in.model_dump())
    db.add(estado)
    db.commit()
    db.refresh(estado)
    return estado


@router.get("/", response_model=List[estadoSchema.EstadoVehiculoOut])
def listar_estados(db: Session = Depends(get_db)):
    return db.query(estadoModel.EstadoVehiculo).all()


@router.get("/{estado_id}", response_model=estadoSchema.EstadoVehiculoOut)
def obtener_estado(estado_id: int, db: Session = Depends(get_db)):
    estado = db.query(estadoModel.EstadoVehiculo).get(estado_id)
    if not estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")
    return estado


@router.put("/{estado_id}", response_model=estadoSchema.EstadoVehiculoOut)
def actualizar_estado(
    estado_id: int,
    estado_in: estadoSchema.EstadoVehiculoUpdate,
    db: Session = Depends(get_db),
):
    estado = db.query(estadoModel.EstadoVehiculo).get(estado_id)
    if not estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")

    data = estado_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(estado, field, value)

    db.commit()
    db.refresh(estado)
    return estado


@router.delete("/{estado_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_estado(estado_id: int, db: Session = Depends(get_db)):
    estado = db.query(estadoModel.EstadoVehiculo).get(estado_id)
    if not estado:
        raise HTTPException(status_code=404, detail="Estado no encontrado")

    # más adelante podés bloquear si hay vehículos con ese estado como default

    db.delete(estado)
    db.commit()
    return None
