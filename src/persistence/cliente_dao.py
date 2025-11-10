from models.cliente import Cliente
from persistence.base_dao import BaseDAO


class ClienteDAO(BaseDAO):
    def agregar_cliente(self, cliente: Cliente):
        query = "INSERT INTO cliente (nombre, dni, telefono, direccion) VALUES (?, ?, ?, ?)"
        parametros = (
            cliente.nombre, 
            cliente.dni,
            cliente.telefono,
            cliente.direccion
        )
        
        self.ejecutar_query(query, parametros)
    
    def obtener_cliente_por_id(self, cliente_id: int) -> Cliente | None:
        query = "SELECT * FROM cliente WHERE id_cliente = ? AND activo = 1"
        parametros = (cliente_id,)
        
        row = self.fetch_one(query, parametros)
        
        if row:
            return Cliente(
                id_cliente = row[0],
                nombre = row[1],
                dni = row[2],
                telefono = row[3],
                direccion = row[4]
            )
        
        return None
    
    def actualizar_cliente(self, cliente: Cliente):
        query = "UPDATE cliente SET nombre = ?, dni = ?, telefono = ?, direccion = ? WHERE id_cliente = ?"
        parametros = (
            cliente.nombre,
            cliente.dni,
            cliente.telefono,
            cliente.direccion,
            cliente.id_cliente
        )

        self.ejecutar_query(query, parametros)
    
    def eliminar_cliente(self, cliente_id: int):
        query = "UPDATE cliente SET activo = 0 WHERE id_cliente = ?"
        parametros = (cliente_id,)
        
        self.ejecutar_query(query, parametros)
    
    def listar_clientes(self) -> list[Cliente]:
        query = "SELECT * FROM cliente WHERE activo = 1"
        
        rows = self.fetch_all(query)
        clientes = [
            Cliente(
                id_cliente = row[0],
                nombre = row[1],
                dni = row[2],
                telefono = row[3],
                direccion = row[4]
            ) for row in rows
        ]
        
        return clientes