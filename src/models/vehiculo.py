class Vehiculo:
    def __init__(self, id_vehiculo, patente, marca, modelo, categoria, 
                 costo_por_dia, estado_vehiculo):
        self._id_vehiculo = id_vehiculo
        self._patente = patente
        self._marca = marca
        self._modelo = modelo
        self._categoria = categoria
        self._costo_por_dia = costo_por_dia
        self._estado_vehiculo = estado_vehiculo

    @property
    def id_vehiculo(self):
        return self._id_vehiculo
    
    @property
    def patente(self):
        return self._patente
    
    @patente.setter
    def patente(self, patente):
        self._patente = patente
    
    @property
    def marca(self):
        return self._marca
    
    @marca.setter
    def marca(self, marca):
        self._marca = marca
    
    @property
    def modelo(self):
        return self._modelo
    
    @modelo.setter
    def modelo(self, modelo):
        self._modelo = modelo
    
    @property
    def categoria(self):    
        return self._categoria
    
    @categoria.setter
    def categoria(self, categoria):
        self._categoria = categoria
    
    @property
    def costo_por_dia(self):
        return self._costo_por_dia
    
    @costo_por_dia.setter
    def costo_por_dia(self, costo_por_dia):
        self._costo_por_dia = costo_por_dia
    
    @property
    def estado_vehiculo(self):
        return self._estado_vehiculo
    
    @estado_vehiculo.setter
    def estado_vehiculo(self, estado_vehiculo):
        self._estado_vehiculo = estado_vehiculo