import sqlite3


class ConexionDB:
    # Aplicar el patrón Singleton
    _instancia = None

    def __new__(cls, db_nombre = "database/alquiler_vehiculos.db"):
        if cls._instancia is None:
            cls._instancia = super(ConexionDB, cls).__new__(cls)
            cls._instancia._db_nombre = db_nombre
            cls._instancia._conexion = None
        
        # Retornar la instancia única
        return cls._instancia

    def __enter__(self):
        return self.obtener_conexion()
    
    def __exit__(self, exc_type, exc_value, traceback):
        self.desconectar()

    # Conectarse a la base de datos
    def conectar(self):
        if not self._conexion:
            self._conexion = sqlite3.connect(self._db_nombre)

    # Desconectarse de la base de datos
    def desconectar(self):
        if self._conexion:
            self._conexion.close()
            self._conexion = None

    # Obtener la conexión a la base de datos
    def obtener_conexion(self):
        self.conectar()
        return self._conexion