"""
Script para poblar la base de datos con datos de prueba (MOCK)
Ejecutar desde la raíz del proyecto backend:
    python seed_database.py
"""
import sys
import os
from datetime import datetime
from decimal import Decimal

# Agregar el directorio actual al path para poder importar los módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import (
    Cliente,
    Empleado,
    CategoriaVehiculo,
    EstadoVehiculo,
    Vehiculo,
    Reserva,
    Alquiler,
    MultaDanio,
    Mantenimiento,
)


def clear_database():
    """Eliminar todos los datos de las tablas"""
    print("🗑️  Limpiando base de datos...")
    db = SessionLocal()
    try:
        # Eliminar en orden inverso debido a las foreign keys
        db.query(MultaDanio).delete()
        db.query(Mantenimiento).delete()
        db.query(Alquiler).delete()
        db.query(Reserva).delete()
        db.query(Vehiculo).delete()
        db.query(EstadoVehiculo).delete()
        db.query(CategoriaVehiculo).delete()
        db.query(Empleado).delete()
        db.query(Cliente).delete()
        db.commit()
        print("✅ Base de datos limpiada correctamente")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al limpiar la base de datos: {e}")
        raise
    finally:
        db.close()


def seed_clientes():
    """Poblar tabla de clientes"""
    print("\n👤 Cargando clientes...")
    db = SessionLocal()
    try:
        clientes = [
            Cliente(
                id_cliente=1,
                nombre="Juan",
                apellido="Pérez",
                dni="12345678",
                telefono="351-1234567",
                email="juan.perez@email.com",
                direccion="Av. Colón 1234, Córdoba",
                estado=True,
            ),
            Cliente(
                id_cliente=2,
                nombre="María",
                apellido="González",
                dni="87654321",
                telefono="351-7654321",
                email="maria.gonzalez@email.com",
                direccion="Bv. San Juan 5678, Córdoba",
                estado=True,
            ),
            Cliente(
                id_cliente=3,
                nombre="Carlos",
                apellido="López",
                dni="11223344",
                telefono="351-5556677",
                email="carlos.lopez@email.com",
                direccion="Av. Vélez Sarsfield 910, Córdoba",
                estado=True,
            ),
            Cliente(
                id_cliente=4,
                nombre="Ana",
                apellido="Martínez",
                dni="44332211",
                telefono="351-9998877",
                email="ana.martinez@email.com",
                direccion="Recta Martinolli 2345, Córdoba",
                estado=True,
            ),
        ]
        db.bulk_save_objects(clientes)
        db.commit()
        print(f"✅ {len(clientes)} clientes cargados")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar clientes: {e}")
        raise
    finally:
        db.close()


def seed_empleados():
    """Poblar tabla de empleados"""
    print("\n👨‍💼 Cargando empleados...")
    db = SessionLocal()
    try:
        empleados = [
            Empleado(
                id_empleado=1,
                nombre="Roberto",
                apellido="Sánchez",
                dni="20123456",
                legajo="EMP001",
                email="roberto.sanchez@empresa.com",
                telefono="351-4445566",
                rol="Vendedor",
                estado=True,
            ),
            Empleado(
                id_empleado=2,
                nombre="Laura",
                apellido="Fernández",
                dni="20654321",
                legajo="EMP002",
                email="laura.fernandez@empresa.com",
                telefono="351-3332244",
                rol="Gerente",
                estado=True,
            ),
            Empleado(
                id_empleado=3,
                nombre="Diego",
                apellido="Rodríguez",
                dni="20987654",
                legajo="EMP003",
                email="diego.rodriguez@empresa.com",
                telefono="351-7778899",
                rol="Vendedor",
                estado=True,
            ),
            Empleado(
                id_empleado=4,
                nombre="Sofía",
                apellido="Ramírez",
                dni="20456789",
                legajo="EMP004",
                email="sofia.ramirez@empresa.com",
                telefono="351-6665544",
                rol="Asistente",
                estado=True,
            ),
        ]
        db.bulk_save_objects(empleados)
        db.commit()
        print(f"✅ {len(empleados)} empleados cargados")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar empleados: {e}")
        raise
    finally:
        db.close()


