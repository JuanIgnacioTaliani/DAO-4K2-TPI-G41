from enum import Enum


class CategoriaVehiculo(Enum):
    MOTOCICLETA = 1
    COMPACTO = 2
    FAMILIAR = 3
    DEPORTIVO = 4
    SUV = 5
    PICKUP = 6
    UTILITARIO = 7

class EstadoAlquiler(Enum):
    RESERVADO = 1
    ACTIVO = 2
    FINALIZADO = 3
    CANCELADO = 4
    VENCIDO = 5
    PENDIENTE_DE_PAGO = 6

class EstadoVehiculo(Enum):
    DISPONIBLE = 1
    ALQUILADO = 2
    EN_MANTENIMIENTO = 3
    RESERVADO = 4
    FUERA_DE_SERVICIO = 5

class Marca(Enum):
    CHEVROLET = 1
    FORD = 2
    FIAT = 3
    VOLKSWAGEN = 4
    PEUGEOT = 5
    RENAULT = 6
    TOYOTA = 7
    HONDA = 8
    NISSAN = 9
    CITROEN = 10
    JEEP = 11
    HYUNDAI = 12
    KIA = 13
    MERCEDES_BENZ = 14
    BMW = 15
    YAMAHA = 16
    BAJAJ = 17
    MOTOMEL = 18
    ZANELLA = 19
    SUZUKI = 20

class TipoMulta(Enum):
    RETRASO_ENTREGA = 1
    DAÑO_MENOR = 2
    DAÑO_GRAVE = 3
    PÉRDIDA_DOCUMENTACIÓN = 4
    MULTA_EXTERNA = 5