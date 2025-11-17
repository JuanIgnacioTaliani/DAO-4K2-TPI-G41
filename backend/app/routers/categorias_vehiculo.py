from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(
    prefix="/categorias-vehiculo",
    tags=["categorias_vehiculo"],
)


@router.post("/", response_model=schemas.CategoriaVehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(categoria_in: schemas.CategoriaVehiculoCreate, db: Session = Depends(get_db)):
    existente = (
        db.query(models.CategoriaVehiculo)
        .filter(models.CategoriaVehiculo.nombre == categoria_in.nombre)
        .first()
    )
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    categoria = models.CategoriaVehiculo(**categoria_in.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.get("/", response_model=List[schemas.CategoriaVehiculoOut])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(models.CategoriaVehiculo).all()


@router.get("/{categoria_id}", response_model=schemas.CategoriaVehiculoOut)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(models.CategoriaVehiculo).get(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@router.put("/{categoria_id}", response_model=schemas.CategoriaVehiculoOut)
def actualizar_categoria(
    categoria_id: int,
    categoria_in: schemas.CategoriaVehiculoUpdate,
    db: Session = Depends(get_db),
):
    categoria = db.query(models.CategoriaVehiculo).get(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    data = categoria_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(categoria, field, value)

    db.commit()
    db.refresh(categoria)
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(models.CategoriaVehiculo).get(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # ojo: más adelante podés validar que no haya vehículos usando esta categoría

    db.delete(categoria)
    db.commit()
    return None