def seed_categorias_vehiculo():
    """Poblar tabla de categorías de vehículos"""
    print("\n🏷️  Cargando categorías de vehículos...")
    db = SessionLocal()
    try:
        categorias = [
            CategoriaVehiculo(
                id_categoria=1,
                nombre="Económico",
                descripcion="Vehículos compactos de bajo consumo",
                tarifa_diaria=Decimal("3500.00"),
            ),
            CategoriaVehiculo(
                id_categoria=2,
                nombre="Sedan",
                descripcion="Vehículos medianos confortables",
                tarifa_diaria=Decimal("5000.00"),
            ),
            CategoriaVehiculo(
                id_categoria=3,
                nombre="SUV",
                descripcion="Vehículos deportivos utilitarios",
                tarifa_diaria=Decimal("7500.00"),
            ),
            CategoriaVehiculo(
                id_categoria=4,
                nombre="Premium",
                descripcion="Vehículos de alta gama y lujo",
                tarifa_diaria=Decimal("12000.00"),
            ),
        ]
        db.bulk_save_objects(categorias)
        db.commit()
        print(f"✅ {len(categorias)} categorías cargadas")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar categorías: {e}")
        raise
    finally:
        db.close()


def seed_estados_vehiculo():
    """Poblar tabla de estados de vehículos"""
    print("\n📊 Cargando estados de vehículos...")
    db = SessionLocal()
    try:
        estados = [
            EstadoVehiculo(
                id_estado=1,
                nombre="Disponible",
                descripcion="Vehículo listo para alquilar",
            ),
            EstadoVehiculo(
                id_estado=2,
                nombre="Alquilado",
                descripcion="Vehículo actualmente en alquiler",
            ),
            EstadoVehiculo(
                id_estado=3,
                nombre="Mantenimiento",
                descripcion="Vehículo en reparación o servicio",
            ),
            EstadoVehiculo(
                id_estado=4,
                nombre="Reservado",
                descripcion="Vehículo con reserva confirmada",
            ),
            EstadoVehiculo(
                id_estado=5,
                nombre="Fuera de Servicio",
                descripcion="Vehículo no operativo",
            ),
        ]
        db.bulk_save_objects(estados)
        db.commit()
        print(f"✅ {len(estados)} estados cargados")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar estados: {e}")
        raise
    finally:
        db.close()


def seed_vehiculos():
    """Poblar tabla de vehículos"""
    print("\n🚗 Cargando vehículos...")
    db = SessionLocal()
    try:
        vehiculos = [
            Vehiculo(
                id_vehiculo=1,
                patente="ABC123",
                marca="Toyota",
                modelo="Corolla",
                anio=2022,
                id_categoria=2,
                id_estado=1,
                km_actual=15000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-10-15", "%Y-%m-%d").date(),
            ),
            Vehiculo(
                id_vehiculo=2,
                patente="DEF456",
                marca="Chevrolet",
                modelo="Onix",
                anio=2023,
                id_categoria=1,
                id_estado=1,
                km_actual=8000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-11-01", "%Y-%m-%d").date(),
            ),
            Vehiculo(
                id_vehiculo=3,
                patente="GHI789",
                marca="Ford",
                modelo="Ranger",
                anio=2021,
                id_categoria=3,
                id_estado=2,
                km_actual=45000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-09-20", "%Y-%m-%d").date(),
            ),
            Vehiculo(
                id_vehiculo=4,
                patente="JKL012",
                marca="Volkswagen",
                modelo="Vento",
                anio=2023,
                id_categoria=2,
                id_estado=1,
                km_actual=5000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-10-30", "%Y-%m-%d").date(),
            ),
            Vehiculo(
                id_vehiculo=5,
                patente="MNO345",
                marca="Audi",
                modelo="A4",
                anio=2024,
                id_categoria=4,
                id_estado=1,
                km_actual=2000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-11-10", "%Y-%m-%d").date(),
            ),
            Vehiculo(
                id_vehiculo=6,
                patente="PQR678",
                marca="Fiat",
                modelo="Cronos",
                anio=2022,
                id_categoria=1,
                id_estado=3,
                km_actual=32000,
                fecha_ultimo_mantenimiento=datetime.strptime("2025-11-15", "%Y-%m-%d").date(),
            ),
        ]
        db.bulk_save_objects(vehiculos)
        db.commit()
        print(f"✅ {len(vehiculos)} vehículos cargados")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar vehículos: {e}")
        raise
    finally:
        db.close()


