from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

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


def validar_disponibilidad_vehiculo(
    db: Session,
    id_vehiculo: int,
    fecha_inicio: date,
    fecha_fin: date,
    id_alquiler_actual: int | None = None,
    id_reserva_vinculada: int | None = None,
):
    """
    Valida que el vehículo esté disponible en el período solicitado.
    Verifica conflictos con otros alquileres y reservas confirmadas.
    
    Args:
        db: Sesión de base de datos
        id_vehiculo: ID del vehículo a verificar
        fecha_inicio: Fecha de inicio del período
        fecha_fin: Fecha de fin del período
        id_alquiler_actual: ID del alquiler que se está editando (para excluirlo)
        id_reserva_vinculada: ID de la reserva de la que viene este alquiler (para excluirla)
    
    Raises:
        HTTPException: Si el vehículo no está disponible
    """
    
    # 1. Verificar conflictos con otros ALQUILERES activos
    query_alquileres = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == id_vehiculo,
        Alquiler.estado.in_(["PENDIENTE", "EN_CURSO"]),  # Solo alquileres activos
        # Condición de solapamiento de fechas:
        # (nuevo_inicio <= existente_fin) AND (nuevo_fin >= existente_inicio)
        Alquiler.fecha_inicio <= fecha_fin,
        Alquiler.fecha_fin >= fecha_inicio
    )
    
    # Si estamos editando un alquiler, excluirlo de la búsqueda
    if id_alquiler_actual:
        query_alquileres = query_alquileres.filter(
            Alquiler.id_alquiler != id_alquiler_actual
        )
    
    alquileres_conflictivos = query_alquileres.all()
    
    # 2. Verificar conflictos con RESERVAS confirmadas
    query_reservas = db.query(Reserva).filter(
        Reserva.id_vehiculo == id_vehiculo,
        Reserva.estado == "CONFIRMADA",  # Solo reservas confirmadas
        Reserva.fecha_inicio <= fecha_fin,
        Reserva.fecha_fin >= fecha_inicio
    )
    
    # Si el alquiler viene de una reserva, excluir esa reserva
    if id_reserva_vinculada:
        query_reservas = query_reservas.filter(
            Reserva.id_reserva != id_reserva_vinculada
        )
    
    reservas_conflictivas = query_reservas.all()
    
    # 3. Reportar conflictos si existen
    if alquileres_conflictivos or reservas_conflictivas:
        mensajes = []
        
        if alquileres_conflictivos:
            fechas = [f"{a.fecha_inicio} a {a.fecha_fin}" for a in alquileres_conflictivos]
            mensajes.append(
                f"Conflicto con {len(alquileres_conflictivos)} alquiler(es): {', '.join(fechas)}"
            )
        
        if reservas_conflictivas:
            fechas = [f"{r.fecha_inicio} a {r.fecha_fin}" for r in reservas_conflictivas]
            mensajes.append(
                f"Conflicto con {len(reservas_conflictivas)} reserva(s): {', '.join(fechas)}"
            )
        
        raise HTTPException(
            status_code=400,
            detail=f"El vehículo no está disponible en el período solicitado. {' | '.join(mensajes)}"
        )



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
    
    # Validar disponibilidad del vehículo
    validar_disponibilidad_vehiculo(
        db,
        alquiler_in.id_vehiculo,
        alquiler_in.fecha_inicio,
        alquiler_in.fecha_fin,
        id_reserva_vinculada=alquiler_in.id_reserva
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
    fecha_inicio = data.get("fecha_inicio", alquiler.fecha_inicio)
    fecha_fin = data.get("fecha_fin", alquiler.fecha_fin)

    validar_referencias(db, id_cliente, id_vehiculo, id_empleado, id_reserva)
    
    # Validar disponibilidad si cambian fechas o vehículo
    if "fecha_inicio" in data or "fecha_fin" in data or "id_vehiculo" in data:
        validar_disponibilidad_vehiculo(
            db,
            id_vehiculo,
            fecha_inicio,
            fecha_fin,
            id_alquiler_actual=id_alquiler,
            id_reserva_vinculada=id_reserva
        )

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


@router.get("/verificar-disponibilidad/{id_vehiculo}")
def verificar_disponibilidad(
    id_vehiculo: int,
    fecha_inicio: date,
    fecha_fin: date,
    db: Session = Depends(get_db)
):
    """
    Verifica si un vehículo está disponible en un período específico.
    Útil para el frontend antes de intentar crear un alquiler.
    
    Retorna información sobre disponibilidad y conflictos si existen.
    """
    # Verificar que el vehículo existe
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Buscar alquileres conflictivos
    alquileres_conflictivos = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == id_vehiculo,
        Alquiler.estado.in_(["PENDIENTE", "EN_CURSO"]),
        Alquiler.fecha_inicio <= fecha_fin,
        Alquiler.fecha_fin >= fecha_inicio
    ).all()
    
    # Buscar reservas conflictivas
    reservas_conflictivas = db.query(Reserva).filter(
        Reserva.id_vehiculo == id_vehiculo,
        Reserva.estado == "CONFIRMADA",
        Reserva.fecha_inicio <= fecha_fin,
        Reserva.fecha_fin >= fecha_inicio
    ).all()
    
    disponible = not (alquileres_conflictivos or reservas_conflictivas)
    
    conflictos = []
    
    for alq in alquileres_conflictivos:
        conflictos.append({
            "tipo": "alquiler",
            "id": alq.id_alquiler,
            "fecha_inicio": str(alq.fecha_inicio),
            "fecha_fin": str(alq.fecha_fin),
            "estado": alq.estado
        })
    
    for res in reservas_conflictivas:
        conflictos.append({
            "tipo": "reserva",
            "id": res.id_reserva,
            "fecha_inicio": str(res.fecha_inicio),
            "fecha_fin": str(res.fecha_fin),
            "estado": res.estado
        })
    
    return {
        "disponible": disponible,
        "id_vehiculo": id_vehiculo,
        "fecha_inicio": str(fecha_inicio),
        "fecha_fin": str(fecha_fin),
        "conflictos": conflictos,
        "mensaje": "Vehículo disponible" if disponible else f"Vehículo no disponible. {len(conflictos)} conflicto(s) encontrado(s)."
    }


