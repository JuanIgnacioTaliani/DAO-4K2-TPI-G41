from datetime import date

from models.vehiculo import Vehiculo


class Mantenimiento:
    def __init__(self, 
                 id_mantenimiento: int, 
                 fecha_inicio: date, 
                 fecha_fin: date, 
                 costo: float, 
                 descripcion: str, 
                 vehiculo: Vehiculo):
        self._id_mantenimiento = id_mantenimiento
        self._fecha_inicio = fecha_inicio
        self._fecha_fin = fecha_fin
        self._costo = costo
        self._descripcion = descripcion
        self._vehiculo = vehiculo
    
    @property
    def id_mantenimiento(self) -> int:
        return self._id_mantenimiento

    @property
    def fecha_inicio(self) -> date:
        return self._fecha_inicio
    
    @fecha_inicio.setter
    def fecha_inicio(self, fecha_inicio: date):
        self._fecha_inicio = fecha_inicio
    
    @property
    def fecha_fin(self) -> date:
        return self._fecha_fin
    
    @fecha_fin.setter
    def fecha_fin(self, fecha_fin: date):
        self._fecha_fin = fecha_fin
    
    @property
    def costo(self) -> float:
        return self._costo
    
    @costo.setter
    def costo(self, costo: float):
        self._costo = costo
    
    @property
    def descripcion(self) -> str:
        return self._descripcion
    
    @descripcion.setter
    def descripcion(self, descripcion: str):
        self._descripcion = descripcion
    
    @property
    def vehiculo(self) -> Vehiculo:
        return self._vehiculo
    
    @vehiculo.setter
    def vehiculo(self, vehiculo: Vehiculo):
        self._vehiculo = vehiculo