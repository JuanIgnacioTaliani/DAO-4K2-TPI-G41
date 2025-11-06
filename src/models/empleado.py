class Empleado:
    def __init__(self, id_empleado, nombre, dni, telefono, direccion):
        self._id_empleado = id_empleado
        self._nombre = nombre
        self._dni = dni
        self._telefono = telefono
        self._direccion = direccion
    
    @property
    def id_empleado(self):
        return self._id_empleado

    @property
    def nombre(self):
        return self._nombre
    
    @nombre.setter
    def nombre(self, nombre):
        self._nombre = nombre
    
    @property
    def dni(self):
        return self._dni
    
    @dni.setter
    def dni(self, dni):
        self._dni = dni
    
    @property
    def telefono(self):
        return self._telefono
    
    @telefono.setter
    def telefono(self, telefono):
        self._telefono = telefono
    
    @property
    def direccion(self):
        return self._direccion
    
    @direccion.setter
    def direccion(self, direccion):
        self._direccion = direccion