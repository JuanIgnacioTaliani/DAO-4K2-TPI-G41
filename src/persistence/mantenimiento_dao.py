import datetime
from models.mantenimiento import Mantenimiento
from persistence.base_dao import BaseDAO
from persistence.vehiculo_dao import VehiculoDAO


class MantenimientoDAO(BaseDAO):
    def agregar_mantenimiento(self, mantenimiento: Mantenimiento):
        query = "INSERT INTO mantenimiento (fecha_inicio, fecha_fin, costo, descripcion, vehiculo_id) VALUES (?, ?, ?, ?, ?)"
        parametros = (
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.costo,
            mantenimiento.descripcion,
            mantenimiento.vehiculo.id_vehiculo
        )

        self.ejecutar_query(query, parametros)
    
    def obtener_mantenimiento_por_id(self, id_mantenimiento: int) -> Mantenimiento | None:
        query = "SELECT * FROM mantenimiento WHERE id_mantenimiento = ?"
        parametros = (id_mantenimiento,)

        row = self.fetch_one(query, parametros)
        
        if row:
            vehiculo_dao = VehiculoDAO()
            vehiculo = vehiculo_dao.obtener_vehiculo_por_id(row[5])

            return Mantenimiento(
                id_mantenimiento = row[0], 
                fecha_inicio = datetime.fromisoformat(row[1]).date(),
                fecha_fin = datetime.fromisoformat(row[2]).date(),
                costo = row[3],
                descripcion = row[4],
                vehiculo = vehiculo
            )
        
        return None

    def actualizar_mantenimiento(self, mantenimiento: Mantenimiento):
        query = "UPDATE mantenimiento SET fecha_inicio = ?, fecha_fin = ?, costo = ?, descripcion = ?, vehiculo_id = ? WHERE id_mantenimiento = ?"
        parametros = (
            mantenimiento.fecha_inicio,
            mantenimiento.fecha_fin,
            mantenimiento.costo,
            mantenimiento.descripcion,
            mantenimiento.vehiculo.id_vehiculo,
            mantenimiento.id_mantenimiento
        )

        self.ejecutar_query(query, parametros)
    
    def eliminar_mantenimiento(self, id_mantenimiento: int):
        query = "UPDATE mantenimiento SET activo = 0 WHERE id_mantenimiento = ?"
        parametros = (id_mantenimiento,)

        self.ejecutar_query(query, parametros)
    
    def listar_mantenimientos(self) -> list[Mantenimiento]:
        query = "SELECT * FROM mantenimiento WHERE activo = 1"

        rows = self.fetch_all(query)

        vehiculo_dao = VehiculoDAO()

        mantenimientos = [
            Mantenimiento(
                id_mantenimiento = row[0], 
                fecha_inicio = datetime.fromisoformat(row[1]).date(),
                fecha_fin = datetime.fromisoformat(row[2]).date(),
                costo = row[3],
                descripcion = row[4],
                vehiculo = vehiculo_dao.obtener_vehiculo_por_id(row[5])
            ) for row in rows
        ]
        
        return mantenimientos