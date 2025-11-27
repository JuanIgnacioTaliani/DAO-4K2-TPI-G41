from sqlalchemy import or_
from datetime import date, datetime
from sqlalchemy.orm import Session

from ..models import Alquiler, Cliente, Vehiculo, Empleado, Mantenimiento, EstadoVehiculo, MultaDanio
from ..schemas import alquileres as alquilerSchema
from .exceptions import DomainNotFound, BusinessRuleError


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


def listar_alquileres(
    db: Session,
    estado=None,
    id_cliente=None,
    id_vehiculo=None,
    id_empleado=None,
    fecha_inicio_desde=None,
    fecha_inicio_hasta=None,
    fecha_fin_desde=None,
    fecha_fin_hasta=None,
    periodo_estado=None,
):
    actualizar_estados_alquileres(db)

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

    # Orden por defecto: fecha_inicio desc
    q = q.order_by(Alquiler.fecha_inicio.desc())
    return q.all()


def get_alquiler(db: Session, id_alquiler: int) -> Alquiler:
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == id_alquiler).first()
    if not alquiler:
        raise DomainNotFound(f"Alquiler con id {id_alquiler} no encontrado")
    return alquiler


def create_alquiler(db: Session, alquiler_in) -> Alquiler:
    validar_referencias(
        db,
        alquiler_in.id_cliente,
        alquiler_in.id_vehiculo,
        alquiler_in.id_empleado,
    )

    validar_disponibilidad_vehiculo(
        db,
        alquiler_in.id_vehiculo,
        alquiler_in.fecha_inicio,
        alquiler_in.fecha_fin,
    )

    nuevo_alquiler = Alquiler(
        id_cliente=alquiler_in.id_cliente,
        id_vehiculo=alquiler_in.id_vehiculo,
        id_empleado=alquiler_in.id_empleado,
        fecha_inicio=alquiler_in.fecha_inicio,
        fecha_fin=alquiler_in.fecha_fin,
        estado=alquiler_in.estado,
        costo_base=alquiler_in.costo_base,
        costo_total=alquiler_in.costo_base,  # Inicialmente igual al costo_base
        observaciones=alquiler_in.observaciones,
    )

    db.add(nuevo_alquiler)
    db.commit()
    db.refresh(nuevo_alquiler)
    return nuevo_alquiler


def update_alquiler(db: Session, id_alquiler: int, alquiler_in) -> Alquiler:
    alquiler = get_alquiler(db, id_alquiler)

    # Validar referencias si se están actualizando
    if alquiler_in.id_cliente is not None:
        if not db.query(Cliente).filter(Cliente.id_cliente == alquiler_in.id_cliente).first():
            raise HTTPException(status_code=400, detail="Cliente no encontrado")
        alquiler.id_cliente = alquiler_in.id_cliente

    if alquiler_in.id_vehiculo is not None:
        if not db.query(Vehiculo).filter(Vehiculo.id_vehiculo == alquiler_in.id_vehiculo).first():
            raise HTTPException(status_code=400, detail="Vehículo no encontrado")
        alquiler.id_vehiculo = alquiler_in.id_vehiculo

    if alquiler_in.id_empleado is not None:
        if not db.query(Empleado).filter(Empleado.id_empleado == alquiler_in.id_empleado).first():
            raise HTTPException(status_code=400, detail="Empleado no encontrado")
        alquiler.id_empleado = alquiler_in.id_empleado

    # Validar disponibilidad si se están actualizando fechas o vehículo
    nueva_fecha_inicio = alquiler_in.fecha_inicio if alquiler_in.fecha_inicio is not None else alquiler.fecha_inicio
    nueva_fecha_fin = alquiler_in.fecha_fin if alquiler_in.fecha_fin is not None else alquiler.fecha_fin
    nuevo_id_vehiculo = alquiler_in.id_vehiculo if alquiler_in.id_vehiculo is not None else alquiler.id_vehiculo

    validar_disponibilidad_vehiculo(
        db,
        nuevo_id_vehiculo,
        nueva_fecha_inicio,
        nueva_fecha_fin,
        id_alquiler_actual=id_alquiler
    )

    # Actualizar campos
    for field, value in alquiler_in.model_dump(exclude_unset=True).items():
        setattr(alquiler, field, value)

    db.commit()
    db.refresh(alquiler)
    return alquiler


def eliminar_alquiler(db: Session, id_alquiler: int) -> None:
    alquiler = get_alquiler(db, id_alquiler)
    db.delete(alquiler)
    # eliminar multas asociadas al alquiler
    multas = db.query(MultaDanio).filter(MultaDanio.id_alquiler == id_alquiler).all()
    for multa in multas:
        db.delete(multa)

    db.commit()


def actualizar_estados_alquileres(db: Session) -> int:
    """Actualiza los estados de los alquileres según la fecha actual.
    Retorna la cantidad de alquileres actualizados.
    """
    hoy = date.today()
    alquileres = db.query(Alquiler).all()
    actualizados = 0

    for alquiler in alquileres:
        estado_original = alquiler.estado

        if alquiler.estado == "PENDIENTE" and alquiler.fecha_inicio <= hoy:
            alquiler.estado = "EN_CURSO"
        elif alquiler.estado == "EN_CURSO" and alquiler.fecha_fin < hoy:
            alquiler.estado = "CHECKOUT"

        if alquiler.estado != estado_original:
            actualizados += 1

    db.commit()
    return actualizados


def realizar_checkout(db: Session, id_alquiler: int, checkout_data) -> Alquiler:
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


def cancelar_alquiler(db: Session, id_alquiler: int, datos_cancelacion) -> Alquiler:
    """
    Cancela un alquiler que esté en estado PENDIENTE o EN_CURSO.
    Libera el vehículo para otros alquileres.
    """
    # 1. Buscar el alquiler
    alquiler = db.query(Alquiler).filter(Alquiler.id_alquiler == id_alquiler).first()
    
    if not alquiler:
        raise DomainNotFound("Alquiler no encontrado")
    
    # 2. Validar que el alquiler pueda ser cancelado
    if alquiler.estado not in ["PENDIENTE", "EN_CURSO"]:
        raise BusinessRuleError(f"No se puede cancelar un alquiler en estado {alquiler.estado}. Solo se pueden cancelar alquileres PENDIENTE o EN_CURSO.")
    
    # 3. Verificar que el empleado existe
    empleado = db.query(Empleado).filter(
        Empleado.id_empleado == datos_cancelacion.id_empleado_cancelador
    ).first()
    
    if not empleado:
        raise DomainNotFound("Empleado cancelador no encontrado")
    
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
