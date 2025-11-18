# ✅ Validación de Disponibilidad de Vehículos

## 📋 Funcionalidad Implementada

Se implementó un sistema completo de **validación de disponibilidad de vehículos** que verifica conflictos con alquileres existentes y reservas confirmadas antes de permitir crear o editar un alquiler.

---

## 🔧 Componentes Implementados

### 1. **Función `validar_disponibilidad_vehiculo()`**
Ubicación: `backend/app/routers/alquileres.py`

**Qué hace:**
- Verifica que el vehículo no tenga alquileres activos (PENDIENTE o EN_CURSO) en el período solicitado
- Verifica que el vehículo no tenga reservas confirmadas en el período solicitado
- Usa lógica de solapamiento de fechas: `(nuevo_inicio <= existente_fin) AND (nuevo_fin >= existente_inicio)`
- Excluye el alquiler actual cuando se está editando
- Excluye la reserva vinculada cuando el alquiler proviene de una reserva

**Parámetros:**
- `id_vehiculo`: ID del vehículo a verificar
- `fecha_inicio`: Fecha de inicio del período
- `fecha_fin`: Fecha de fin del período
- `id_alquiler_actual` (opcional): ID del alquiler que se está editando
- `id_reserva_vinculada` (opcional): ID de la reserva de la que viene el alquiler

**Excepciones:**
- Lanza `HTTPException 400` si encuentra conflictos
- Mensaje detallado indicando cantidad y fechas de conflictos

---

### 2. **Endpoint `GET /alquileres/verificar-disponibilidad/{id_vehiculo}`**

**Propósito:** Permitir al frontend verificar disponibilidad antes de intentar crear un alquiler.

**Parámetros query:**
- `fecha_inicio`: Fecha de inicio (formato: YYYY-MM-DD)
- `fecha_fin`: Fecha de fin (formato: YYYY-MM-DD)

**Ejemplo de uso:**
```bash
GET /alquileres/verificar-disponibilidad/1?fecha_inicio=2025-11-18&fecha_fin=2025-11-20
```

**Respuesta cuando está disponible:**
```json
{
  "disponible": true,
  "id_vehiculo": 1,
  "fecha_inicio": "2025-11-18",
  "fecha_fin": "2025-11-20",
  "conflictos": [],
  "mensaje": "Vehículo disponible"
}
```

**Respuesta cuando NO está disponible:**
```json
{
  "disponible": false,
  "id_vehiculo": 1,
  "fecha_inicio": "2025-11-18",
  "fecha_fin": "2025-11-20",
  "conflictos": [
    {
      "tipo": "alquiler",
      "id": 2,
      "fecha_inicio": "2025-11-14",
      "fecha_fin": "2025-11-22",
      "estado": "EN_CURSO"
    }
  ],
  "mensaje": "Vehículo no disponible. 1 conflicto(s) encontrado(s)."
}
```

---

### 3. **Endpoint `GET /alquileres/vehiculo/{id_vehiculo}/ocupacion`**

**Propósito:** Obtener todos los períodos en los que el vehículo está ocupado (útil para calendario visual).

**Ejemplo de uso:**
```bash
GET /alquileres/vehiculo/1/ocupacion
```

**Respuesta:**
```json
{
  "id_vehiculo": 1,
  "patente": "ABC123",
  "marca": "Toyota",
  "modelo": "Corolla",
  "total_periodos": 1,
  "periodos_ocupados": [
    {
      "tipo": "alquiler",
      "id": 2,
      "fecha_inicio": "2025-11-14",
      "fecha_fin": "2025-11-22",
      "estado": "EN_CURSO",
      "cliente_id": 2
    }
  ]
}
```

---

## 🧪 Pruebas Realizadas

### ✅ Prueba 1: Verificar disponibilidad sin conflictos
```bash
GET /alquileres/verificar-disponibilidad/3?fecha_inicio=2025-11-16&fecha_fin=2025-11-18
```
**Resultado:** ✅ PASS - Vehículo disponible

### ✅ Prueba 2: Verificar disponibilidad con conflicto
```bash
GET /alquileres/verificar-disponibilidad/1?fecha_inicio=2025-11-18&fecha_fin=2025-11-20
```
**Resultado:** ✅ PASS - Detectó conflicto con alquiler ID 2 (14/11 a 22/11)

