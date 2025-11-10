from datetime import date

from models.alquiler import Alquiler
from models.enums import TipoMulta


class Multa:
    def __init__(self, 
                 id_multa: int, 
                 fecha: date, 
                 tipo_multa: TipoMulta, 
                 costo: float, 
                 descripcion: str, 
                 alquiler: Alquiler):
        self._id_multa = id_multa
        self._fecha = fecha
        self._tipo_multa = tipo_multa
        self._costo = costo
        self._descripcion = descripcion
        self._alquiler = alquiler
    
    @property
    def id_multa(self) -> int:
        return self._id_multa
    
    @property
    def fecha(self) -> date:
        return self._fecha
    
    @fecha.setter
    def fecha(self, fecha: date):
        self._fecha = fecha
    
    @property
    def tipo_multa(self) -> TipoMulta:
        return self._tipo_multa
    
    @tipo_multa.setter
    def tipo_multa(self, tipo_multa: TipoMulta):
        self._tipo_multa = tipo_multa
    
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
    def alquiler(self) -> Alquiler:
        return self._alquiler
    
    @alquiler.setter
    def alquiler(self, alquiler: Alquiler):
        self._alquiler = alquiler