def seed_reservas():
    """Poblar tabla de reservas"""
    print("\n📅 Cargando reservas...")
    db = SessionLocal()
    try:
        reservas = [
            Reserva(
                id_reserva=1,
                id_cliente=1,
                id_vehiculo=5,
                fecha_inicio=datetime.strptime("2025-11-25", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-30", "%Y-%m-%d").date(),
                estado="CONFIRMADA",
                monto_senia=Decimal("6000.00"),
                fecha_creacion=datetime.strptime("2025-11-10T10:30:00", "%Y-%m-%dT%H:%M:%S"),
            ),
            Reserva(
                id_reserva=2,
                id_cliente=2,
                id_vehiculo=2,
                fecha_inicio=datetime.strptime("2025-12-01", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-12-05", "%Y-%m-%d").date(),
                estado="PENDIENTE",
                monto_senia=Decimal("2000.00"),
                fecha_creacion=datetime.strptime("2025-11-12T14:15:00", "%Y-%m-%dT%H:%M:%S"),
            ),
        ]
        db.bulk_save_objects(reservas)
        db.commit()
        print(f"✅ {len(reservas)} reservas cargadas")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar reservas: {e}")
        raise
    finally:
        db.close()


def seed_alquileres():
    """Poblar tabla de alquileres"""
    print("\n🔑 Cargando alquileres...")
    db = SessionLocal()
    try:
        alquileres = [
            Alquiler(
                id_alquiler=1,
                id_cliente=1,
                id_vehiculo=3,
                id_empleado=1,
                id_reserva=None,
                fecha_inicio=datetime.strptime("2025-11-10", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-15", "%Y-%m-%d").date(),
                costo_base=Decimal("37500.00"),
                costo_total=Decimal("37500.00"),  # Se actualizará con las multas
                estado="FINALIZADO",
                observaciones="Cliente dejó el vehículo en perfectas condiciones",
            ),
            Alquiler(
                id_alquiler=2,
                id_cliente=2,
                id_vehiculo=1,
                id_empleado=2,
                id_reserva=None,
                fecha_inicio=datetime.strptime("2025-11-14", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-22", "%Y-%m-%d").date(),
                costo_base=Decimal("30000.00"),
                costo_total=Decimal("30000.00"),  # Se actualizará con las multas
                estado="EN_CURSO",
                observaciones="Incluye seguro adicional - $2500",
            ),
            Alquiler(
                id_alquiler=3,
                id_cliente=3,
                id_vehiculo=4,
                id_empleado=1,
                id_reserva=None,
                fecha_inicio=datetime.strptime("2025-11-05", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-08", "%Y-%m-%d").date(),
                costo_base=Decimal("15000.00"),
                costo_total=Decimal("15000.00"),
                estado="FINALIZADO",
                observaciones=None,
            ),
            Alquiler(
                id_alquiler=4,
                id_cliente=4,
                id_vehiculo=2,
                id_empleado=3,
                id_reserva=None,
                fecha_inicio=datetime.strptime("2025-11-25", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-30", "%Y-%m-%d").date(),
                costo_base=Decimal("17500.00"),
                costo_total=Decimal("17500.00"),
                estado="PENDIENTE",
                observaciones="Alquiler programado para fin de mes",
            ),
            Alquiler(
                id_alquiler=5,
                id_cliente=1,
                id_vehiculo=5,
                id_empleado=2,
                id_reserva=None,
                fecha_inicio=datetime.strptime("2025-12-01", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-12-10", "%Y-%m-%d").date(),
                costo_base=Decimal("108000.00"),
                costo_total=Decimal("108000.00"),
                estado="PENDIENTE",
                observaciones="Alquiler vehículo premium para viaje de negocios",
            ),
        ]
        db.bulk_save_objects(alquileres)
        db.commit()
        print(f"✅ {len(alquileres)} alquileres cargados")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar alquileres: {e}")
        raise
    finally:
        db.close()


def seed_multas_danios():
    """Poblar tabla de multas y daños"""
    print("\n⚠️  Cargando multas y daños...")
    db = SessionLocal()
    try:
        multas = [
            MultaDanio(
                id_multa_danio=1,
                id_alquiler=1,
                tipo="multa",
                descripcion="Multa de tránsito por exceso de velocidad",
                monto=Decimal("5000.00"),
                fecha_registro=datetime.strptime("2025-11-13T16:45:00", "%Y-%m-%dT%H:%M:%S"),
            ),
            MultaDanio(
                id_multa_danio=2,
                id_alquiler=2,
                tipo="daño",
                descripcion="Rayón en puerta trasera derecha",
                monto=Decimal("15000.00"),
                fecha_registro=datetime.strptime("2025-11-18T11:20:00", "%Y-%m-%dT%H:%M:%S"),
            ),
            MultaDanio(
                id_multa_danio=3,
                id_alquiler=2,
                tipo="multa",
                descripcion="Estacionamiento en lugar prohibido",
                monto=Decimal("3500.00"),
                fecha_registro=datetime.strptime("2025-11-17T09:15:00", "%Y-%m-%dT%H:%M:%S"),
            ),
            MultaDanio(
                id_multa_danio=4,
                id_alquiler=1,
                tipo="retraso",
                descripcion="Devolución con 2 días de retraso",
                monto=Decimal("7500.00"),
                fecha_registro=datetime.strptime("2025-11-17T14:30:00", "%Y-%m-%dT%H:%M:%S"),
            ),
        ]
        db.bulk_save_objects(multas)
        db.commit()
        
        # Actualizar costo_total de alquileres
        alquiler1 = db.query(Alquiler).filter(Alquiler.id_alquiler == 1).first()
        alquiler1.costo_total = Decimal("50000.00")  # 37500 + 5000 + 7500
        
        alquiler2 = db.query(Alquiler).filter(Alquiler.id_alquiler == 2).first()
        alquiler2.costo_total = Decimal("48500.00")  # 30000 + 15000 + 3500
        
        db.commit()
        print(f"✅ {len(multas)} multas/daños cargadas")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar multas/daños: {e}")
        raise
    finally:
        db.close()


def seed_mantenimientos():
    """Poblar tabla de mantenimientos"""
    print("\n🔧 Cargando mantenimientos...")
    db = SessionLocal()
    try:
        mantenimientos = [
            Mantenimiento(
                id_mantenimiento=1,
                id_vehiculo=6,
                fecha_inicio=datetime.strptime("2025-11-15", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-11-20", "%Y-%m-%d").date(),
                tipo="preventivo",
                descripcion="Service 30.000 km - cambio aceite y filtros",
                costo=Decimal("25000.00"),
                id_empleado=4,
            ),
            Mantenimiento(
                id_mantenimiento=2,
                id_vehiculo=3,
                fecha_inicio=datetime.strptime("2025-10-05", "%Y-%m-%d").date(),
                fecha_fin=datetime.strptime("2025-10-08", "%Y-%m-%d").date(),
                tipo="correctivo",
                descripcion="Reparación de frenos delanteros",
                costo=Decimal("18000.00"),
                id_empleado=4,
            ),
        ]
        db.bulk_save_objects(mantenimientos)
        db.commit()
        print(f"✅ {len(mantenimientos)} mantenimientos cargados")
    except Exception as e:
        db.rollback()
        print(f"❌ Error al cargar mantenimientos: {e}")
        raise
    finally:
        db.close()


def main():
    """Función principal para ejecutar el seed"""
    print("=" * 60)
    print("🌱 INICIANDO SEED DE BASE DE DATOS")
    print("=" * 60)
    
    try:
        # Limpiar base de datos
        clear_database()
        
        # Cargar datos en orden (respetando foreign keys)
        seed_clientes()
        seed_empleados()
        seed_categorias_vehiculo()
        seed_estados_vehiculo()
        seed_vehiculos()
        seed_reservas()
        seed_alquileres()
        seed_multas_danios()
        seed_mantenimientos()
        
        print("\n" + "=" * 60)
        print("✅ ¡SEED COMPLETADO EXITOSAMENTE!")
        print("=" * 60)
        print("\n📊 Resumen de datos cargados:")
        print("   • 4 Clientes")
        print("   • 4 Empleados")
        print("   • 4 Categorías de vehículos")
        print("   • 5 Estados de vehículos")
        print("   • 6 Vehículos")
        print("   • 2 Reservas")
        print("   • 5 Alquileres")
        print("   • 4 Multas/Daños")
        print("   • 2 Mantenimientos")
        print("\n🎉 La base de datos está lista para usar!")
        
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"❌ ERROR AL EJECUTAR SEED: {e}")
        print("=" * 60)
        sys.exit(1)


if __name__ == "__main__":
    main()
