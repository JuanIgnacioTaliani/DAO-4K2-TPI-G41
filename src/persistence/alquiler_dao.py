from datetime import datetime
from models.alquiler import Alquiler
from models.enums import EstadoAlquiler
from persistence.base_dao import BaseDAO
from persistence.cliente_dao import ClienteDAO
from persistence.empleado_dao import EmpleadoDAO
from persistence.vehiculo_dao import VehiculoDAO


class AlquilerDAO(BaseDAO):
    def agregar_alquiler(self, alquiler: Alquiler):
        query = "INSERT INTO alquiler (fecha_inicio, fecha_fin, costo_total, importe_final, km_recorridos, cliente_id, vehiculo_id, empleado_id, estado_alquiler_id, fecha_reserva) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        parametros = (
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.importe_final,
            alquiler.km_recorridos,
            alquiler.cliente.id_cliente,
            alquiler.vehiculo.id_vehiculo,
            alquiler.empleado.id_empleado,
            alquiler.estado_alquiler,
            alquiler.fecha_reserva
        )

        self.ejecutar_query(query, parametros)
    
    def obtener_alquiler_por_id(self, id_alquiler: int) -> Alquiler | None:
        query = "SELECT * FROM alquiler WHERE id_alquiler = ? AND activo = 1"
        parametros = (id_alquiler,)

        row = self.fetch_one(query, parametros)
        
        if row:
            cliente_dao = ClienteDAO()
            vehiculo_dao = VehiculoDAO()
            empleado_dao = EmpleadoDAO()

            

            return Alquiler(
                id_alquiler = row[0],
                fecha_inicio = datetime.fromisoformat(row[1]).date(),
                fecha_fin = datetime.fromisoformat(row[2]).date() if row[2] else None,
                costo_total = row[3],
                importe_final = row[4],
                km_recorridos = row[5],
                cliente = cliente_dao.obtener_cliente_por_id(row[6]),
                vehiculo = vehiculo_dao.obtener_vehiculo_por_id(row[7]),
                empleado = empleado_dao.obtener_empleado_por_id(row[8]),
                estado_alquiler = EstadoAlquiler(row[9]),
                fecha_reserva = datetime.fromisoformat(row[10]).date() if row[10] else None
            )
        
        return None
    
    def actualizar_alquiler(self, alquiler: Alquiler):
        query = "UPDATE alquiler SET fecha_inicio = ?, fecha_fin = ?, costo_total = ?, importe_final = ?, km_recorridos = ?, cliente_id = ?, vehiculo_id = ?, empleado_id = ?, estado_alquiler_id = ?, fecha_reserva = ? WHERE id_alquiler = ?"
        parametros = (
            alquiler.fecha_inicio,
            alquiler.fecha_fin,
            alquiler.costo_total,
            alquiler.importe_final,
            alquiler.km_recorridos,
            alquiler.cliente.id_cliente,
            alquiler.vehiculo.id_vehiculo,
            alquiler.empleado.id_empleado,
            alquiler.estado_alquiler.value,
            alquiler.fecha_reserva,
            alquiler.id_alquiler
        )

        self.ejecutar_query(query, parametros)
    
    def eliminar_alquiler(self, id_alquiler: int):
        query = "UPDATE alquiler SET activo = 0 WHERE id_alquiler = ?"
        parametros = (id_alquiler,)

        self.ejecutar_query(query, parametros)
    
    def listar_alquileres(self) -> list[Alquiler]:
        query = "SELECT * FROM alquiler WHERE activo = 1"
        rows = self.fetch_all(query)

        cliente_dao = ClienteDAO()
        vehiculo_dao = VehiculoDAO()
        empleado_dao = EmpleadoDAO()

        alquileres = [
            Alquiler(
                id_alquiler = row[0],
                fecha_inicio = datetime.fromisoformat(row[1]).date(),
                fecha_fin = datetime.fromisoformat(row[2]).date() if row[2] else None,
                costo_total = row[3],
                importe_final = row[4],
                km_recorridos = row[5],
                cliente = cliente_dao.obtener_cliente_por_id(row[6]),
                vehiculo = vehiculo_dao.obtener_vehiculo_por_id(row[7]),
                empleado = empleado_dao.obtener_empleado_por_id(row[8]),
                estado_alquiler = EstadoAlquiler(row[9]),
                fecha_reserva = datetime.fromisoformat(row[10]).date() if row[10] else None
            ) for row in rows
        ]
        
        return alquileres