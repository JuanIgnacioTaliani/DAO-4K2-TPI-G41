from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db

from ..schemas import alquileres as alquilerSchema
from ..models import Cliente, Vehiculo, Empleado, Reserva, Alquiler

router = APIRouter(
    prefix="/alquileres",
    tags=["Alquileres"],
)


def validar_referencias(
    db: Session,
    id_cliente: int,
    id_vehiculo: int,
    id_empleado: int,
    id_reserva: int | None = None,
):
    if not db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first():
        raise HTTPException(status_code=400, detail="Cliente no encontrado")

    if not db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first():
        raise HTTPException(status_code=400, detail="Vehículo no encontrado")

    if not db.query(Empleado).filter(Empleado.id_empleado == id_empleado).first():
        raise HTTPException(status_code=400, detail="Empleado no encontrado")

    if id_reserva is not None:
        if not db.query(Reserva).filter(Reserva.id_reserva == id_reserva).first():
            raise HTTPException(status_code=400, detail="Reserva no encontrada")


@router.get("/", response_model=List[alquilerSchema.AlquilerOut])
def listar_alquileres(db: Session = Depends(get_db)):
    return db.query(Alquiler).all()


@router.get("/{id_alquiler}", response_model=alquilerSchema.AlquilerOut)
def obtener_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    alquiler = (
        db.query(Alquiler)
        .filter(Alquiler.id_alquiler == id_alquiler)
        .first()
    )
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")
    return alquiler


@router.post("/", response_model=alquilerSchema.AlquilerOut, status_code=status.HTTP_201_CREATED)
def crear_alquiler(alquiler_in: alquilerSchema.AlquilerCreate, db: Session = Depends(get_db)):
    # Validar FKs
    validar_referencias(
        db,
        alquiler_in.id_cliente,
        alquiler_in.id_vehiculo,
        alquiler_in.id_empleado,
        alquiler_in.id_reserva,
    )

    data = alquiler_in.dict()

    # Si no vino costo_total, lo igualamos a costo_base
    if data.get("costo_total") is None:
        data["costo_total"] = data["costo_base"]

    nuevo = Alquiler(**data)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{id_alquiler}", response_model=alquilerSchema.AlquilerOut)
def actualizar_alquiler(
    id_alquiler: int,
    alquiler_in: alquilerSchema.AlquilerUpdate,
    db: Session = Depends(get_db),
):
    alquiler = (
        db.query(Alquiler)
        .filter(Alquiler.id_alquiler == id_alquiler)
        .first()
    )
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    data = alquiler_in.dict(exclude_unset=True)

    # Resolver valores finales para validar FKs (si alguno no vino, usamos el actual)
    id_cliente = data.get("id_cliente", alquiler.id_cliente)
    id_vehiculo = data.get("id_vehiculo", alquiler.id_vehiculo)
    id_empleado = data.get("id_empleado", alquiler.id_empleado)
    id_reserva = data.get("id_reserva", alquiler.id_reserva)

    validar_referencias(db, id_cliente, id_vehiculo, id_empleado, id_reserva)

    for field, value in data.items():
        setattr(alquiler, field, value)

    if alquiler.costo_total is None:
        alquiler.costo_total = alquiler.costo_base

    db.commit()
    db.refresh(alquiler)
    return alquiler


@router.delete("/{id_alquiler}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    alquiler = (
        db.query(Alquiler)
        .filter(Alquiler.id_alquiler == id_alquiler)
        .first()
    )
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    db.delete(alquiler)
    db.commit()
    return None
