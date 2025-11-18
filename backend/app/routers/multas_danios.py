from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..schemas import multas_danios as multaDanioSchema
from ..models import MultaDanio, Alquiler

router = APIRouter(
    prefix="/multas-danios",
    tags=["Multas y Daños"],
)


@router.get("/", response_model=List[multaDanioSchema.MultaDanioOut])
def listar_multas_danios(
    id_alquiler: Optional[int] = None,
    # Accept both forms: ?tipo=val1&tipo=val2 and ?tipo[]=val1&tipo[]=val2
    tipo: Optional[List[str]] = Query(None),
    tipo_brackets: Optional[List[str]] = Query(None, alias="tipo[]"),
    monto_desde: Optional[float] = None,
    monto_hasta: Optional[float] = None,
    fecha_registro_desde: Optional[datetime] = None,
    fecha_registro_hasta: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Listar todas las multas y daños con filtros opcionales"""
    query = db.query(MultaDanio)
    
    # Filtrar por alquiler
    if id_alquiler is not None:
        query = query.filter(MultaDanio.id_alquiler == id_alquiler)
    
    # Filtrar por tipo (puede ser múltiple)
    tipos = tipo or tipo_brackets or []
    if tipos:
        query = query.filter(MultaDanio.tipo.in_(tipos))
    
    # Filtrar por rango de monto
    if monto_desde is not None:
        query = query.filter(MultaDanio.monto >= monto_desde)
    if monto_hasta is not None:
        query = query.filter(MultaDanio.monto <= monto_hasta)
    
    # Filtrar por rango de fecha de registro
    if fecha_registro_desde is not None:
        query = query.filter(MultaDanio.fecha_registro >= fecha_registro_desde)
    if fecha_registro_hasta is not None:
        # Agregar 1 día para incluir el día completo
        from datetime import timedelta
        fecha_fin = fecha_registro_hasta + timedelta(days=1)
        query = query.filter(MultaDanio.fecha_registro < fecha_fin)
    
    # Ordenar por fecha de registro descendente (más recientes primero)
    query = query.order_by(MultaDanio.fecha_registro.desc())
    
    return query.all()


@router.get("/alquiler/{id_alquiler}", response_model=List[multaDanioSchema.MultaDanioOut])
def listar_multas_por_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    """Listar multas y daños de un alquiler específico"""
    # Verificar que el alquiler existe
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == id_alquiler).first()
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")
    
    return db.query(MultaDanio).filter(MultaDanio.id_alquiler == id_alquiler).all()


@router.get("/{id_multa_danio}", response_model=multaDanioSchema.MultaDanioOut)
def obtener_multa_danio(id_multa_danio: int, db: Session = Depends(get_db)):
    """Obtener una multa/daño específico"""
    multa_danio = (
        db.query(MultaDanio)
        .filter(MultaDanio.id_multa_danio == id_multa_danio)
        .first()
    )
    if not multa_danio:
        raise HTTPException(status_code=404, detail="Multa/Daño no encontrado")
    return multa_danio


@router.post("/", response_model=multaDanioSchema.MultaDanioOut, status_code=status.HTTP_201_CREATED)
def crear_multa_danio(multa_danio_in: multaDanioSchema.MultaDanioCreate, db: Session = Depends(get_db)):
    """Crear una nueva multa o daño"""
    # Validar que el alquiler existe
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == multa_danio_in.id_alquiler).first()
    if not alquiler:
        raise HTTPException(status_code=400, detail="Alquiler no encontrado")
    
    # Crear la multa/daño con fecha_registro automática
    data = multa_danio_in.dict()
    data["fecha_registro"] = datetime.now()
    
    nueva_multa = MultaDanio(**data)
    db.add(nueva_multa)
    
    # Actualizar el costo_total del alquiler sumando el monto de la multa
    alquiler.costo_total = float(alquiler.costo_total or 0) + float(multa_danio_in.monto)
    
    db.commit()
    db.refresh(nueva_multa)
    return nueva_multa


@router.put("/{id_multa_danio}", response_model=multaDanioSchema.MultaDanioOut)
def actualizar_multa_danio(
    id_multa_danio: int,
    multa_danio_in: multaDanioSchema.MultaDanioUpdate,
    db: Session = Depends(get_db),
):
    """Actualizar una multa o daño existente"""
    multa_danio = (
        db.query(MultaDanio)
        .filter(MultaDanio.id_multa_danio == id_multa_danio)
        .first()
    )
    if not multa_danio:
        raise HTTPException(status_code=404, detail="Multa/Daño no encontrado")
    
    # Obtener el alquiler para actualizar el costo_total
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == multa_danio.id_alquiler).first()
    
    # Si cambia el monto, actualizar el costo_total del alquiler
    monto_anterior = float(multa_danio.monto)
    
    data = multa_danio_in.dict(exclude_unset=True)
    
    # Validar si cambia el id_alquiler
    if "id_alquiler" in data and data["id_alquiler"] != multa_danio.id_alquiler:
        nuevo_alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == data["id_alquiler"]).first()
        if not nuevo_alquiler:
            raise HTTPException(status_code=400, detail="Alquiler no encontrado")
        
        # Restar del alquiler anterior y sumar al nuevo
        alquiler.costo_total = float(alquiler.costo_total or 0) - monto_anterior
        nuevo_alquiler.costo_total = float(nuevo_alquiler.costo_total or 0) + float(data.get("monto", monto_anterior))
    elif "monto" in data:
        # Solo cambia el monto en el mismo alquiler
        monto_nuevo = float(data["monto"])
        alquiler.costo_total = float(alquiler.costo_total or 0) - monto_anterior + monto_nuevo
    
    for field, value in data.items():
        setattr(multa_danio, field, value)
    
    db.commit()
    db.refresh(multa_danio)
    return multa_danio


@router.delete("/{id_multa_danio}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_multa_danio(id_multa_danio: int, db: Session = Depends(get_db)):
    """Eliminar una multa o daño"""
    multa_danio = (
        db.query(MultaDanio)
        .filter(MultaDanio.id_multa_danio == id_multa_danio)
        .first()
    )
    if not multa_danio:
        raise HTTPException(status_code=404, detail="Multa/Daño no encontrado")
    
    # Actualizar el costo_total del alquiler restando el monto de la multa
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == multa_danio.id_alquiler).first()
    if alquiler:
        alquiler.costo_total = float(alquiler.costo_total or 0) - float(multa_danio.monto)
    
    db.delete(multa_danio)
    db.commit()
    return None
