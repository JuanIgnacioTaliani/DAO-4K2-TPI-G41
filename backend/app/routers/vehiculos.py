from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime

from ..database import get_db
from ..models import vehiculos as vehiculoModel
from ..models import Alquiler, Mantenimiento
from ..schemas import vehiculos as vehiculoSchema

router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("/", response_model=vehiculoSchema.VehiculoOut, status_code=status.HTTP_201_CREATED)
def crear_vehiculo(vehiculo_in: vehiculoSchema.VehiculoCreate, db: Session = Depends(get_db)):
    # patente única
    existente = db.query(vehiculoModel.Vehiculo).filter(vehiculoModel.Vehiculo.patente == vehiculo_in.patente).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un vehículo con esa patente")

    vehiculo = vehiculoModel.Vehiculo(**vehiculo_in.model_dump())
    db.add(vehiculo)
    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get("/", response_model=List[vehiculoSchema.VehiculoOut])
def listar_vehiculos(
    patente: Optional[str] = None,
    marca: Optional[str] = None,
    modelo: Optional[str] = None,
    anio_desde: Optional[int] = None,
    anio_hasta: Optional[int] = None,
    id_categoria: Optional[int] = None,
    id_estado: Optional[int] = None,
    km_desde: Optional[int] = None,
    km_hasta: Optional[int] = None,
    fecha_ultimo_mantenimiento_desde: Optional[date] = None,
    fecha_ultimo_mantenimiento_hasta: Optional[date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(vehiculoModel.Vehiculo)

    if patente:
        query = query.filter(vehiculoModel.Vehiculo.patente.ilike(f"%{patente}%"))
    if marca:
        query = query.filter(vehiculoModel.Vehiculo.marca.ilike(f"%{marca}%"))
    if modelo:
        query = query.filter(vehiculoModel.Vehiculo.modelo.ilike(f"%{modelo}%"))
    if anio_desde is not None:
        query = query.filter(vehiculoModel.Vehiculo.anio >= anio_desde)
    if anio_hasta is not None:
        query = query.filter(vehiculoModel.Vehiculo.anio <= anio_hasta)
    if id_categoria is not None:
        query = query.filter(vehiculoModel.Vehiculo.id_categoria == id_categoria)
    if id_estado is not None:
        query = query.filter(vehiculoModel.Vehiculo.id_estado == id_estado)
    if km_desde is not None:
        query = query.filter(vehiculoModel.Vehiculo.km_actual >= km_desde)
    if km_hasta is not None:
        query = query.filter(vehiculoModel.Vehiculo.km_actual <= km_hasta)
    if fecha_ultimo_mantenimiento_desde is not None:
        query = query.filter(vehiculoModel.Vehiculo.fecha_ultimo_mantenimiento >= fecha_ultimo_mantenimiento_desde)
    if fecha_ultimo_mantenimiento_hasta is not None:
        from datetime import timedelta
        hasta = fecha_ultimo_mantenimiento_hasta + timedelta(days=1)
        query = query.filter(vehiculoModel.Vehiculo.fecha_ultimo_mantenimiento < hasta)

    return query.all()


@router.get("/{vehiculo_id}", response_model=vehiculoSchema.VehiculoOut)
def obtener_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    vehiculo = db.query(vehiculoModel.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")
    return vehiculo


@router.put("/{vehiculo_id}", response_model=vehiculoSchema.VehiculoOut)
def actualizar_vehiculo(vehiculo_id: int, vehiculo_in: vehiculoSchema.VehiculoUpdate, db: Session = Depends(get_db)):
    vehiculo = db.query(vehiculoModel.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    data = vehiculo_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(vehiculo, field, value)

    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.delete("/{vehiculo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_vehiculo(vehiculo_id: int, db: Session = Depends(get_db)):
    vehiculo = db.query(vehiculoModel.Vehiculo).get(vehiculo_id)
    if not vehiculo:
        raise HTTPException(status_code=404, detail="Vehículo no encontrado")

    db.delete(vehiculo)
    db.commit()
    return None


@router.get("/disponibilidad/all", response_model=List[dict])
def obtener_vehiculos_con_disponibilidad(db: Session = Depends(get_db)):
    """
    Obtiene todos los vehículos con su estado de disponibilidad.
    Estados posibles: 'Disponible', 'Ocupado', 'En Mantenimiento'
    """
    vehiculos = db.query(vehiculoModel.Vehiculo).all()
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
                    estado_disponibilidad = "Reservado"
                    ocupacion_detalle = "PENDIENTE"
        
        # Convertir el vehículo a dict y agregar el estado
        vehiculo_dict = {
            "id_vehiculo": vehiculo.id_vehiculo,
            "patente": vehiculo.patente,
            "marca": vehiculo.marca,
            "modelo": vehiculo.modelo,
            "anio": vehiculo.anio,
            "km_actual": vehiculo.km_actual,
            "id_categoria": vehiculo.id_categoria,
            "id_estado": vehiculo.id_estado,
            "fecha_ultimo_mantenimiento": str(vehiculo.fecha_ultimo_mantenimiento) if vehiculo.fecha_ultimo_mantenimiento else None,
            "estado_disponibilidad": estado_disponibilidad,
            "ocupacion_detalle": ocupacion_detalle
        }
        
        resultado.append(vehiculo_dict)
    
    return resultado

