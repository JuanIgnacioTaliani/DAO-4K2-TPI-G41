class Cliente:
    def __init__(self, id_cliente, nombre, dni, cargo):
        self._id_cliente = id_cliente
        self._nombre = nombre
        self._dni = dni
        self._cargo = cargo
    
    @property
    def id_cliente(self):
        return self._id_cliente
    
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
    def cargo(self):
        return self._cargo
    
    @cargo.setter
    def cargo(self, cargo):
        self._cargo = cargo