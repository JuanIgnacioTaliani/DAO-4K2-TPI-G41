from models.enums import CategoriaVehiculo, EstadoVehiculo, Marca


class Vehiculo:
    def __init__(self, 
                 id_vehiculo: int, 
                 patente: str,
                 marca: Marca, 
                 modelo: int, 
                 categoria: CategoriaVehiculo, 
                 costo_por_dia: float, 
                 estado_vehiculo: EstadoVehiculo):
        self._id_vehiculo = id_vehiculo
        self._patente = patente
        self._marca = marca
        self._modelo = modelo
        self._categoria = categoria
        self._costo_por_dia = costo_por_dia
        self._estado_vehiculo = estado_vehiculo

    @property
    def id_vehiculo(self) -> int:
        return self._id_vehiculo
    
    @property
    def patente(self) -> str:
        return self._patente
    
    @patente.setter
    def patente(self, patente: str):
        self._patente = patente
    
    @property
    def marca(self) -> Marca:
        return self._marca
    
    @marca.setter
    def marca(self, marca: Marca):
        self._marca = marca
    
    @property
    def modelo(self) -> int:
        return self._modelo
    
    @modelo.setter
    def modelo(self, modelo: int):
        self._modelo = modelo
    
    @property
    def categoria(self) -> CategoriaVehiculo:
        return self._categoria
    
    @categoria.setter
    def categoria(self, categoria: CategoriaVehiculo):
        self._categoria = categoria
    
    @property
    def costo_por_dia(self) -> float:
        return self._costo_por_dia
    
    @costo_por_dia.setter
    def costo_por_dia(self, costo_por_dia: float):
        self._costo_por_dia = costo_por_dia
    
    @property
    def estado_vehiculo(self) -> EstadoVehiculo:
        return self._estado_vehiculo
    
    @estado_vehiculo.setter
    def estado_vehiculo(self, estado_vehiculo: EstadoVehiculo):
        self._estado_vehiculo = estado_vehiculo