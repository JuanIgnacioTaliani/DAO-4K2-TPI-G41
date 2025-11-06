class EstadoVehiculo:
    def __init__(self, id_estado, nombre):
        self._id_estado = id_estado
        self._nombre = nombre
    
    @property
    def id_estado(self):
        return self._id_estado
    
    @property
    def nombre(self):
        return self._nombre
    
    @nombre.setter
    def nombre(self, nombre):
        self._nombre = nombre