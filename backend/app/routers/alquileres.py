from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from decimal import Decimal

from ..database import get_db

from ..schemas import alquileres as alquilerSchema
from ..models import Cliente, Vehiculo, Empleado, Alquiler, EstadoVehiculo, Mantenimiento
from ..services import alquileres as alquiler_service
from ..services.exceptions import DomainNotFound, BusinessRuleError

router = APIRouter(
    prefix="/alquileres",
    tags=["Alquileres"],
)


@router.get("/", response_model=List[alquilerSchema.AlquilerOut])
def listar_alquileres(
    db: Session = Depends(get_db),
    estado: List[str] | None = Query(default=None),
    id_cliente: int | None = None,
    id_vehiculo: int | None = None,
    id_empleado: int | None = None,
    fecha_inicio_desde: date | None = None,
    fecha_inicio_hasta: date | None = None,
    fecha_fin_desde: date | None = None,
    fecha_fin_hasta: date | None = None,
):
    return alquiler_service.listar_alquileres(
        db,
        estado,
        id_cliente,
        id_vehiculo,
        id_empleado,
        fecha_inicio_desde,
        fecha_inicio_hasta,
        fecha_fin_desde,
        fecha_fin_hasta,
    )


@router.get("/{id_alquiler}", response_model=alquilerSchema.AlquilerOut)
def obtener_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    try:
        return alquiler_service.get_alquiler(db, id_alquiler)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al obtener el alquiler")


@router.post("/", response_model=alquilerSchema.AlquilerOut, status_code=status.HTTP_201_CREATED)
def crear_alquiler(alquiler_in: alquilerSchema.AlquilerCreate, db: Session = Depends(get_db)):
    try:
        return alquiler_service.create_alquiler(db, alquiler_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id_alquiler}", response_model=alquilerSchema.AlquilerOut)
