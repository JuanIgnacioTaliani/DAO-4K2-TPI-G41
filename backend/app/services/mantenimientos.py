from sqlalchemy import or_
from datetime import date
from sqlalchemy.orm import Session

from ..models import Vehiculo, Empleado, Alquiler, Mantenimiento, EstadoVehiculo
from .exceptions import DomainNotFound, BusinessRuleError


def list_mantenimientos(db: Session, vehiculo=None, tipo=None, empleado=None, estado=None):
    """Devuelve una lista de mantenimientos filtrados por los parámetros opcionales."""
    query = db.query(Mantenimiento)

    if vehiculo is not None:
        query = query.filter(Mantenimiento.id_vehiculo == vehiculo)

    if tipo is not None:
        query = query.filter(Mantenimiento.tipo == tipo)

    if empleado is not None:
        query = query.filter(Mantenimiento.id_empleado == empleado)

    if estado is not None:
        hoy = date.today()
        estado_norm = estado.strip().lower()
        if estado_norm == "en_curso":
            query = query.filter(or_(Mantenimiento.fecha_fin == None, Mantenimiento.fecha_fin > hoy))
        elif estado_norm == "finalizado":
            query = query.filter(Mantenimiento.fecha_fin != None, Mantenimiento.fecha_fin <= hoy)

    return query.all()


def get_mantenimiento(db: Session, id_mantenimiento: int) -> Mantenimiento:
    """Obtiene un mantenimiento por su ID."""
    mantenimiento = db.query(Mantenimiento).filter(
        Mantenimiento.id_mantenimiento == id_mantenimiento
    ).first()
    if not mantenimiento:
        raise DomainNotFound("Mantenimiento no encontrado")
    return mantenimiento


def create_mantenimiento(db: Session, mantenimiento_in) -> Mantenimiento:
    """Crea un mantenimiento aplicando todas las validaciones de negocio.

    Lanza excepciones de dominio (DomainNotFound, BusinessRuleError) en lugar
    de HTTPExceptions para que la capa de presentación decida la respuesta HTTP.
    """
    try:
        # validar vehículo
        vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == mantenimiento_in.id_vehiculo).first()
        if not vehiculo:
            raise DomainNotFound("Vehículo no encontrado")

        # validar rango de fechas
        if mantenimiento_in.fecha_fin is not None and mantenimiento_in.fecha_inicio > mantenimiento_in.fecha_fin:
            raise BusinessRuleError("Rango de fechas inválido: fecha de inicio debe ser menor a fecha de fin")

        # validar empleado si se proporciona
        if mantenimiento_in.id_empleado:
            empleado = db.query(Empleado).filter(Empleado.id_empleado == mantenimiento_in.id_empleado).first()
            if not empleado:
                raise DomainNotFound("Empleado no encontrado")

        # No permitir crear mantenimiento si el vehículo tiene un alquiler EN_CURSO o en CHECKOUT
        alquiler_activo = db.query(Alquiler).filter(
            Alquiler.id_vehiculo == mantenimiento_in.id_vehiculo,
            Alquiler.estado.in_(["EN_CURSO", "CHECKOUT"])
        ).first()
        if alquiler_activo:
            raise BusinessRuleError("No se puede crear mantenimiento: el vehículo tiene un alquiler en curso o en checkout")

        # crear mantenimiento
        nuevo_mantenimiento = Mantenimiento(**mantenimiento_in.model_dump())
        db.add(nuevo_mantenimiento)
        db.flush()  # obtener id si es necesario

        # Si el mantenimiento está "en curso" (fecha_fin es None o > hoy), poner estado del vehículo en "Mantenimiento"
        hoy = date.today()
        en_curso = (
            mantenimiento_in.fecha_fin is None or mantenimiento_in.fecha_fin > hoy
        )
        if en_curso:
            estado_mantenimiento = db.query(EstadoVehiculo).filter(EstadoVehiculo.nombre == "Mantenimiento").first()
            if not estado_mantenimiento:
                raise DomainNotFound("No existe el estado 'Mantenimiento' en la tabla estado_vehiculo")
            vehiculo.id_estado = estado_mantenimiento.id_estado
            db.add(vehiculo)

        # cancelar reservas futuras PENDIENTE si corresponde
        reservas_futuras = db.query(Alquiler).filter(
            Alquiler.id_vehiculo == mantenimiento_in.id_vehiculo,
            Alquiler.estado == "PENDIENTE",
            Alquiler.fecha_inicio >= hoy
        ).all()

        for reserva in reservas_futuras:
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
                if mantenimiento_in.id_empleado:
                    reserva.id_empleado_cancelador = mantenimiento_in.id_empleado
                db.add(reserva)

        db.commit()
        db.refresh(nuevo_mantenimiento)

        return nuevo_mantenimiento
    except (DomainNotFound, BusinessRuleError):
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


