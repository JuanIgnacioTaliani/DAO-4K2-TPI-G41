from sqlalchemy import or_
from datetime import date
from sqlalchemy.orm import Session

from ..models import Alquiler, Cliente, Vehiculo, Empleado, Mantenimiento
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
