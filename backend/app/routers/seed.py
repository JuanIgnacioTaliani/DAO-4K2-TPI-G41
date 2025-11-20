"""
Router para poblar la base de datos con datos de prueba (seed)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from ..database import get_db
from ..models import (
    Cliente,
    Empleado,
    CategoriaVehiculo,
    EstadoVehiculo,
    Vehiculo,
    Alquiler,
    MultaDanio,
    Mantenimiento,
)

router = APIRouter(
    prefix="/seed",
    tags=["Seed / Datos de Prueba"],
)


def clear_all_data(db: Session):
    """Eliminar todos los datos de las tablas"""
    # Eliminar en orden inverso debido a las foreign keys
    db.query(MultaDanio).delete()
    db.query(Mantenimiento).delete()
    db.query(Alquiler).delete()
    db.query(Vehiculo).delete()
    db.query(EstadoVehiculo).delete()
    db.query(CategoriaVehiculo).delete()
    db.query(Empleado).delete()
    db.query(Cliente).delete()
    db.commit()


@router.post("/")
def seed_database(db: Session = Depends(get_db)):
    """
    Endpoint para poblar la base de datos con datos de prueba (MOCK).
    
    ⚠️ ADVERTENCIA: Este endpoint ELIMINA todos los datos existentes antes de cargar los nuevos.
    
    Solo usar en desarrollo/testing.
    """
    try:
        # Limpiar base de datos
        clear_all_data(db)
        
        stats = {}
        
        # 1. Clientes
        clientes = [
            Cliente(
                id_cliente=1, nombre="Juan", apellido="Pérez", dni="12345678",
                telefono="351-1234567", email="juan.perez@email.com",
                direccion="Av. Colón 1234, Córdoba", estado=True
            ),
            Cliente(
                id_cliente=2, nombre="María", apellido="González", dni="87654321",
                telefono="351-7654321", email="maria.gonzalez@email.com",
                direccion="Bv. San Juan 5678, Córdoba", estado=True
            ),
            Cliente(
                id_cliente=3, nombre="Carlos", apellido="López", dni="11223344",
                telefono="351-5556677", email="carlos.lopez@email.com",
                direccion="Av. Vélez Sarsfield 910, Córdoba", estado=True
            ),
            Cliente(
                id_cliente=4, nombre="Ana", apellido="Martínez", dni="44332211",
                telefono="351-9998877", email="ana.martinez@email.com",
                direccion="Recta Martinolli 2345, Córdoba", estado=True
            ),
        ]
        db.bulk_save_objects(clientes)
        db.commit()
        stats["clientes"] = len(clientes)
        
        # 2. Empleados
        empleados = [
            Empleado(
                id_empleado=1, nombre="Roberto", apellido="Sánchez", dni="20123456",
                legajo="EMP001", email="roberto.sanchez@empresa.com",
                telefono="351-4445566", rol="Vendedor", estado=True
            ),
            Empleado(
                id_empleado=2, nombre="Laura", apellido="Fernández", dni="20654321",
                legajo="EMP002", email="laura.fernandez@empresa.com",
                telefono="351-3332244", rol="Gerente", estado=True
            ),
            Empleado(
                id_empleado=3, nombre="Diego", apellido="Rodríguez", dni="20987654",
                legajo="EMP003", email="diego.rodriguez@empresa.com",
                telefono="351-7778899", rol="Vendedor", estado=True
            ),
            Empleado(
                id_empleado=4, nombre="Sofía", apellido="Ramírez", dni="20456789",
                legajo="EMP004", email="sofia.ramirez@empresa.com",
                telefono="351-6665544", rol="Asistente", estado=True
            ),
        ]
        db.bulk_save_objects(empleados)
        db.commit()
        stats["empleados"] = len(empleados)
        
        # 3. Categorías de Vehículos
        categorias = [
            CategoriaVehiculo(
                id_categoria=1, nombre="Económico",
                descripcion="Vehículos compactos de bajo consumo",
                tarifa_diaria=Decimal("3500.00")
            ),
            CategoriaVehiculo(
                id_categoria=2, nombre="Sedan",
                descripcion="Vehículos medianos confortables",
                tarifa_diaria=Decimal("5000.00")
            ),
            CategoriaVehiculo(
                id_categoria=3, nombre="SUV",
                descripcion="Vehículos deportivos utilitarios",
                tarifa_diaria=Decimal("7500.00")
            ),
            CategoriaVehiculo(
                id_categoria=4, nombre="Premium",
                descripcion="Vehículos de alta gama y lujo",
                tarifa_diaria=Decimal("12000.00")
            ),
        ]
        db.bulk_save_objects(categorias)
        db.commit()
        stats["categorias"] = len(categorias)
        
        # 4. Estados de Vehículos
        estados = [
            EstadoVehiculo(id_estado=1, nombre="Disponible", descripcion="Vehículo listo para alquilar"),
            EstadoVehiculo(id_estado=2, nombre="Alquilado", descripcion="Vehículo actualmente en alquiler"),
            EstadoVehiculo(id_estado=3, nombre="Mantenimiento", descripcion="Vehículo en reparación o servicio"),
            EstadoVehiculo(id_estado=4, nombre="Fuera de Servicio", descripcion="Vehículo no operativo"),
        ]
        db.bulk_save_objects(estados)
        db.commit()
        stats["estados"] = len(estados)
        
        # 5. Vehículos
        vehiculos = [
            Vehiculo(
                id_vehiculo=1, patente="ABC123", marca="Toyota", modelo="Corolla",
                anio=2022, id_categoria=2, id_estado=2, km_actual=15000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-10-15", "%Y-%m-%d").date()
            ),
            Vehiculo(
                id_vehiculo=2, patente="DEF456", marca="Chevrolet", modelo="Onix",
                anio=2023, id_categoria=1, id_estado=1, km_actual=8000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-11-01", "%Y-%m-%d").date()
            ),
            Vehiculo(
                id_vehiculo=3, patente="GHI789", marca="Ford", modelo="Ranger",
                anio=2021, id_categoria=3, id_estado=1, km_actual=45000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-09-20", "%Y-%m-%d").date()
            ),
            Vehiculo(
                id_vehiculo=4, patente="JKL012", marca="Volkswagen", modelo="Vento",
                anio=2023, id_categoria=2, id_estado=1, km_actual=5000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-10-30", "%Y-%m-%d").date()
            ),
            Vehiculo(
                id_vehiculo=5, patente="MNO345", marca="Audi", modelo="A4",
                anio=2024, id_categoria=4, id_estado=1, km_actual=2000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-11-10", "%Y-%m-%d").date()
            ),
            Vehiculo(
                id_vehiculo=6, patente="PQR678", marca="Fiat", modelo="Cronos",
                anio=2022, id_categoria=1, id_estado=1, km_actual=32000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-11-15", "%Y-%m-%d").date()
            ),
        ]
        db.bulk_save_objects(vehiculos)
        db.commit()
        stats["vehiculos"] = len(vehiculos)
        
        # 6. Alquileres
        alquileres = [
            Alquiler(
                id_alquiler=1, id_cliente=1, id_vehiculo=3, id_empleado=1,
                fecha_inicio=datetime.strptime("2025-11-10", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-15", "%Y-%m-%d").date(),
                costo_base=Decimal("37500.00"), costo_total=Decimal("37500.00"),
                estado="FINALIZADO", observaciones="Cliente dejó el vehículo en perfectas condiciones"
            ),
            Alquiler(
                id_alquiler=2, id_cliente=2, id_vehiculo=1, id_empleado=2,
                fecha_inicio=datetime.strptime("2025-11-14", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-22", "%Y-%m-%d").date(),
                costo_base=Decimal("30000.00"), costo_total=Decimal("30000.00"),
                estado="EN_CURSO", observaciones="Incluye seguro adicional - $2500"
            ),
            Alquiler(
                id_alquiler=3, id_cliente=3, id_vehiculo=4, id_empleado=1,
                fecha_inicio=datetime.strptime("2025-11-05", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-08", "%Y-%m-%d").date(),
                costo_base=Decimal("15000.00"), costo_total=Decimal("15000.00"),
                estado="FINALIZADO", observaciones=None
            ),
            Alquiler(
                id_alquiler=4, id_cliente=4, id_vehiculo=2, id_empleado=3,
                fecha_inicio=datetime.strptime("2025-11-25", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-30", "%Y-%m-%d").date(),
                costo_base=Decimal("17500.00"), costo_total=Decimal("17500.00"),
                estado="PENDIENTE", observaciones="Alquiler programado para fin de mes"
            ),
            Alquiler(
                id_alquiler=5, id_cliente=1, id_vehiculo=5, id_empleado=2,
                fecha_inicio=datetime.strptime("2025-12-01", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-12-10", "%Y-%m-%d").date(),
                costo_base=Decimal("108000.00"), costo_total=Decimal("108000.00"),
                estado="PENDIENTE", observaciones="Alquiler vehículo premium para viaje de negocios"
            ),
        ]
        db.bulk_save_objects(alquileres)
        db.commit()
        stats["alquileres"] = len(alquileres)
        
        # 7. Multas y Daños
        multas = [
            MultaDanio(
                id_multa_danio=1, id_alquiler=1, tipo="multa",
                descripcion="Multa de tránsito por exceso de velocidad",
                monto=Decimal("5000.00"),
                fecha_registro=datetime.strptime("2025-11-13T16:45:00", "%Y-%m-%dT%H:%M:%S")
            ),
            MultaDanio(
                id_multa_danio=2, id_alquiler=2, tipo="daño",
                descripcion="Rayón en puerta trasera derecha",
                monto=Decimal("15000.00"),
                fecha_registro=datetime.strptime("2025-11-18T11:20:00", "%Y-%m-%dT%H:%M:%S")
            ),
            MultaDanio(
                id_multa_danio=3, id_alquiler=2, tipo="multa",
                descripcion="Estacionamiento en lugar prohibido",
                monto=Decimal("3500.00"),
                fecha_registro=datetime.strptime("2025-11-17T09:15:00", "%Y-%m-%dT%H:%M:%S")
            ),
            MultaDanio(
                id_multa_danio=4, id_alquiler=1, tipo="retraso",
                descripcion="Devolución con 2 días de retraso",
                monto=Decimal("7500.00"),
                fecha_registro=datetime.strptime("2025-11-17T14:30:00", "%Y-%m-%dT%H:%M:%S")
            ),
        ]
        db.bulk_save_objects(multas)
        db.commit()
        
        # Actualizar costo_total de alquileres
        alquiler1 = db.query(Alquiler).filter(Alquiler.id_alquiler == 1).first()
        alquiler1.costo_total = Decimal("50000.00")
        
        alquiler2 = db.query(Alquiler).filter(Alquiler.id_alquiler == 2).first()
        alquiler2.costo_total = Decimal("48500.00")
        
        db.commit()
        stats["multas_danios"] = len(multas)
        
        # 8. Mantenimientos
        mantenimientos = [
            Mantenimiento(
                id_mantenimiento=1, id_vehiculo=6,
                fecha_inicio=datetime.strptime("2025-11-15", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-20", "%Y-%m-%d").date(),
                tipo="preventivo", descripcion="Service 30.000 km - cambio aceite y filtros",
                costo=Decimal("25000.00"), id_empleado=4
            ),
            Mantenimiento(
                id_mantenimiento=2, id_vehiculo=3,
                fecha_inicio=datetime.strptime("2025-10-05", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-10-08", "%Y-%m-%d").date(),
                tipo="correctivo", descripcion="Reparación de frenos delanteros",
                costo=Decimal("18000.00"), id_empleado=4
            ),
        ]
        db.bulk_save_objects(mantenimientos)
        db.commit()
        stats["mantenimientos"] = len(mantenimientos)
        
        return {
            "message": "Base de datos poblada exitosamente con datos de prueba",
            "success": True,
            "datos_cargados": stats,
            "total_registros": sum(stats.values())
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al poblar la base de datos: {str(e)}"
        )


@router.delete("/")
def clear_database(db: Session = Depends(get_db)):
    """
    Endpoint para limpiar completamente la base de datos.
    
    ⚠️ ADVERTENCIA: Este endpoint ELIMINA todos los datos. Solo usar en desarrollo/testing.
    """
    try:
        clear_all_data(db)
        return {
            "message": "Base de datos limpiada exitosamente",
            "success": True
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al limpiar la base de datos: {str(e)}"
        )