def update_mantenimiento(db: Session, id_mantenimiento: int, mantenimiento_in) -> Mantenimiento:
    """Actualiza un mantenimiento existente, validando reglas de negocio y lanzando excepciones de dominio."""
    try:
        mantenimiento = db.query(Mantenimiento).filter(
            Mantenimiento.id_mantenimiento == id_mantenimiento
        ).first()
        if not mantenimiento:
            raise DomainNotFound("Mantenimiento no encontrado")

        # Validar rango de fechas si se proporcionan ambas
        if (
            mantenimiento_in.fecha_inicio is not None
            and mantenimiento_in.fecha_fin is not None
            and mantenimiento_in.fecha_inicio >= mantenimiento_in.fecha_fin
        ):
            raise BusinessRuleError("Rango de fechas inválido: fecha de inicio debe ser menor a fecha de fin")

        # Validar vehículo si se proporciona
        if mantenimiento_in.id_vehiculo:
            vehiculo = db.query(Vehiculo).filter(
                Vehiculo.id_vehiculo == mantenimiento_in.id_vehiculo
            ).first()
            if not vehiculo:
                raise DomainNotFound("Vehículo no encontrado")

        # Validar empleado si se proporciona
        if mantenimiento_in.id_empleado:
            empleado = db.query(Empleado).filter(
                Empleado.id_empleado == mantenimiento_in.id_empleado
            ).first()
            if not empleado:
                raise DomainNotFound("Empleado no encontrado")

        # Actualizar campos
        update_data = mantenimiento_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(mantenimiento, key, value)

        # Verificar si el mantenimiento queda "en curso" tras la actualización
        hoy = date.today()
        fecha_fin = update_data.get("fecha_fin", mantenimiento.fecha_fin)
        en_curso = (fecha_fin is None or fecha_fin > hoy)
        if en_curso:
            # Buscar el vehículo actualizado
            vehiculo_id = update_data.get("id_vehiculo", mantenimiento.id_vehiculo)
            vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == vehiculo_id).first()
            estado_mantenimiento = db.query(EstadoVehiculo).filter(EstadoVehiculo.nombre == "Mantenimiento").first()
            if not estado_mantenimiento:
                raise DomainNotFound("No existe el estado 'Mantenimiento' en la tabla estado_vehiculo")
            vehiculo.id_estado = estado_mantenimiento.id_estado
            db.add(vehiculo)

        db.commit()
        db.refresh(mantenimiento)
        return mantenimiento
    except (DomainNotFound, BusinessRuleError):
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


def actualizar_vehiculos_disponibles_por_mantenimientos(db: Session):
    """
    Actualiza el estado de los vehículos a 'Disponible' si su mantenimiento finalizó (fecha_fin <= hoy)
    y el vehículo sigue en estado 'Mantenimiento'.
    """
    hoy = date.today()
    estado_disponible = db.query(EstadoVehiculo).filter(EstadoVehiculo.nombre == "Disponible").first()
    estado_mantenimiento = db.query(EstadoVehiculo).filter(EstadoVehiculo.nombre == "Mantenimiento").first()
    if not estado_disponible or not estado_mantenimiento:
        raise DomainNotFound("No existe el estado 'Disponible' o 'Mantenimiento' en la tabla estado_vehiculo")

    # Buscar mantenimientos finalizados (fecha_fin <= hoy) y su vehículo sigue en estado 'Mantenimiento'
    mantenimientos_finalizados = db.query(Mantenimiento).filter(
        Mantenimiento.fecha_fin != None,
        Mantenimiento.fecha_fin <= hoy
    ).all()

    actualizados = 0
    for mantenimiento in mantenimientos_finalizados:
        vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == mantenimiento.id_vehiculo).first()
        if vehiculo and vehiculo.id_estado == estado_mantenimiento.id_estado:
            vehiculo.id_estado = estado_disponible.id_estado
            db.add(vehiculo)
            actualizados += 1

    db.commit()
    return actualizados


def delete_mantenimiento(db: Session, id_mantenimiento: int):
    """
    Elimina un mantenimiento. Si estaba en curso, deja el vehículo en estado 'Disponible'.
    """
    try:
        mantenimiento = db.query(Mantenimiento).filter(Mantenimiento.id_mantenimiento == id_mantenimiento).first()
        if not mantenimiento:
            raise DomainNotFound("Mantenimiento no encontrado")

        hoy = date.today()
        en_curso = (mantenimiento.fecha_fin is None or mantenimiento.fecha_fin > hoy)
        vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == mantenimiento.id_vehiculo).first()

        db.delete(mantenimiento)

        if en_curso and vehiculo:
            estado_disponible = db.query(EstadoVehiculo).filter(EstadoVehiculo.nombre == "Disponible").first()
            if not estado_disponible:
                raise DomainNotFound("No existe el estado 'Disponible' en la tabla estado_vehiculo")
            vehiculo.id_estado = estado_disponible.id_estado
            db.add(vehiculo)

        db.commit()
        return True
    except DomainNotFound:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


def obtener_mantenimientos_vehiculo(db: Session, id_vehiculo: int):
    """Obtiene todos los mantenimientos de un vehículo específico"""
    vehiculo = db.query(Vehiculo).filter(Vehiculo.id_vehiculo == id_vehiculo).first()
    
    if not vehiculo:
        raise DomainNotFound("Vehículo no encontrado")
    
    mantenimientos = db.query(Mantenimiento).filter(
        Mantenimiento.id_vehiculo == id_vehiculo
    ).order_by(Mantenimiento.fecha_inicio.desc()).all()
    
    return mantenimientos
