from persistence.conexion_db import ConexionDB


class BaseDAO:
    def __init__(self):
        self._conexion = ConexionDB().obtener_conexion()
    
    def ejecutar_query(self, query: str, parametros: tuple = ()):
        cursor = self._conexion.cursor()
        try:
            cursor.execute(query, parametros)
            self._conexion.commit()
        except Exception as e:
            self._conexion.rollback()
            raise e
        finally:
            cursor.close()
        
    def fetch_one(self, query: str, parametros: tuple = ()):
        cursor = self._conexion.cursor()
        try:
            cursor.execute(query, parametros)
            resultado = cursor.fetchone()
            return resultado
        finally:
            cursor.close()
    
    def fetch_all(self, query: str, parametros: tuple = ()):
        cursor = self._conexion.cursor()
        try:
            cursor.execute(query, parametros)
            resultados = cursor.fetchall()
            return resultados
        finally:
            cursor.close()