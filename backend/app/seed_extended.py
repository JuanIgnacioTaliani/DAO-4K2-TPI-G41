from datetime import datetime, timedelta
from decimal import Decimal
import random
from typing import Dict, List, Tuple

from .models import (
    Cliente,
    Empleado,
    CategoriaVehiculo,
    EstadoVehiculo,
    Vehiculo,
    Alquiler,
    MultaDanio,
    Mantenimiento,
)

RANDOM_SEED = 42


def generate_clientes(n: int = 50) -> List[Cliente]:
    nombres = [
        "Juan","María","Carlos","Ana","Luis","Laura","Miguel","Sofía","Pedro","Lucía",
        "Andrés","Valeria","Jorge","Florencia","Ricardo","Paula","Sebastián","Julieta","Diego","Romina",
        "Gustavo","Natalia","Hernán","Camila","Federico","Agustina","Matías","Noelia","Leonardo","Melina",
        "Martín","Verónica","Pablo","Gabriela","Emiliano","Bianca","Facundo","Carolina","Tomás","Micaela",
        "Raúl","Daniela","Alberto","Cecilia","Gonzalo","Viviana","Iván","Jimena","Oscar","Daniel"
    ]
    clientes = []
    for i in range(n):
        nombre = nombres[i % len(nombres)]
        apellido = f"Apellido{i+1}"
        dni = f"{10000000 + i:08d}"
        clientes.append(
            Cliente(
                id_cliente=i+1,
                nombre=nombre,
                apellido=apellido,
                dni=dni,
                telefono=f"351-{4000000 + i}",
                email=f"{nombre.lower()}.{apellido.lower()}@mail.com",
                direccion=f"Calle Falsa {i+1}, Córdoba",
                estado=True,
            )
        )
    return clientes


def generate_empleados(n: int = 12) -> List[Empleado]:
    roles = ["Vendedor", "Gerente", "Asistente", "Soporte"]
    empleados = []
    for i in range(n):
        empleados.append(
            Empleado(
                id_empleado=i+1,
                nombre=f"Empleado{i+1}",
                apellido=f"Corp{i+1}",
                dni=f"{30000000 + i}",
                legajo=f"EMP{i+1:03d}",
                email=f"empleado{i+1}@empresa.com",
                telefono=f"351-{4500000 + i}",
                rol=roles[i % len(roles)],
                estado=True,
            )
        )
    return empleados


def generate_categorias() -> List[CategoriaVehiculo]:
    return [
        CategoriaVehiculo(id_categoria=1, nombre="Económico", descripcion="Compactos", tarifa_diaria=Decimal("3500.00")),
        CategoriaVehiculo(id_categoria=2, nombre="Sedan", descripcion="Medianos", tarifa_diaria=Decimal("5000.00")),
        CategoriaVehiculo(id_categoria=3, nombre="SUV", descripcion="Utilitarios", tarifa_diaria=Decimal("7500.00")),
        CategoriaVehiculo(id_categoria=4, nombre="Premium", descripcion="Alta gama", tarifa_diaria=Decimal("12000.00")),
    ]


def generate_estados() -> List[EstadoVehiculo]:
    return [
        EstadoVehiculo(id_estado=1, nombre="Disponible", descripcion="Listo"),
        EstadoVehiculo(id_estado=2, nombre="Alquilado", descripcion="En alquiler"),
        EstadoVehiculo(id_estado=3, nombre="Mantenimiento", descripcion="Servicio"),
        EstadoVehiculo(id_estado=4, nombre="Fuera de Servicio", descripcion="No operativo"),
    ]


def generate_vehiculos(n: int = 40) -> List[Vehiculo]:
    marcas_modelos = [
        ("Toyota", "Corolla"),("Chevrolet","Onix"),("Ford","Ranger"),("Volkswagen","Vento"),("Audi","A4"),("Fiat","Cronos"),
        ("Renault","Kangoo"),("Peugeot","208"),("Nissan","Kicks"),("Honda","Civic"),("BMW","320i"),("Hyundai","Creta"),
        ("Kia","Rio"),("Jeep","Renegade"),("Mercedes","Clase C"),("Subaru","Forester"),("Citroen","C4"),("Volvo","XC40"),
        ("Tesla","Model 3"),("Mazda","CX-5"),("Seat","Ibiza"),("Skoda","Octavia"),("Mini","Cooper"),("Suzuki","Swift")
    ]
    vehiculos = []
    for i in range(n):
        marca, modelo = marcas_modelos[i % len(marcas_modelos)]
        categoria_id = (i % 4) + 1
        estado_id = 1  # disponible por defecto
        if i % 15 == 0:
            estado_id = 3  # mantenimiento
        elif i % 10 == 0:
            estado_id = 2  # alquilado
        vehiculos.append(
            Vehiculo(
                id_vehiculo=i+1,
                patente=f"{chr(65 + (i % 26))}{chr(65 + ((i+5) % 26))}{chr(65 + ((i+10) % 26))}{100 + i:03d}",
                marca=marca,
                modelo=modelo,
                anio=2020 + (i % 5),
                id_categoria=categoria_id,
                id_estado=estado_id,
                km_actual=5000 + i * 750,
                fecha_ultimo_mantenimiento=datetime(2025, 10, (i % 28) + 1).date(),
            )
        )
    return vehiculos


