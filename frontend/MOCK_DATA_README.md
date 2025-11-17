# Datos Mockeados - Documentación

## 📋 Descripción

Este proyecto incluye un sistema de datos mockeados que permite desarrollar y probar la aplicación **sin necesidad de tener el backend funcionando**.

## 🔧 Configuración

### Activar/Desactivar Mock

En cada archivo API (`src/api/*.js`), encontrarás esta variable al inicio:

```javascript
const USE_MOCK = true; // Cambia a false para usar la API real
```

- **`USE_MOCK = true`**: Usa datos simulados en memoria
- **`USE_MOCK = false`**: Conecta con el backend real en `http://localhost:8000`

### Archivos Modificados

Todos los archivos API ahora soportan modo mock:

- ✅ `alquileresApi.js`
- ✅ `clientesApi.js`
- ✅ `empleadosApi.js`
- ✅ `vehiculosApi.js`
- ✅ `categoriasVehiculoApi.js`
- ✅ `estadosVehiculoApi.js`

## 📊 Datos Disponibles

### Clientes (4 registros)
```javascript
- Juan Pérez (DNI: 12345678)
- María González (DNI: 87654321)
- Carlos López (DNI: 11223344)
- Ana Martínez (DNI: 44332211)
```

### Empleados (4 registros)
```javascript
- Roberto Sánchez (Vendedor)
- Laura Fernández (Gerente)
- Diego Rodríguez (Vendedor)
- Sofía Ramírez (Asistente)
```

### Vehículos (6 registros)
```javascript
- ABC123 - Toyota Corolla 2022
- DEF456 - Chevrolet Onix 2023
- GHI789 - Ford Ranger 2021 (Alquilado)
- JKL012 - Volkswagen Vento 2023
- MNO345 - Audi A4 2024
- PQR678 - Fiat Cronos 2022 (En mantenimiento)
```

### Categorías de Vehículo (4 registros)
```javascript
1. Económico - $3,500/día
2. Sedan - $5,000/día
3. SUV - $7,500/día
4. Premium - $12,000/día
```

### Estados de Vehículo (5 registros)
```javascript
1. Disponible
2. Alquilado
3. Mantenimiento
4. Reservado
5. Fuera de Servicio
```

### Alquileres (4 registros)
```javascript
- Alquiler #1: Juan Pérez - Ford Ranger (FINALIZADO)
- Alquiler #2: María González - Toyota Corolla (EN_CURSO)
- Alquiler #3: Carlos López - VW Vento (FINALIZADO)
- Alquiler #4: Ana Martínez - Chevrolet Onix (CANCELADO)
```

### Reservas (2 registros)
```javascript
- Reserva #1: Juan Pérez - Audi A4 (25/11 - 30/11) - CONFIRMADA
- Reserva #2: María González - Chevrolet Onix (01/12 - 05/12) - PENDIENTE
```

## 🎯 Ejemplo de Uso: Crear un Alquiler

Con los datos mockeados puedes:

1. **Abrir la página de Alquileres** (`/alquileres`)
2. **Seleccionar datos del formulario**:
   - Cliente: Juan Pérez
   - Vehículo: Toyota Corolla
   - Empleado: Roberto Sánchez
   - Fecha Inicio: 2025-11-20
   - Fecha Fin: 2025-11-25
   - Costo Base: 25000
   - Costo Total: 25000
   - Estado: EN_CURSO

3. **Hacer clic en "Crear alquiler"**

El alquiler se creará **en memoria** con un ID único (>100) y aparecerá en la tabla inmediatamente.

## ✨ Características del Sistema Mock

### ✅ Operaciones Soportadas
- **GET**: Obtener todos los registros
- **POST**: Crear nuevos registros (con IDs autogenerados)
- **PUT**: Actualizar registros existentes
- **DELETE**: Eliminar registros

### ✅ Funcionalidades
- **Delay simulado** de 500ms para imitar latencia de red
- **IDs autogenerados** comenzando desde 101
- **Persistencia en memoria** durante la sesión
- **Validaciones básicas** (registro no encontrado, etc.)

### ⚠️ Limitaciones
- Los datos se **pierden al recargar la página**
- No hay persistencia en base de datos
- No hay validaciones complejas de negocio
- Los cambios solo afectan la sesión actual

## 🔄 Cambiar a API Real

Cuando el backend esté listo:

1. Abre cada archivo en `src/api/`
2. Cambia `const USE_MOCK = true;` a `const USE_MOCK = false;`
3. Asegúrate de que el backend esté corriendo en `http://localhost:8000`
4. ¡Listo! La aplicación usará datos reales

## 📝 Modelo de Datos de Alquiler

```python
class Alquiler:
    id_alquiler: int (PK)
    id_cliente: int (FK -> Cliente)
    id_vehiculo: int (FK -> Vehiculo)
    id_empleado: int (FK -> Empleado)
    id_reserva: int (FK -> Reserva, nullable)
    fecha_inicio: Date
    fecha_fin: Date
    costo_base: Decimal(10,2)
    costo_total: Decimal(10,2)
    estado: String(30)  # EN_CURSO, FINALIZADO, CANCELADO
    observaciones: String(300)
```

## 🐛 Debug

Si necesitas verificar los datos en cualquier momento:

```javascript
// En la consola del navegador:
import { mockAlquileres } from './api/mockData';
console.log(mockAlquileres);
```

---

**Nota**: Este sistema de mock es ideal para desarrollo y testing sin depender del backend. Una vez que la API esté lista, simplemente cambia `USE_MOCK = false` en todos los archivos.
