class Cliente:
    def __init__(self, 
                 id_cliente: int, 
                 nombre: str, 
                 dni: int, 
                 telefono: int, 
                 direccion: str):
        self._id_cliente = id_cliente
        self._nombre = nombre
        self._dni = dni
        self._telefono = telefono
        self._direccion = direccion
    
    @property
    def id_cliente(self) -> int:
        return self._id_cliente

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
    def telefono(self) -> int:
        return self._telefono
    
    @telefono.setter
    def telefono(self, telefono: int):
        self._telefono = telefono
    
    @property
    def direccion(self) -> str:
        return self._direccion
    
    @direccion.setter
    def direccion(self, direccion: str):
        self._direccion = direccion