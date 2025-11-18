from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import categorias_vehiculo as categoriaModel
from ..schemas import categorias_vehiculo as categoriaSchema

router = APIRouter(
    prefix="/categorias-vehiculo",
    tags=["categorias_vehiculo"],
)


@router.post("/", response_model=categoriaSchema.CategoriaVehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(categoria_in: categoriaSchema.CategoriaVehiculoCreate, db: Session = Depends(get_db)):
    existente = (
        db.query(categoriaModel.CategoriaVehiculo)
        .filter(categoriaModel.CategoriaVehiculo.nombre == categoria_in.nombre)
        .first()
    )
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")

    categoria = categoriaModel.CategoriaVehiculo(**categoria_in.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.get("/", response_model=List[categoriaSchema.CategoriaVehiculoOut])
def listar_categorias(
    nombre: Optional[str] = None,
    descripcion: Optional[str] = None,
    tarifa_desde: Optional[float] = None,
    tarifa_hasta: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(categoriaModel.CategoriaVehiculo)

    if nombre:
        query = query.filter(categoriaModel.CategoriaVehiculo.nombre.ilike(f"%{nombre}%"))
    if descripcion:
        query = query.filter(categoriaModel.CategoriaVehiculo.descripcion.ilike(f"%{descripcion}%"))
    if tarifa_desde is not None:
        query = query.filter(categoriaModel.CategoriaVehiculo.tarifa_diaria >= tarifa_desde)
    if tarifa_hasta is not None:
        query = query.filter(categoriaModel.CategoriaVehiculo.tarifa_diaria <= tarifa_hasta)

    return query.all()


@router.get("/{categoria_id}", response_model=categoriaSchema.CategoriaVehiculoOut)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(categoriaModel.CategoriaVehiculo).get(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


@router.put("/{categoria_id}", response_model=categoriaSchema.CategoriaVehiculoOut)
def actualizar_categoria(
    categoria_id: int,
    categoria_in: categoriaSchema.CategoriaVehiculoUpdate,
    db: Session = Depends(get_db),
):
    categoria = db.query(categoriaModel.CategoriaVehiculo).get(categoria_id)
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
    categoria = db.query(categoriaModel.CategoriaVehiculo).get(categoria_id)
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # ojo: más adelante podés validar que no haya vehículos usando esta categoría

    db.delete(categoria)
    db.commit()
    return None
