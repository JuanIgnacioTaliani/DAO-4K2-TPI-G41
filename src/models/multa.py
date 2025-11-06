class Multa:
    def __init__(self, id_multa, fecha, tipo_multa, costo, descripcion, alquiler):
        self._id_multa = id_multa
        self._fecha = fecha
        self._tipo_multa = tipo_multa
        self._costo = costo
        self._descripcion = descripcion
        self._alquiler = alquiler
    
    @property
    def id_multa(self):
        return self._id_multa
    
    @property
    def fecha(self):
        return self._fecha
    
    @fecha.setter
    def fecha(self, fecha):
        self._fecha = fecha
    
    @property
    def tipo_multa(self):
        return self._tipo_multa
    
    @tipo_multa.setter
    def tipo_multa(self, tipo_multa):
        self._tipo_multa = tipo_multa
    
    @property
    def costo(self):
        return self._costo
    
    @costo.setter
    def costo(self, costo):
        self._costo = costo
    
    @property
    def descripcion(self):
        return self._descripcion
    
    @descripcion.setter
    def descripcion(self, descripcion):
        self._descripcion = descripcion
    
    @property
    def alquiler(self):
        return self._alquiler
    
    @alquiler.setter
    def alquiler(self, alquiler):
        self._alquiler = alquiler