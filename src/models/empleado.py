class Empleado:
    def __init__(self, 
                 id_empleado: int, 
                 nombre: str, 
                 dni: int, 
                 cargo: str):
        self._id_empleado = id_empleado
        self._nombre = nombre
        self._dni = dni
        self._cargo = cargo
    
    @property
    def id_empleado(self) -> int:
        return self._id_empleado
    
    @property
    def nombre(self) -> str:
        return self._nombre
    
    @nombre.setter
    def nombre(self, nombre: str):
        self._nombre = nombre
    
    @property
    def dni(self) -> int:
        return self._dni
    
    @dni.setter
    def dni(self, dni: int):
        self._dni = dni
    
    @property
    def cargo(self) -> str:
        return self._cargo
    
    @cargo.setter
    def cargo(self, cargo: str):
        self._cargo = cargo