def _random_date_in_month(year: int, month: int) -> datetime:
    start = datetime(year, month, 1)
    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)
    delta_days = (end - start).days
    day = random.randint(1, delta_days - 1)
    return start + timedelta(days=day)


def generate_alquileres(
    year: int,
    months: List[int],
    clientes_count: int,
    vehiculos_count: int,
    empleados_count: int,
    categoria_tarifas: Dict[int, Decimal],
    rentals_per_month: int = 12,
) -> List[Alquiler]:
    alquileres = []
    id_counter = 1
    for m in months:
        for _ in range(rentals_per_month):
            fecha_ini = _random_date_in_month(year, m)
            dur = random.randint(3, 10)
            fecha_fin = fecha_ini + timedelta(days=dur)
            id_cliente = random.randint(1, clientes_count)
            id_vehiculo = random.randint(1, vehiculos_count)
            id_empleado = random.randint(1, empleados_count)
            categoria_id = ((id_vehiculo - 1) % 4) + 1
            costo_base = categoria_tarifas[categoria_id] * Decimal(dur)
            estado = random.choice(["FINALIZADO", "EN_CURSO", "PENDIENTE"])
            alquileres.append(
                Alquiler(
                    id_alquiler=id_counter,
                    id_cliente=id_cliente,
                    id_vehiculo=id_vehiculo,
                    id_empleado=id_empleado,
                    fecha_inicio=fecha_ini.date(),
                    fecha_fin=fecha_fin.date(),
                    costo_base=costo_base,
                    costo_total=costo_base,  # se ajustará con multas
                    estado=estado,
                    observaciones=None,
                )
            )
            id_counter += 1
    return alquileres


def generate_multas_para_alquileres(alquileres: List[Alquiler]) -> List[MultaDanio]:
    multas = []
    multa_id = 1
    for a in alquileres:
        if random.random() < 0.30:  # 30% de los alquileres tienen algún evento
            eventos = random.randint(1, 2)
            for _ in range(eventos):
                tipo = random.choice(["multa", "daño", "retraso"])
                monto = Decimal(random.choice([1500, 2500, 3500, 5000, 7500, 12000]))
                fecha_registro = datetime.combine(a.fecha_inicio, datetime.min.time()) + timedelta(hours=random.randint(8, 18))
                multas.append(
                    MultaDanio(
                        id_multa_danio=multa_id,
                        id_alquiler=a.id_alquiler,
                        tipo=tipo,
                        descripcion=f"{tipo.capitalize()} generada automáticamente",
                        monto=monto,
                        fecha_registro=fecha_registro,
                    )
                )
                a.costo_total = a.costo_total + monto
                multa_id += 1
    return multas


def generate_mantenimientos(vehiculos_count: int, empleados_count: int) -> List[Mantenimiento]:
    mantenimientos = []
    mid = 1
    for v_id in range(1, vehiculos_count + 1):
        if v_id % 11 == 0:  # algunos vehículos reciben mantenimiento
            fecha_ini = datetime(2025, 11, (v_id % 25) + 1).date()
            fecha_fin = fecha_ini + timedelta(days=random.randint(2, 5))
            tipo = random.choice(["preventivo", "correctivo"])
            costo = Decimal(random.choice([12000, 18000, 25000, 30000]))
            id_emp = random.randint(1, empleados_count)
            mantenimientos.append(
                Mantenimiento(
                    id_mantenimiento=mid,
                    id_vehiculo=v_id,
                    fecha_inicio=fecha_ini,
                    fecha_fin=fecha_fin,
                    tipo=tipo,
                    descripcion=f"Mantenimiento {tipo} programado",
                    costo=costo,
                    id_empleado=id_emp,
                )
            )
            mid += 1
    return mantenimientos


def generate_extended_seed() -> Tuple[List[Cliente], List[Empleado], List[CategoriaVehiculo], List[EstadoVehiculo], List[Vehiculo], List[Alquiler], List[MultaDanio], List[Mantenimiento]]:
    random.seed(RANDOM_SEED)
    clientes = generate_clientes()
    empleados = generate_empleados()
    categorias = generate_categorias()
    estados = generate_estados()
    vehiculos = generate_vehiculos()
    tarifas = {c.id_categoria: c.tarifa_diaria for c in categorias}
    alquileres = generate_alquileres(2025, list(range(1, 12)), len(clientes), len(vehiculos), len(empleados), tarifas, rentals_per_month=14)
    multas = generate_multas_para_alquileres(alquileres)
    mantenimientos = generate_mantenimientos(len(vehiculos), len(empleados))
    return clientes, empleados, categorias, estados, vehiculos, alquileres, multas, mantenimientos
