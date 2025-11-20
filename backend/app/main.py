from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.services.mantenimientos import actualizar_vehiculos_disponibles_por_mantenimientos

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError
import time

from .database import Base, engine
from app import models
from .routers import clientes, empleados, vehiculos, categorias_vehiculo, estados_vehiculo, alquileres, multas_danios, mantenimientos, seed

app = FastAPI(title="DAO - Sistema de Alquiler de Vehículos")

# CORS para React
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # o ["*"] mientras desarrollás
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Intentar conectarse a la DB y crear las tablas con reintentos."""
    max_tries = 10
    wait_seconds = 3

    for intento in range(1, max_tries + 1):
        try:
            print(f"[startup] Intento {intento} de conectar a la DB y crear tablas...")
            Base.metadata.create_all(bind=engine)
            print("[startup] Tablas creadas / verificadas OK.")
            break
        except OperationalError as e:
            print(f"[startup] No se pudo conectar a la DB: {e}")
            if intento == max_tries:
                print("[startup] Máximo de intentos alcanzado. Abortando.")
                raise
            time.sleep(wait_seconds)


app.include_router(clientes.router)
app.include_router(empleados.router)
app.include_router(vehiculos.router)
app.include_router(categorias_vehiculo.router)
app.include_router(estados_vehiculo.router)
app.include_router(alquileres.router)
app.include_router(multas_danios.router)
app.include_router(mantenimientos.router)
app.include_router(seed.router)

@app.get("/")
def root():
    return {"message": "API de Alquiler de Vehículos - OK"}

def job_actualizar_vehiculos():
    db = SessionLocal()
    try:
        cantidad = actualizar_vehiculos_disponibles_por_mantenimientos(db)
        print(f"Vehículos actualizados a 'Disponible': {cantidad}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(job_actualizar_vehiculos, 'cron', hour=0, minute=0)
scheduler.start()