### ✅ Prueba 3: Intentar crear alquiler con conflicto
```bash
POST /alquileres/
{
  "id_vehiculo": 1,
  "fecha_inicio": "2025-11-18",
  "fecha_fin": "2025-11-20",
  ...
}
```
**Resultado:** ✅ PASS - Rechazado con error 400
```json
{
  "detail": "El vehículo no está disponible en el período solicitado. Conflicto con 1 alquiler(es): 2025-11-14 a 2025-11-22"
}
```

### ✅ Prueba 4: Obtener períodos ocupados
```bash
GET /alquileres/vehiculo/1/ocupacion
```
**Resultado:** ✅ PASS - Retorna lista de períodos ocupados correctamente

---

## 📊 Lógica de Solapamiento de Fechas

```
Período existente:     |---------|
                       A         B

Casos de solapamiento detectados:

1. Inicio antes, fin durante:
   |---------|
   
2. Inicio durante, fin durante:
       |-----|
       
3. Inicio durante, fin después:
           |---------|
           
4. Cubre completamente:
   |-----------------|

Condición SQL:
nuevo_inicio <= existente_fin AND nuevo_fin >= existente_inicio
```

---

## 🎯 Estados Considerados

### Alquileres:
- ✅ **PENDIENTE** - Se valida (bloquea el vehículo)
- ✅ **EN_CURSO** - Se valida (bloquea el vehículo)
- ❌ **FINALIZADO** - NO se valida (no bloquea)
- ❌ **CANCELADO** - NO se valida (no bloquea)

### Reservas:
- ✅ **CONFIRMADA** - Se valida (bloquea el vehículo)
- ❌ **PENDIENTE** - NO se valida
- ❌ **CANCELADA** - NO se valida
- ❌ **VENCIDA** - NO se valida

---

## 🔄 Integración en Endpoints

### `POST /alquileres/` (Crear alquiler)
✅ Validación activa antes de crear

### `PUT /alquileres/{id}` (Actualizar alquiler)
✅ Validación activa solo si cambian fechas o vehículo

### Casos especiales manejados:
- ✅ Alquiler vinculado a reserva: Ignora la reserva vinculada
- ✅ Edición de alquiler: Ignora el alquiler que se está editando

---

## 📝 Próximos Pasos (Recomendados)

### Frontend:
1. ✅ Llamar a `verificar-disponibilidad` cuando el usuario seleccione vehículo y fechas
2. ✅ Mostrar mensaje de error si no está disponible
3. ✅ Deshabilitar botón de crear si hay conflicto
4. ⭐ Filtrar vehículos disponibles en el dropdown
5. ⭐ Mostrar calendario visual de ocupación

### Backend (Mejoras adicionales):
1. ⭐ Validar también en router de reservas
2. ⭐ Endpoint para listar vehículos disponibles en un período
3. ⭐ Considerar mantenimientos programados
4. ⭐ Auto-actualizar estado del vehículo (Disponible/Alquilado)

---

## 🚀 Cómo Probar

### 1. Cargar datos de prueba:
```bash
POST http://localhost:8000/seed/
```

### 2. Ver documentación Swagger:
```
http://localhost:8000/docs
```
Buscar la sección "Alquileres" y probar los nuevos endpoints.

### 3. Probar validación desde frontend:
- Intentar crear un alquiler para el vehículo 1 (Toyota Corolla)
- En el período del 18/11 al 20/11
- Debería rechazarse porque ya tiene un alquiler EN_CURSO

---

## ✅ Checklist de Implementación

- [x] Función de validación de disponibilidad
- [x] Integración en crear alquiler
- [x] Integración en actualizar alquiler
- [x] Endpoint de verificación de disponibilidad
- [x] Endpoint de consulta de ocupación
- [x] Manejo de reservas vinculadas
- [x] Manejo de ediciones (excluir alquiler actual)
- [x] Mensajes de error descriptivos
- [x] Pruebas unitarias manuales
- [x] Documentación

---

## 📌 Notas Importantes

1. **Alquileres FINALIZADOS no bloquean:** Un vehículo con alquileres finalizados se considera disponible.

2. **Reservas vs Alquileres:** Se validan ambos. Una reserva confirmada bloquea el vehículo igual que un alquiler activo.

3. **Conversión Reserva → Alquiler:** Cuando se crea un alquiler desde una reserva (`id_reserva` no null), la validación ignora esa reserva específica para permitir la conversión.

4. **Performance:** Las consultas usan índices en `id_vehiculo`, `estado` y fechas para mejor rendimiento.
