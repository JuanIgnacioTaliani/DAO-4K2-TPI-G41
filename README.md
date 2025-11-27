# DAO - Sistema de Alquiler de Vehículos

### Prueba rápida
1. DOCKER y Backend:
   - Crear contenedores con desde la raiz del proyecto (no desde /backend) `docker compose up`
   - Esto levanta el servidor de base de datos y el backend
2. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

3 Seed de datos:

curl -X 'POST' \
  'http://localhost:8000/seed/?mode=extended' \
  -H 'accept: application/json' \
  -d ''

4. Abrir `http://localhost:5173`.

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