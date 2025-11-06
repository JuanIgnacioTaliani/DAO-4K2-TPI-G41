class Alquiler:
    def __init__(self, id_alquiler, fecha_inicio, fecha_fin, costo_total, 
                 importe_final, km_recorridos, cliente, vehiculo, empleado,
                 estado_alquiler, fecha_reserva):
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
    def id_alquiler(self):
        return self._id_alquiler
    
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
    def costo_total(self):
        return self._costo_total
    
    @costo_total.setter
    def costo_total(self, costo_total):
        self._costo_total = costo_total
    
    @property
    def importe_final(self):
        return self._importe_final
    
    @importe_final.setter
    def importe_final(self, importe_final):
        self._importe_final = importe_final
    
    @property
    def km_recorridos(self):
        return self._km_recorridos
    
    @km_recorridos.setter
    def km_recorridos(self, km_recorridos):
        self._km_recorridos = km_recorridos
    
    @property
    def cliente(self):
        return self._cliente
    
    @cliente.setter
    def cliente(self, cliente):
        self._cliente = cliente
    
    @property
    def vehiculo(self): 
        return self._vehiculo
    
    @vehiculo.setter
    def vehiculo(self, vehiculo):
        self._vehiculo = vehiculo
    
    @property
    def empleado(self):
        return self._empleado
    
    @empleado.setter
    def empleado(self, empleado):
        self._empleado = empleado
    
    @property
    def estado_alquiler(self):
        return self._estado_alquiler
    
    @estado_alquiler.setter
    def estado_alquiler(self, estado_alquiler):
        self._estado_alquiler = estado_alquiler
    
    @property
    def fecha_reserva(self):
        return self._fecha_reserva
    
    @fecha_reserva.setter
    def fecha_reserva(self, fecha_reserva):
        self._fecha_reserva = fecha_reserva