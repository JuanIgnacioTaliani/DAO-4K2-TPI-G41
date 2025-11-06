class Mantenimiento:
    def __init__(self, id_mantenimiento, fecha_inicio, fecha_fin, 
                 costo, descripcion, vehiculo):
        self._id_mantenimiento = id_mantenimiento
        self._fecha_inicio = fecha_inicio
        self._fecha_fin = fecha_fin
        self._costo = costo
        self._descripcion = descripcion
        self._vehiculo = vehiculo
    
    @property
    def id_mantenimiento(self):
        return self._id_mantenimiento

    @property
    def fecha_inicio(self):
        return self._fecha_inicio
    
    @fecha_inicio.setter
    def fecha_inicio(self, fecha_inicio):
        self._fecha_inicio = fecha_inicio
    
    @property
    def fecha_fin(self):
        return self._fecha_fin
    
    @fecha_fin.setter
    def fecha_fin(self, fecha_fin):
        self._fecha_fin = fecha_fin
    
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
    def vehiculo(self):
        return self._vehiculo
    
    @vehiculo.setter
    def vehiculo(self, vehiculo):
        self._vehiculo = vehiculo