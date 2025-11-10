from datetime import date

from models.cliente import Cliente
from models.empleado import Empleado
from models.enums import EstadoAlquiler
from models.vehiculo import Vehiculo

class Alquiler:
    def __init__(self, 
                 id_alquiler: str, 
                 fecha_inicio: date, 
                 fecha_fin: date, 
                 costo_total: float, 
                 importe_final: float, 
                 km_recorridos: float, 
                 cliente: Cliente, 
                 vehiculo: Vehiculo, 
                 empleado: Empleado,
                 estado_alquiler: EstadoAlquiler, 
                 fecha_reserva: date):
        self._id_alquiler = id_alquiler
        self._fecha_inicio = fecha_inicio
        self._fecha_fin = fecha_fin
        self._costo_total = costo_total
        self._importe_final = importe_final
        self._km_recorridos = km_recorridos
        self._cliente = cliente
        self._vehiculo = vehiculo
        self._empleado = empleado
        self._estado_alquiler = estado_alquiler
        self._fecha_reserva = fecha_reserva
    
    @property
    def id_alquiler(self) -> str:
        return self._id_alquiler
    
    @property
    def fecha_inicio(self) -> date:
        return self._fecha_inicio
    
    @fecha_inicio.setter
    def fecha_inicio(self, value: date):
        self._fecha_inicio = value
    
    @property
    def fecha_fin(self) -> date:
        return self._fecha_fin
    
    @fecha_fin.setter
    def fecha_fin(self, value: date):
        self._fecha_fin = value
    
    @property
    def costo_total(self) -> float:
        return self._costo_total
    
    @costo_total.setter
    def costo_total(self, value: float):
        self._costo_total = value
    
    @property
    def importe_final(self) -> float:
        return self._importe_final
    
    @importe_final.setter
    def importe_final(self, value: float):
        self._importe_final = value
    
    @property
    def km_recorridos(self) -> float:
        return self._km_recorridos
    
    @km_recorridos.setter
    def km_recorridos(self, value: float):
        self._km_recorridos = value
    
    @property
    def cliente(self) -> Cliente:
        return self._cliente
    
    @cliente.setter
    def cliente(self, value: Cliente):
        self._cliente = value

    @property
    def vehiculo(self) -> Vehiculo:
        return self._vehiculo
    
    @vehiculo.setter
    def vehiculo(self, value: Vehiculo):
        self._vehiculo = value
    
    @property
    def empleado(self) -> Empleado:
        return self._empleado
    
    @empleado.setter
    def empleado(self, value: Empleado):
        self._empleado = value
    
    @property
    def estado_alquiler(self) -> EstadoAlquiler:
        return self._estado_alquiler
    
    @estado_alquiler.setter
    def estado_alquiler(self, value: EstadoAlquiler):
        self._estado_alquiler = value
    
    @property
    def fecha_reserva(self) -> date:
        return self._fecha_reserva
    
    @fecha_reserva.setter
    def fecha_reserva(self, value: date):
        self._fecha_reserva = value