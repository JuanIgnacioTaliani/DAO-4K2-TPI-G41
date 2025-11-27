# DAO - Sistema de Alquiler de Vehículos

## Reportes

### Endpoints

- `GET /reports/alquileres-por-cliente?client_id=&page=&size=`
  - Devuelve lista paginada de alquileres para un cliente.
- `GET /reports/vehiculos-mas-alquilados?desde=&hasta=&limit=`
  - Devuelve top de vehículos ordenados por cantidad de alquileres en el rango.
- `GET /reports/alquileres-por-periodo?desde=&hasta=&periodo=mes|trimestre`
  - Devuelve agregación de cantidad de alquileres por mes o trimestre.
- `GET /reports/facturacion-mensual?anio=`
  - Devuelve la suma de montos por mes del año indicado.

### Frontend

- Página `Reportes`: ruta `/reportes` en `frontend/src/App.jsx`.
- Requiere `VITE_API_URL` apuntando a la API (ej. `http://localhost:8000`).
- Librerías agregadas: `chart.js`, `react-chartjs-2`.

### Prueba rápida

1. Backend:
   - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
3. Abrir `http://localhost:5173` y navegar a `/reportes`.

### Seed de datos

El endpoint de seed ahora soporta dos modos:

- Básico: dataset pequeño original.
- Extendido (por defecto): dataset grande con datos más realistas (50 clientes, 12 empleados, 40 vehículos, ~150 alquileres con multas y mantenimientos).

#### Usar modo extendido (predeterminado)

`POST /seed` → carga dataset grande.

#### Usar modo básico

`POST /seed?mode=basic`

#### Respuesta

Incluye `mode`, conteo por entidad y `total_registros`.

#### Ejemplo cURL

```bash
curl -X POST http://localhost:8000/seed
curl -X POST "http://localhost:8000/seed?mode=basic"
```

### Impacto en reportes

- Más dispersion temporal: alquileres generados mensualmente (enero a noviembre 2025) mejoran gráficos de período y facturación.
- Top vehículos muestra barras comparativas más claras por volumen.
- Multas y daños (~30% de alquileres) afectan costos finales para facturación mensual.
