from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import categorias_vehiculo as categoriaSchema
from ..services.exceptions import BusinessRuleError, DomainNotFound
from ..services import categorias_vehiculo as categoriaService

router = APIRouter(
    prefix="/categorias-vehiculo",
    tags=["categorias_vehiculo"],
)


@router.post("/", response_model=categoriaSchema.CategoriaVehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_categoria(categoria_in: categoriaSchema.CategoriaVehiculoCreate, db: Session = Depends(get_db)):
    try:
        return categoriaService.crear_categoria_vehiculo(db, categoria_in)
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al crear la categoría de vehículo")


@router.get("/", response_model=List[categoriaSchema.CategoriaVehiculoOut])
def listar_categorias(
    nombre: Optional[str] = None,
    descripcion: Optional[str] = None,
    tarifa_desde: Optional[float] = None,
    tarifa_hasta: Optional[float] = None,
    db: Session = Depends(get_db),
):
    return categoriaService.listar_categorias_vehiculo(
        db,
        nombre=nombre,
        descripcion=descripcion,
        tarifa_desde=tarifa_desde,
        tarifa_hasta=tarifa_hasta,
    )


@router.get("/{categoria_id}", response_model=categoriaSchema.CategoriaVehiculoOut)
def obtener_categoria(categoria_id: int, db: Session = Depends(get_db)):
    try:
        return categoriaService.obtener_categoria_vehiculo(db, categoria_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{categoria_id}", response_model=categoriaSchema.CategoriaVehiculoOut)
def actualizar_categoria(
    categoria_id: int,
    categoria_in: categoriaSchema.CategoriaVehiculoUpdate,
    db: Session = Depends(get_db),
):
    try:
        return categoriaService.actualizar_categoria_vehiculo(db, categoria_id, categoria_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al actualizar la categoría de vehículo")


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    try:
        categoriaService.eliminar_categoria_vehiculo(db, categoria_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al eliminar la categoría de vehículo")
