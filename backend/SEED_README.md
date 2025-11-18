# Script de Seed para Base de Datos

Este script carga datos de prueba (MOCK) en la base de datos MySQL.

## 📦 Datos que se cargan

- **4 Clientes** (Juan Pérez, María González, Carlos López, Ana Martínez)
- **4 Empleados** (Roberto Sánchez, Laura Fernández, Diego Rodríguez, Sofía Ramírez)
- **4 Categorías de vehículos** (Económico, Sedan, SUV, Premium)
- **5 Estados de vehículos** (Disponible, Alquilado, Mantenimiento, Reservado, Fuera de Servicio)
- **6 Vehículos** (Toyota Corolla, Chevrolet Onix, Ford Ranger, VW Vento, Audi A4, Fiat Cronos)
- **2 Reservas**
- **5 Alquileres**
- **4 Multas/Daños**
- **2 Mantenimientos**

**Total: 36 registros**

## 🚀 Cómo ejecutar el seed

### ✨ Opción 1: Usando el Endpoint `/seed` (RECOMENDADO - Más fácil)

Simplemente accede a:

```
POST http://localhost:8000/seed/
```

**Desde el navegador:**
- Abre la documentación interactiva: http://localhost:8000/docs
- Busca el endpoint `POST /seed/`
- Haz clic en "Try it out"
- Haz clic en "Execute"

**Desde la terminal (PowerShell):**
```powershell
Invoke-WebRequest -Method POST -Uri http://localhost:8000/seed/
```

**Desde la terminal (curl):**
```bash
curl -X POST http://localhost:8000/seed/
```

**Respuesta exitosa:**
```json
{
  "message": "Base de datos poblada exitosamente con datos de prueba",
  "success": true,
  "datos_cargados": {
    "clientes": 4,
    "empleados": 4,
    "categorias": 4,
    "estados": 5,
    "vehiculos": 6,
    "reservas": 2,
    "alquileres": 5,
    "multas_danios": 4,
    "mantenimientos": 2
  },
  "total_registros": 36
}
```

### 🐳 Opción 2: Usando el script Python en Docker

```bash
# 1. Copiar el script al contenedor (solo la primera vez)
docker cp backend/seed_database.py dao_backend:/app/seed_database.py

# 2. Ejecutar el script
docker exec -it dao_backend python seed_database.py
```

## 🗑️ Limpiar la base de datos

Para eliminar todos los datos sin cargar nuevos:

```
DELETE http://localhost:8000/seed/
```

## ⚠️ Advertencias

- **El endpoint ELIMINA todos los datos existentes** antes de cargar los nuevos
- Los IDs son fijos (1, 2, 3, etc.) para mantener consistencia con los datos MOCK
- Se recomienda ejecutar solo en entornos de desarrollo/testing
- **NO usar en producción**

## 🔄 Re-ejecutar el seed

Puedes ejecutar el endpoint `/seed` todas las veces que quieras. Cada vez:
1. Limpia completamente la base de datos
2. Carga todos los datos MOCK nuevamente

## 📝 Notas

- Los costos totales de algunos alquileres incluyen multas/daños
- Las fechas de algunos alquileres están configuradas para mostrar diferentes estados (PENDIENTE, EN_CURSO, FINALIZADO)
- Los datos coinciden exactamente con los MOCK del frontend para facilitar el desarrollo
- El endpoint está documentado en Swagger: http://localhost:8000/docs