@router.get("/vehiculo/{id_vehiculo}/ocupacion")
def obtener_ocupacion_vehiculo(id_vehiculo: int, db: Session = Depends(get_db)):
    """
    Obtiene todos los períodos en los que el vehículo está ocupado
    (alquileres activos y reservas confirmadas).
    Útil para mostrar un calendario de disponibilidad.
    """
    # Verificar que el vehículo existe
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Obtener alquileres activos
    alquileres = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == id_vehiculo,
        Alquiler.estado.in_(["PENDIENTE", "EN_CURSO"])
    ).all()
    
    # Obtener reservas confirmadas
    reservas = db.query(Reserva).filter(
        Reserva.id_vehiculo == id_vehiculo,
        Reserva.estado == "CONFIRMADA"
    ).all()
    
    periodos_ocupados = []
    
    for alq in alquileres:
        periodos_ocupados.append({
            "tipo": "alquiler",
            "id": alq.id_alquiler,
            "fecha_inicio": str(alq.fecha_inicio),
            "fecha_fin": str(alq.fecha_fin),
            "estado": alq.estado,
            "cliente_id": alq.id_cliente
        })
    
    for res in reservas:
        periodos_ocupados.append({
            "tipo": "reserva",
            "id": res.id_reserva,
            "fecha_inicio": str(res.fecha_inicio),
            "fecha_fin": str(res.fecha_fin),
            "estado": res.estado,
            "cliente_id": res.id_cliente
        })
    
    return {
        "id_vehiculo": id_vehiculo,
        "patente": vehiculo.patente,
        "marca": vehiculo.marca,
        "modelo": vehiculo.modelo,
        "total_periodos": len(periodos_ocupados),
        "periodos_ocupados": sorted(periodos_ocupados, key=lambda x: x["fecha_inicio"])
    }

