import datetime
from models.enums import TipoMulta
from models.multa import Multa
from persistence.alquiler_dao import AlquilerDAO
from persistence.base_dao import BaseDAO


class MultaDAO(BaseDAO):
    def agregar_multa(self, multa: Multa):
        query = "INSERT INTO multa (fecha, tipo_multa_id, costo, descripcion, alquiler_id) VALUES (?, ?, ?, ?, ?)"
        parametros = (
            multa.fecha,
            multa.tipo_multa.value,
            multa.costo,
            multa.descripcion,
            multa.alquiler.id_alquiler
        )

        self.ejecutar_query(query, parametros)
    
    def obtener_multa_por_id(self, id_multa: int) -> Multa | None:
        query = "SELECT * FROM multa WHERE id_multa = ? AND activo = 1"
        parametros = (id_multa,)

        row = self.fetch_one(query, parametros)
        
        if row:
            alquiler_dao = AlquilerDAO()
            alquiler = alquiler_dao.obtener_alquiler_por_id(row[5])

            return Multa(
                id_multa = row[0],
                fecha = datetime.fromisoformat(row[1]).date(),
                tipo_multa = TipoMulta(row[2]),
                costo = row[3],
                descripcion = row[4],
                alquiler = alquiler
            )
        
        return None

    def actualizar_multa(self, multa: Multa):
        query = "UPDATE multa SET fecha = ?, tipo_multa_id = ?, costo = ?, descripcion = ?, alquiler_id = ? WHERE id_multa = ?"
        parametros = (
            multa.fecha,
            multa.tipo_multa.value,
            multa.costo,
            multa.descripcion,
            multa.alquiler.id_alquiler,
            multa.id_multa
        )

        self.ejecutar_query(query, parametros)
    
    def eliminar_multa(self, id_multa: int):
        query = "UPDATE multa SET activo = 0 WHERE id_multa = ?"
        parametros = (id_multa,)

        self.ejecutar_query(query, parametros)
    
    def listar_multas(self) -> list[Multa]:
        query = "SELECT * FROM multa WHERE activo = 1"
        rows = self.fetch_all(query)

        alquiler_dao = AlquilerDAO()

        multas = [
            Multa(
                id_multa = row[0],
                fecha = datetime.fromisoformat(row[1]).date(),
                tipo_multa = TipoMulta(row[2]),
                costo = row[3],
                descripcion = row[4],
                alquiler = alquiler_dao.obtener_alquiler_por_id(row[5])
            ) for row in rows
        ]
        
        return multas