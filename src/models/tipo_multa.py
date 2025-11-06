class TipoMulta:
    def __init__(self, id_tipo, descripcion):
        self._id_tipo = id_tipo
        self._descripcion = descripcion
    
    @property
    def id_tipo(self):
        return self._id_tipo
    
    @property
    def descripcion(self):
        return self._descripcion
    
    @descripcion.setter
    def descripcion(self, descripcion):
        self._descripcion = descripcion