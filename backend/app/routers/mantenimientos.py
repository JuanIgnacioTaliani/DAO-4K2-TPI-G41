from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from ..database import get_db
from ..schemas import mantenimientos as mantenimientoSchema
from ..models import Mantenimiento, Vehiculo, Empleado, Alquiler

router = APIRouter(
    prefix="/mantenimientos",
    tags=["Mantenimientos"],
)


@router.get("/", response_model=List[mantenimientoSchema.MantenimientoOut])
def listar_mantenimientos(db: Session = Depends(get_db)):
    """Lista todos los mantenimientos"""
    return db.query(Mantenimiento).all()


@router.get("/{id_mantenimiento}", response_model=mantenimientoSchema.MantenimientoOut)
def obtener_mantenimiento(id_mantenimiento: int, db: Session = Depends(get_db)):
    """Obtiene un mantenimiento por ID"""
    mantenimiento = db.query(Mantenimiento).filter(
        Mantenimiento.id_mantenimiento == id_mantenimiento
    ).first()
    
    if not mantenimiento:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    
    return mantenimiento


@router.post("/", response_model=mantenimientoSchema.MantenimientoOut, status_code=status.HTTP_201_CREATED)
def crear_mantenimiento(
    mantenimiento_in: mantenimientoSchema.MantenimientoCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuevo mantenimiento"""
    # Validar que el vehículo existe
    vehiculo = db.query(Vehiculo).filter(
        Vehiculo.id_vehiculo == mantenimiento_in.id_vehiculo
    ).first()
    
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Validar que el rango de fechas sea válido (si fecha_fin viene informada)
    if mantenimiento_in.fecha_fin is not None and mantenimiento_in.fecha_inicio >= mantenimiento_in.fecha_fin:
        raise HTTPException(status_code=400, detail="Rango de fechas inválido: fecha de inicio debe ser menor a fecha de fin")

    # Validar empleado si se proporciona
    if mantenimiento_in.id_empleado:
        empleado = db.query(Empleado).filter(
            Empleado.id_empleado == mantenimiento_in.id_empleado
        ).first()
        
        if not empleado:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # No permitir crear mantenimiento si el vehículo tiene un alquiler EN_CURSO o en CHECKOUT
    alquiler_activo = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == mantenimiento_in.id_vehiculo,
        Alquiler.estado.in_(["EN_CURSO", "CHECKOUT"])  # estados que bloquean creación de mantenimiento
    ).first()
    if alquiler_activo:
        raise HTTPException(status_code=400, detail="No se puede crear mantenimiento: el vehículo tiene un alquiler en curso o en checkout")

    # Crear mantenimiento
    nuevo_mantenimiento = Mantenimiento(**mantenimiento_in.model_dump())
    db.add(nuevo_mantenimiento)
    db.flush()  # obtener id si es necesario sin cerrar transacción

    # Si existen reservas futuras (PENDIENTE) que se vean afectadas por el mantenimiento, cancelarlas
    hoy = date.today()
    reservas_futuras = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == mantenimiento_in.id_vehiculo,
        Alquiler.estado == "PENDIENTE",
        Alquiler.fecha_inicio >= hoy
    ).all()

    for reserva in reservas_futuras:
        # Si el mantenimiento no tiene fecha_fin, afecta cualquier reserva futura
        # Si tiene fecha_fin y el fin es posterior o igual al inicio de la reserva, también afecta
        afecta = False
        if mantenimiento_in.fecha_fin is None:
            afecta = True
        else:
            if mantenimiento_in.fecha_fin >= reserva.fecha_inicio:
                afecta = True

        if afecta:
            reserva.estado = "CANCELADO"
            reserva.motivo_cancelacion = "Vehículo en mantenimiento"
            reserva.fecha_cancelacion = hoy
            # asociar cancelador si vino empleado en el mantenimiento
            if mantenimiento_in.id_empleado:
                reserva.id_empleado_cancelador = mantenimiento_in.id_empleado
            db.add(reserva)

    db.commit()
    db.refresh(nuevo_mantenimiento)

    return nuevo_mantenimiento


@router.put("/{id_mantenimiento}", response_model=mantenimientoSchema.MantenimientoOut)
def actualizar_mantenimiento(
    id_mantenimiento: int,
    mantenimiento_in: mantenimientoSchema.MantenimientoUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza un mantenimiento existente"""
    mantenimiento = db.query(Mantenimiento).filter(
        Mantenimiento.id_mantenimiento == id_mantenimiento
    ).first()
    
    if not mantenimiento:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    
    # Validar rango de fechas si se proporcionan ambas
    if (
        mantenimiento_in.fecha_inicio is not None
        and mantenimiento_in.fecha_fin is not None
        and mantenimiento_in.fecha_inicio >= mantenimiento_in.fecha_fin
    ):
        raise HTTPException(status_code=400, detail="Rango de fechas inválido: fecha de inicio debe ser menor a fecha de fin")

    # Validar vehículo si se proporciona
    if mantenimiento_in.id_vehiculo:
        vehiculo = db.query(Vehiculo).filter(
            Vehiculo.id_vehiculo == mantenimiento_in.id_vehiculo
        ).first()
        
        if not vehiculo:
            raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Validar empleado si se proporciona
    if mantenimiento_in.id_empleado:
        empleado = db.query(Empleado).filter(
            Empleado.id_empleado == mantenimiento_in.id_empleado
        ).first()
        
        if not empleado:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    # Actualizar campos
    update_data = mantenimiento_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(mantenimiento, key, value)
    
    db.commit()
    db.refresh(mantenimiento)
    
    return mantenimiento


@router.delete("/{id_mantenimiento}")
def eliminar_mantenimiento(id_mantenimiento: int, db: Session = Depends(get_db)):
    """Elimina un mantenimiento"""
    mantenimiento = db.query(Mantenimiento).filter(
        Mantenimiento.id_mantenimiento == id_mantenimiento
    ).first()
    
    if not mantenimiento:
        raise HTTPException(status_code=404, detail="Mantenimiento no encontrado")
    
    db.delete(mantenimiento)
    db.commit()
    
    return {"message": "Mantenimiento eliminado exitosamente"}


@router.get("/vehiculo/{id_vehiculo}", response_model=List[mantenimientoSchema.MantenimientoOut])
def obtener_mantenimientos_vehiculo(id_vehiculo: int, db: Session = Depends(get_db)):
    """Obtiene todos los mantenimientos de un vehículo específico"""
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    mantenimientos = db.query(Mantenimiento).filter(
        Mantenimiento.id_vehiculo == id_vehiculo
    ).order_by(Mantenimiento.fecha_inicio.desc()).all()
    
    return mantenimientos
