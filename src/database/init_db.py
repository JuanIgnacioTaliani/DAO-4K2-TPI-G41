from persistence.conexion_db import ConexionDB
from models.enums import *


def crear_tablas():
    with open("src/database/schema.sql", "r") as archivo_sql:
        schema = archivo_sql.read()
    
    with ConexionDB().obtener_conexion() as conexion:
        # Crear un cursor
        cursor = conexion.cursor()

        # Ejecutar el script SQL para crear las tablas
        cursor.executescript(schema)

        # Confirmar la transacción
        conexion.commit()

def insertar_enum(nombre_tabla: str, enum_class):
    with ConexionDB() as conexion:
        cursor = conexion.cursor()
        for item in enum_class:
            cursor.execute(
                f"INSERT OR IGNORE INTO {nombre_tabla} (nombre) VALUES (?)", 
                (item.name)
            )
        conexion.commit()

def inicializar_bd():
    crear_tablas()
    insertar_enum("categoria_vehiculo", CategoriaVehiculo)
    insertar_enum("estado_alquiler", EstadoAlquiler)
    insertar_enum("estado_vehiculo", EstadoVehiculo)
    insertar_enum("marca", Marca)
    insertar_enum("tipo_multa", TipoMulta)

if __name__ == "__main__":
    inicializar_bd()