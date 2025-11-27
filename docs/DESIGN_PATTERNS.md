# Patrones de Diseño Aplicados

Este documento resume los patrones de diseño incorporados en el proyecto, su propósito, ubicación de archivos y cómo favorecen la mantenibilidad y extensibilidad del sistema.

## Resumen General

Se añadieron tres patrones clásicos:

1. Singleton para la gestión de la conexión y fábrica de sesiones de la base de datos.
2. Repository para centralizar y abstraer el acceso a datos de alquileres por cliente.
3. Strategy para la agregación flexible de reportes por período (mes / trimestre) sin condicionales extensos.

Además se incluyen dos recomendaciones futuras (Unit of Work y Builder/Factory) para evolucionar la arquitectura.

---

## 1. Singleton: Conexión a Base de Datos

**Archivo:** `backend/app/database.py`

**Clase:** `_DatabaseSingleton`

**Motivación:** Garantiza una única instancia del `engine` y `SessionLocal`, evitando recreaciones innecesarias y abriendo la puerta a añadir métricas, configuración dinámica o instrumentación futura sin cambiar todas las importaciones.

**Uso Actual:** La dependencia FastAPI `get_db()` obtiene sesiones desde `Database.SessionLocal()`.

**Antes:** Variables globales `engine` y `SessionLocal`.
**Después:** Encapsulación en un objeto singleton (`Database`).

---

## 2. Repository: Acceso a Alquileres por Cliente

**Archivo:** `backend/app/repositories/alquiler_repository.py`

**Función Principal:** `fetch_alquileres_by_cliente(db, client_id, page, size, desde, hasta)`

**Motivación:** Separar la construcción de la consulta SQLAlchemy y sus filtros de la lógica de servicio/reporting, reduciendo duplicación y facilitando pruebas unitarias (mock del repositorio) sin acoplarse a la estructura interna de los modelos.

**Impacto:** El servicio de reportes (`backend/app/services/reports.py`) delega la obtención de filas sin reconstruir manualmente la query.

---

## 3. Strategy: Agregación de Reportes por Período

**Archivo:** `backend/app/services/period_strategies.py`

**Clases:**

- `PeriodAggregationStrategy` (Abstracta)
- `MonthAggregationStrategy`
- `QuarterAggregationStrategy`

**Factory:** `get_period_strategy(periodo: str)` devuelve la implementación adecuada.

**Motivación:** Evitar múltiples bloques `if/elif` en el servicio para cada tipo de período y permitir añadir nuevas granularidades (por semana, semestre, año) sin modificar lógica existente: solo se agrega una nueva clase y se ajusta el factory.

**Integración:** La función `get_alquileres_por_periodo` en `backend/app/services/reports.py` invoca la estrategia y devuelve la agregación resultante.

---

## Ubicaciones Clave

| Componente                 | Patrón                                  | Archivo                                           |
| -------------------------- | --------------------------------------- | ------------------------------------------------- |
| Base de datos              | Singleton                               | `backend/app/database.py`                         |
| Reporte alquileres cliente | Repository                              | `backend/app/repositories/alquiler_repository.py` |
| Reporte períodos           | Strategy                                | `backend/app/services/period_strategies.py`       |
| Servicio reportes          | Orquestador (usa Repository & Strategy) | `backend/app/services/reports.py`                 |

---

## Beneficios Obtenidos

- **Menor acoplamiento:** Servicios consumen interfaces (funciones o estrategias) sin conocer detalles de construcción de consultas.
- **Extensibilidad clara:** Para nuevos períodos solo se implementa otra estrategia.
- **Mantenibilidad:** Cambios en la capa de persistencia (nuevas columnas, índices, hints) se manejan en un único punto (Repository).
- **Organización:** Patrón Singleton reduce dispersión de lógica de conexión y facilita centralizar próximas optimizaciones.

---

## Posibles Mejoras Futuras

1. **Unit of Work Pattern:** Coordinar múltiples operaciones (crear alquiler + multas + mantenimiento) en una única transacción explícita con commit/rollback controlado, facilitando atomicidad y pruebas.
2. **Builder / Factory para Seeds y Entidades Complejas:** Encapsular la creación de entidades compuestas (vehículo con estado inicial, alquiler con costos calculados) para eliminar lógica de armado dispersa y permitir variaciones (escenarios de prueba, generación masiva) de forma controlada.

---

## Cómo Extender

- **Nuevo período (ej. semana):** Crear `WeekAggregationStrategy` en `period_strategies.py` e incluirlo en `get_period_strategy`.
- **Otro reporte por cliente:** Añadir nueva función repository (ej. `fetch_multas_by_cliente`) y reutilizar patrón de transformación en servicio.
- **Migrar a Unit of Work:** Implementar clase `UnitOfWork` que gestione `db = Database.SessionLocal()` y métodos `commit()`, `rollback()`, pasando UoW a services que agrupen operaciones.

---

## Verificación Rápida

1. Revisar importaciones: `reports.py` ahora importa `fetch_alquileres_by_cliente` y `get_period_strategy`.
2. Confirmar instanciación única: `Database = _DatabaseSingleton()` se crea una vez y se reutiliza.
3. Probar extensibilidad: Añadir estrategia de prueba mínima y verificar no romper contratos existentes.

---

## Conclusión

La incorporación de Singleton, Repository y Strategy mejora la separación de responsabilidades y prepara la base para escalar la lógica de negocio sin incurrir en deuda técnica. Las recomendaciones futuras apuntan a reforzar consistencia transaccional y claridad en la construcción de objetos complejos.
