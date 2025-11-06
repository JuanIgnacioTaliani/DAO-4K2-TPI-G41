class Marca:
    def __init__(self, id_marca, nombre):
        self._id_marca = id_marca
        self._nombre = nombre
    
    @property
    def id_marca(self):
        return self._id_marca
    
    @property
    def nombre(self):
        return self._nombre
    
    @nombre.setter
    def nombre(self, nombre):
        self._nombre = nombre