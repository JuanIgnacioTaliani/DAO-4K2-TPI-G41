from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from ..models import Vehiculo, Alquiler, Mantenimiento
from .exceptions import DomainNotFound, BusinessRuleError


def listar_vehiculos(
    db: Session,
    patente: Optional[str] = None,
    marca: Optional[str] = None,
    modelo: Optional[str] = None,
    anio_desde: Optional[int] = None,
    anio_hasta: Optional[int] = None,
    categoria: Optional[int] = None,
    estado: Optional[int] = None,
    km_desde: Optional[int] = None,
    km_hasta: Optional[int] = None,
    fecha_ultimo_mantenimiento_desde: Optional[date] = None,
    fecha_ultimo_mantenimiento_hasta: Optional[date] = None,
) -> List[Vehiculo]:
    query = db.query(Vehiculo)

    if patente:
        query = query.filter(Vehiculo.patente.ilike(f"%{patente}%"))
    if marca:
        query = query.filter(Vehiculo.marca.ilike(f"%{marca}%"))
    if modelo:
        query = query.filter(Vehiculo.modelo.ilike(f"%{modelo}%"))
    if anio_desde is not None:
        query = query.filter(Vehiculo.anio >= anio_desde)
    if anio_hasta is not None:
        query = query.filter(Vehiculo.anio <= anio_hasta)
    if categoria is not None:
        query = query.filter(Vehiculo.id_categoria == categoria)
    if estado is not None:
        query = query.filter(Vehiculo.id_estado == estado)
    if km_desde is not None:
        query = query.filter(Vehiculo.km_actual >= km_desde)
    if km_hasta is not None:
        query = query.filter(Vehiculo.km_actual <= km_hasta)
    if fecha_ultimo_mantenimiento_desde is not None:
        query = query.filter(
            or_(
                Vehiculo.fecha_ultimo_mantenimiento == None,
                Vehiculo.fecha_ultimo_mantenimiento >= fecha_ultimo_mantenimiento_desde
            )
        )
    if fecha_ultimo_mantenimiento_hasta is not None:
        query = query.filter(
            or_(
                Vehiculo.fecha_ultimo_mantenimiento == None,
                Vehiculo.fecha_ultimo_mantenimiento <= fecha_ultimo_mantenimiento_hasta
            )
        )

    return query.all()


def obtener_vehiculo(db: Session, vehiculo_id: int) -> Vehiculo:
    vehiculo = db.query(Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise DomainNotFound("Vehículo no encontrado")
    return vehiculo


def actualizar_vehiculo(db: Session, vehiculo_id: int, data: dict) -> Vehiculo:
    vehiculo = db.query(Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise DomainNotFound("Vehículo no encontrado")

    for field, value in data.items():
        setattr(vehiculo, field, value)

    db.commit()
    db.refresh(vehiculo)
    return vehiculo


def crear_vehiculo(db: Session, vehiculo_in) -> Vehiculo:
    if vehiculo_in.patente:
        existing = db.query(Vehiculo).filter(Vehiculo.patente == vehiculo_in.patente).first()
        if existing:
            raise BusinessRuleError("La patente ya está en uso por otro vehículo")
    
    vehiculo = Vehiculo(**vehiculo_in.model_dump())
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


def eliminar_vehiculo(db: Session, vehiculo_id: int) -> None:
    vehiculo = db.query(Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise DomainNotFound("Vehículo no encontrado")

    alquileres_activos = db.query(Alquiler).filter(
        Alquiler.id_vehiculo == vehiculo_id,
        Alquiler.fecha_devolucion == None
    ).count()
    if alquileres_activos > 0:
        raise BusinessRuleError("No se puede eliminar un vehículo con alquileres activos")

    mantenimientos_pendientes = db.query(Mantenimiento).filter(
        Mantenimiento.id_vehiculo == vehiculo_id,
        Mantenimiento.completado == False
    ).count()
    if mantenimientos_pendientes > 0:
        raise BusinessRuleError("No se puede eliminar un vehículo con mantenimientos")

    db.delete(vehiculo)
    db.commit()


def obtener_vehiculos_con_disponibilidad(db: Session) -> List[dict]:
    vehiculos = db.query(Vehiculo).all()
    hoy = date.today()
    
    resultado = []
    
    for vehiculo in vehiculos:
        estado_disponibilidad = "Disponible"
        ocupacion_detalle = None

        # 1. Verificar si está en mantenimiento hoy (tiene prioridad)
        mantenimiento_activo = db.query(Mantenimiento).filter(
            Mantenimiento.id_vehiculo == vehiculo.id_vehiculo,
            Mantenimiento.fecha_inicio <= hoy,
            ((Mantenimiento.fecha_fin.is_(None)) | (Mantenimiento.fecha_fin >= hoy))
        ).first()
        
        if mantenimiento_activo:
            estado_disponibilidad = "En Mantenimiento"
            ocupacion_detalle = "MANTENIMIENTO"
        else:
            # 2. Verificar si está ocupado hoy por un alquiler EN_CURSO o CHECKOUT
            alquiler_ocupado = db.query(Alquiler).filter(
                Alquiler.id_vehiculo == vehiculo.id_vehiculo,
                Alquiler.estado.in_(["EN_CURSO", "CHECKOUT"])
            ).first()

            if alquiler_ocupado:
                estado_disponibilidad = "Ocupado"
                ocupacion_detalle = alquiler_ocupado.estado
            else:
                # 3. Verificar si está reservado (PENDIENTE)
                reserva = db.query(Alquiler).filter(
                    Alquiler.id_vehiculo == vehiculo.id_vehiculo,
                    Alquiler.estado == "PENDIENTE"
                ).first()
                
                if reserva:
                    estado_disponibilidad = "Ocupado"
                    ocupacion_detalle = "RESERVADO"

        resultado.append({
            "vehiculo": vehiculo,
            "estado_disponibilidad": estado_disponibilidad,
            "ocupacion_detalle": ocupacion_detalle
        })
    
    return resultado
