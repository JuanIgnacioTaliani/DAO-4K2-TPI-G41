from models.cliente import Empleado
from persistence.base_dao import BaseDAO


class EmpleadoDAO(BaseDAO):
    def agregar_empleado(self, empleado: Empleado):
        query = "INSERT INTO empleado (nombre, dni, cargo) VALUES (?, ?, ?)"
        parametros = (
            empleado.nombre, 
            empleado.dni,
            empleado.cargo
        )
        
        self.ejecutar_query(query, parametros)

    def obtener_empleado_por_id(self, empleado_id: int) -> Empleado | None:
        query = "SELECT * FROM empleado WHERE id_empleado = ? AND activo = 1"
        parametros = (empleado_id,)
        
        row = self.fetch_one(query, parametros)
        
        if row:
            return Empleado(
                id_empleado = row[0],
                nombre = row[1],
                dni = row[2],
                cargo = row[3],
            )
        
        return None

    def actualizar_empleado(self, empleado: Empleado):
        query = "UPDATE empleado SET nombre = ?, dni = ?, cargo = ? WHERE id_empleado = ?"
        parametros = (
            empleado.nombre,
            empleado.dni,
            empleado.cargo,
        )

        self.ejecutar_query(query, parametros)

    def eliminar_empleado(self, empleado_id: int):
        query = "UPDATE empleado SET activo = 0 WHERE id_empleado = ?"
        parametros = (empleado_id,)
        
        self.ejecutar_query(query, parametros)

    def listar_empleados(self) -> list[Empleado]:
        query = "SELECT * FROM empleado WHERE activo = 1"
        
        rows = self.fetch_all(query)
        
        empleados = [
            Empleado(
                id_empleado = row[0],
                nombre = row[1],
                dni = row[2],
                cargo = row[3]
            ) for row in rows
        ]

        return empleados