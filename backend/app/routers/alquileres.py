from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from decimal import Decimal

from ..database import get_db

from ..schemas import alquileres as alquilerSchema
from ..models import Cliente, Vehiculo, Empleado, Alquiler, EstadoVehiculo, Mantenimiento

router = APIRouter(
    prefix="/alquileres",
    tags=["Alquileres"],
)


def validar_referencias(
    db: Session,
    id_cliente: int,
    id_vehiculo: int,
    id_empleado: int,
):
    if not db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first():
        raise HTTPException(status_code=400, detail="Cliente no encontrado")

    if not db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first():
        raise HTTPException(status_code=400, detail="Vehículo no encontrado")

    if not db.query(Empleado).filter(Empleado.id_empleado == id_empleado).first():
        raise HTTPException(status_code=400, detail="Empleado no encontrado")


def validar_disponibilidad_vehiculo(
    db: Session,
    id_vehiculo: int,
    fecha_inicio: date,
    fecha_fin: date,
    id_alquiler_actual: int | None = None,
):
    """
    Valida que el vehículo esté disponible en el período solicitado.
    Verifica conflictos con otros alquileres activos (PENDIENTE, EN_CURSO, CHECKOUT).
    Verifica si el vehículo está en mantenimiento.
    
    Args:
        db: Sesión de base de datos
        id_vehiculo: ID del vehículo a verificar
        fecha_inicio: Fecha de inicio del período
        fecha_fin: Fecha de fin del período
        id_alquiler_actual: ID del alquiler que se está editando (para excluirlo)
    
    Raises:
        HTTPException: Si el vehículo no está disponible
    """
    
    # Verificar si el vehículo estará en mantenimiento durante el período solicitado (solapamiento de rangos)
    # Solapa si: mant.inicio <= nuevo_fin AND (mant.fin IS NULL OR mant.fin >= nuevo_inicio)
    mantenimientos_conflictivos = db.query(Mantenimiento).filter(
        Mantenimiento.id_vehiculo == id_vehiculo,
        Mantenimiento.fecha_inicio <= fecha_fin,
        ((Mantenimiento.fecha_fin.is_(None)) | (Mantenimiento.fecha_fin >= fecha_inicio))
    ).all()

    if mantenimientos_conflictivos:
        detalles = []
        for m in mantenimientos_conflictivos:
            detalles.append(
                f"{(m.tipo or 'Mantenimiento')} del {m.fecha_inicio} al {m.fecha_fin if m.fecha_fin else 'sin fin'}"
            )
        raise HTTPException(
            status_code=400,
            detail=f"El vehículo está en mantenimiento durante el período solicitado. {', '.join(detalles)}"
        )
    
    # Verificar conflictos con otros ALQUILERES activos (PENDIENTE, EN_CURSO, CHECKOUT)
    query_alquileres = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == id_vehiculo,
        Alquiler.estado.in_(["PENDIENTE", "EN_CURSO", "CHECKOUT"]),  # Estados que bloquean el vehículo
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
    
    # Reportar conflictos si existen
    if alquileres_conflictivos:
        fechas = [f"{a.fecha_inicio} a {a.fecha_fin}" for a in alquileres_conflictivos]
        raise HTTPException(
            status_code=400,
            detail=f"El vehículo no está disponible en el período solicitado. Conflicto con {len(alquileres_conflictivos)} alquiler(es): {', '.join(fechas)}"
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
    periodo_estado: str | None = Query(default=None, description="pendiente|en_curso|checkout"),
):
    q = db.query(Alquiler)

    if estado:
        q = q.filter(Alquiler.estado.in_(estado))
    if id_cliente:
        q = q.filter(Alquiler.id_cliente == id_cliente)
    if id_vehiculo:
        q = q.filter(Alquiler.id_vehiculo == id_vehiculo)
    if id_empleado:
        q = q.filter(Alquiler.id_empleado == id_empleado)

    if fecha_inicio_desde:
        q = q.filter(Alquiler.fecha_inicio >= fecha_inicio_desde)
    if fecha_inicio_hasta:
        q = q.filter(Alquiler.fecha_inicio <= fecha_inicio_hasta)
    if fecha_fin_desde:
        q = q.filter(Alquiler.fecha_fin >= fecha_fin_desde)
    if fecha_fin_hasta:
        q = q.filter(Alquiler.fecha_fin <= fecha_fin_hasta)

    # Filtro de estado temporal por fechas (sin FINALIZADO/CANCELADO)
    if periodo_estado:
        hoy = date.today()
        q = q.filter(~Alquiler.estado.in_(["FINALIZADO", "CANCELADO"]))
        if periodo_estado == "pendiente":
            q = q.filter(Alquiler.fecha_inicio > hoy)
        elif periodo_estado == "en_curso":
            q = q.filter(Alquiler.fecha_inicio <= hoy, Alquiler.fecha_fin >= hoy)
        elif periodo_estado == "checkout":
            q = q.filter(Alquiler.fecha_fin < hoy)

    # Orden por defecto: fecha_inicio desc
    q = q.order_by(Alquiler.fecha_inicio.desc())
    return q.all()


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
    )
    
    # Validar disponibilidad del vehículo
    validar_disponibilidad_vehiculo(
        db,
        alquiler_in.id_vehiculo,
        alquiler_in.fecha_inicio,
        alquiler_in.fecha_fin,
    )

    data = alquiler_in.dict()

    # Si no vino costo_total, lo igualamos a costo_base
    if data.get("costo_total") is None:
        data["costo_total"] = data["costo_base"]
    
    # Capturar el kilometraje inicial del vehículo
    if data.get("km_inicial") is None:
        vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == alquiler_in.id_vehiculo).first()
        if vehiculo:
            data["km_inicial"] = vehiculo.km_actual

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
    fecha_inicio = data.get("fecha_inicio", alquiler.fecha_inicio)
    fecha_fin = data.get("fecha_fin", alquiler.fecha_fin)

    validar_referencias(db, id_cliente, id_vehiculo, id_empleado)
    
    # Validar disponibilidad si cambian fechas o vehículo
    if "fecha_inicio" in data or "fecha_fin" in data or "id_vehiculo" in data:
        validar_disponibilidad_vehiculo(
            db,
            id_vehiculo,
            fecha_inicio,
            fecha_fin,
            id_alquiler_actual=id_alquiler,
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

