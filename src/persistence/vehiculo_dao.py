from models.enums import CategoriaVehiculo, EstadoVehiculo, Marca
from models.vehiculo import Vehiculo
from persistence.base_dao import BaseDAO


class VehiculoDAO(BaseDAO):
    def agregar_vehiculo(self, vehiculo: Vehiculo):
        query = "INSERT INTO vehiculo (patente, marca_id, modelo, categoria_id, costo_por_dia, estado_vehiculo_id) VALUES (?, ?, ?, ?, ?, ?)"
        parametros = (
            vehiculo.patente,
            vehiculo.marca.value,
            vehiculo.modelo,
            vehiculo.categoria.value,
            vehiculo.costo_por_dia,
            vehiculo.estado_vehiculo.value
        )

        self.ejecutar_query(query, parametros)
    
    def obtener_vehiculo_por_id(self, id_vehiculo: int) -> Vehiculo | None:
        query = "SELECT * FROM vehiculo WHERE id_vehiculo = ? WHERE activo = 1"
        parametros = (id_vehiculo,)

        row = self.fetch_one(query, parametros)
        
        if row:
            return Vehiculo(
                id_vehiculo = row[0],
                patente = row[1],
                marca = Marca(row[2]),
                modelo = row[3],
                categoria = CategoriaVehiculo(row[4]),
                costo_por_dia = row[5],
                estado = EstadoVehiculo(row[6])
            )
        
        return None

    def actualizar_vehiculo(self, vehiculo: Vehiculo):
        query = "UPDATE vehiculo SET patente = ?, marca_id = ?, modelo = ?, categoria_id = ?, costo_por_dia = ?, estado_vehiculo_id = ? WHERE id_vehiculo = ?"
        parametros = (
            vehiculo.patente,
            vehiculo.marca.value,
            vehiculo.modelo,
            vehiculo.categoria.value,
            vehiculo.costo_por_dia,
            vehiculo.estado_vehiculo.value,
            vehiculo.id_vehiculo
        )

        self.ejecutar_query(query, parametros)
    
    def eliminar_vehiculo(self, id_vehiculo: int):
        query = "UPDATE vehiculo SET activo = 0 WHERE id_vehiculo = ?"
        parametros = (id_vehiculo,)

        self.ejecutar_query(query, parametros)
    
    def listar_vehiculos(self) -> list[Vehiculo]:
        query = "SELECT * FROM vehiculo WHERE activo = 1"

        rows = self.fetch_all(query)
        
        vehiculos = [
            Vehiculo(
                id_vehiculo = row[0],
                patente = row[1],
                marca = Marca(row[2]),
                modelo = row[3],
                categoria = CategoriaVehiculo(row[4]),
                costo_por_dia = row[5],
                estado = EstadoVehiculo(row[6])
            ) for row in rows
        ]

        return vehiculos