def actualizar_alquiler(id_alquiler: int,alquiler_in: alquilerSchema.AlquilerUpdate,db: Session = Depends(get_db),):
    try:
        return alquiler_service.update_alquiler(db, id_alquiler, alquiler_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al actualizar el alquiler")


@router.delete("/{id_alquiler}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_alquiler(id_alquiler: int, db: Session = Depends(get_db)):
    try:
        alquiler_service.eliminar_alquiler(db, id_alquiler)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al eliminar el alquiler")

# se va  aeliminar
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
    
    # Buscar alquileres conflictivos (PENDIENTE, EN_CURSO, CHECKOUT)
    alquileres_conflictivos = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == id_vehiculo,
        Alquiler.estado.in_(["PENDIENTE", "EN_CURSO", "CHECKOUT"]),
        Alquiler.fecha_inicio <= fecha_fin,
        Alquiler.fecha_fin >= fecha_inicio
    ).all()
    # Buscar mantenimientos conflictivos (solapamiento de rangos)
    mantenimientos_conflictivos = db.query(Mantenimiento).filter(
        Mantenimiento.id_vehiculo == id_vehiculo,
        Mantenimiento.fecha_inicio <= fecha_fin,
        ((Mantenimiento.fecha_fin.is_(None)) | (Mantenimiento.fecha_fin >= fecha_inicio))
    ).all()

    conflictos = []
    for alq in alquileres_conflictivos:
        conflictos.append({
            "tipo": "alquiler",
            "id": alq.id_alquiler,
            "fecha_inicio": str(alq.fecha_inicio),
            "fecha_fin": str(alq.fecha_fin),
            "estado": alq.estado
        })
    for mant in mantenimientos_conflictivos:
        conflictos.append({
            "tipo": "mantenimiento",
            "id": mant.id_mantenimiento,
            "fecha_inicio": str(mant.fecha_inicio),
            "fecha_fin": str(mant.fecha_fin) if mant.fecha_fin else None,
            "estado": "EN_MANTENIMIENTO"
        })

    disponible = len(conflictos) == 0
    
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
    (alquileres con estado PENDIENTE, EN_CURSO o CHECKOUT).
    Útil para mostrar un calendario de disponibilidad.
    """
    # Verificar que el vehículo existe
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # Obtener alquileres activos
    alquileres = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == id_vehiculo,
        Alquiler.estado.in_(["PENDIENTE", "EN_CURSO", "CHECKOUT"])
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
    
    return {
        "id_vehiculo": id_vehiculo,
        "patente": vehiculo.patente,
        "marca": vehiculo.marca,
        "modelo": vehiculo.modelo,
        "total_periodos": len(periodos_ocupados),
        "periodos_ocupados": sorted(periodos_ocupados, key=lambda x: x["fecha_inicio"])
    }


@router.put("/{id_alquiler}/checkout", response_model=alquilerSchema.CheckoutResponse)
def realizar_checkout(
    id_alquiler: int,
    checkout_data: alquilerSchema.CheckoutRequest,
    db: Session = Depends(get_db)
):
    """
    Realiza el checkout de un alquiler:
    1. Valida que el alquiler esté EN_CURSO o que su período haya finalizado
    2. Registra el kilometraje final
    3. Actualiza el kilometraje del vehículo
    4. Verifica si requiere mantenimiento (cada 10,000 km)
    5. Cambia el estado del alquiler a FINALIZADO
    6. Actualiza el estado del vehículo (Disponible o Mantenimiento)
    7. Crea automáticamente un registro de mantenimiento si es necesario
    """
    # 1. Obtener el alquiler
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == id_alquiler).first()
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    # 2. Validar que el alquiler esté EN_CURSO o que el período haya terminado (CHECKOUT)
    # Calcular si el período terminó
    hoy = date.today()
    periodo_terminado = alquiler.fecha_fin < hoy

    if alquiler.estado == "FINALIZADO":
        raise HTTPException(
            status_code=400,
            detail="Este alquiler ya fue finalizado"
        )

    if alquiler.estado == "CANCELADO":
        raise HTTPException(
            status_code=400,
            detail="No se puede hacer checkout de un alquiler cancelado"
        )

    # Permitir checkout si está EN_CURSO o si el período terminó (calculado como CHECKOUT)
    if alquiler.estado != "EN_CURSO" and not periodo_terminado:
        raise HTTPException(
            status_code=400,
            detail=f"Solo se puede hacer checkout de alquileres EN_CURSO o cuyo período haya finalizado. Estado: {alquiler.estado}, Fecha fin: {alquiler.fecha_fin}"
        )
    
    # 3. Obtener el vehículo
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == alquiler.id_vehiculo).first()
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    
    # 4. Validar que el empleado finalizador existe
    empleado = db.query(Empleado).filter(Empleado.id_empleado == checkout_data.id_empleado_finalizador).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado finalizador no encontrado")
    
    # 5. Validar kilometraje
    if alquiler.km_inicial is None:
        raise HTTPException(
            status_code=400, 
            detail="El alquiler no tiene kilometraje inicial registrado"
        )
    
    if checkout_data.km_final <= alquiler.km_inicial:
        raise HTTPException(
            status_code=400,
            detail=f"El kilometraje final ({checkout_data.km_final}) debe ser mayor al inicial ({alquiler.km_inicial})"
        )
    
    # Validar que no sea un aumento excesivo (más de 10,000 km)
    km_recorridos = checkout_data.km_final - alquiler.km_inicial
    if km_recorridos > 10000:
        raise HTTPException(
            status_code=400,
            detail=f"Kilometraje inusualmente alto: {km_recorridos} km. Verificar el valor ingresado."
        )
    
    # 6. Actualizar el alquiler
    alquiler.km_final = checkout_data.km_final
    # Al completar el proceso de devolución, el alquiler queda FINALIZADO
    alquiler.estado = "FINALIZADO"
    if checkout_data.observaciones_finalizacion:
        if alquiler.observaciones:
            alquiler.observaciones += f" | CHECKOUT: {checkout_data.observaciones_finalizacion}"
        else:
            alquiler.observaciones = f"CHECKOUT: {checkout_data.observaciones_finalizacion}"
    
    # 7. Actualizar kilometraje del vehículo
    vehiculo.km_actual = checkout_data.km_final
    
    # 8. Verificar si requiere mantenimiento
    # Regla: Mantenimiento cada 10,000 km desde el último mantenimiento
    requiere_mantenimiento = False
    motivo_mantenimiento = ""
    
    if vehiculo.fecha_ultimo_mantenimiento:
        # Buscar el último mantenimiento para obtener el KM
        ultimo_mant = db.query(Mantenimiento).filter(
            Mantenimiento.id_vehiculo == vehiculo.id_vehiculo
        ).order_by(Mantenimiento.fecha_fin.desc()).first()
        
        if ultimo_mant:
            # Obtener el KM del vehículo en ese momento (aproximado)
            km_ultimo_mant = vehiculo.km_actual - km_recorridos  # Estimación
        else:
            km_ultimo_mant = 0
    else:
        km_ultimo_mant = 0
    
    km_desde_ultimo = vehiculo.km_actual - km_ultimo_mant
    
    if km_desde_ultimo >= 10000:
        requiere_mantenimiento = True
        motivo_mantenimiento = f"Service preventivo - {km_desde_ultimo} km desde último mantenimiento"
    
    # 9. Actualizar estado del vehículo y crear mantenimiento si es necesario
    mantenimiento_id = None
    nuevo_estado_vehiculo = ""
    
    if requiere_mantenimiento:
        # Cambiar estado a Mantenimiento
        estado_mant = db.query(EstadoVehiculo).filter(
            EstadoVehiculo.nombre == "Mantenimiento"
        ).first()
        
        if estado_mant:
            vehiculo.id_estado = estado_mant.id_estado
            nuevo_estado_vehiculo = "Mantenimiento"
            
            # Crear registro de mantenimiento
            nuevo_mantenimiento = Mantenimiento(
                id_vehiculo=vehiculo.id_vehiculo,
                fecha_inicio=date.today(),
                fecha_fin=None,  # Se completará cuando termine el mantenimiento
                tipo="preventivo",
                descripcion=motivo_mantenimiento,
                costo=Decimal("0.00"),  # Se actualizará cuando se complete
                id_empleado=checkout_data.id_empleado_finalizador
            )
            db.add(nuevo_mantenimiento)
            db.flush()  # Para obtener el ID
            mantenimiento_id = nuevo_mantenimiento.id_mantenimiento
    else:
        # Cambiar estado a Disponible
        estado_disp = db.query(EstadoVehiculo).filter(
            EstadoVehiculo.nombre == "Disponible"
        ).first()
        
        if estado_disp:
            vehiculo.id_estado = estado_disp.id_estado
            nuevo_estado_vehiculo = "Disponible"
    
    # 10. Guardar todos los cambios
    db.commit()
    db.refresh(alquiler)
    db.refresh(vehiculo)
    
    return alquilerSchema.CheckoutResponse(
        success=True,
        message=f"Checkout realizado exitosamente. Vehículo ahora en estado: {nuevo_estado_vehiculo}",
        alquiler_id=alquiler.id_alquiler,
        km_recorridos=km_recorridos,
        requiere_mantenimiento=requiere_mantenimiento,
        nuevo_estado_vehiculo=nuevo_estado_vehiculo,
        mantenimiento_creado=mantenimiento_id
    )


@router.put("/{id_alquiler}/cancelar", response_model=alquilerSchema.CancelarResponse)
def cancelar_alquiler(
    id_alquiler: int,
    datos_cancelacion: alquilerSchema.CancelarRequest,
    db: Session = Depends(get_db)
):
    """
    Cancela un alquiler que esté en estado PENDIENTE o EN_CURSO.
    Libera el vehículo para otros alquileres.
    """
    # 1. Buscar el alquiler
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == id_alquiler).first()
    
    if not alquiler:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")
    
    # 2. Validar que el alquiler pueda ser cancelado
    if alquiler.estado not in ["PENDIENTE", "EN_CURSO"]:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede cancelar un alquiler en estado {alquiler.estado}. Solo se pueden cancelar alquileres PENDIENTE o EN_CURSO."
        )
    
    # 3. Verificar que el empleado existe
    empleado = db.query(Empleado).filter(
        Empleado.id_empleado == datos_cancelacion.id_empleado_cancelador
    ).first()
    
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado cancelador no encontrado")
    
    # 4. Guardar estado anterior
    estado_anterior = alquiler.estado
    
    # 5. Actualizar el alquiler con los datos de cancelación
    alquiler.estado = "CANCELADO"
    alquiler.motivo_cancelacion = datos_cancelacion.motivo_cancelacion
    alquiler.fecha_cancelacion = datetime.now()
    alquiler.id_empleado_cancelador = datos_cancelacion.id_empleado_cancelador
    
    # 6. Si el vehículo estaba reservado/en uso, liberarlo (volver a Disponible)
    if estado_anterior in ["PENDIENTE", "EN_CURSO"]:
        vehiculo = db.query(Vehiculo).filter(
            Vehiculo.id_vehiculo == alquiler.id_vehiculo
        ).first()
        
        if vehiculo:
            # Buscar el estado "Disponible"
            estado_disponible = db.query(EstadoVehiculo).filter(
                EstadoVehiculo.nombre == "Disponible"
            ).first()
            
            if estado_disponible:
                vehiculo.id_estado = estado_disponible.id_estado
    
    # 7. Guardar cambios
    db.commit()
    db.refresh(alquiler)
    
    return alquilerSchema.CancelarResponse(
        success=True,
        message=f"Alquiler cancelado exitosamente. Motivo: {datos_cancelacion.motivo_cancelacion}",
        alquiler_id=alquiler.id_alquiler,
        estado_anterior=estado_anterior,
        fecha_cancelacion=alquiler.fecha_cancelacion.isoformat()
    )


@router.post("actualizar-estado-alquileres", response_model=int)
def actualizar_estado_alquileres(db: Session = Depends(get_db)):
    """
    Actualiza el estado de los alquileres basándose en la fecha actual.
    - De PENDIENTE a EN_CURSO si la fecha de inicio es hoy o anterior.
    - De EN_CURSO a CHECKOUT si la fecha de fin es anterior a hoy.
    
    Retorna la cantidad de alquileres actualizados.
    """
    try:
        cantidad_actualizados = alquiler_service.actualizar_estados_alquileres(db)
        return cantidad_actualizados
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
