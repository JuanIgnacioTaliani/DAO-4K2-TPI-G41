class DomainNotFound(Exception):
    """Entidad no encontrada en la capa de dominio (ej: Vehículo, Empleado)."""
    pass


class BusinessRuleError(Exception):
    """Error por violación de regla de negocio (ej: alquiler activo, rango de fechas inválido)."""
    pass
