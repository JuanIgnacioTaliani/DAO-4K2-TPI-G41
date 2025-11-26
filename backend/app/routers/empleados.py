from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import empleados as empleadoSchema
from ..services.exceptions import BusinessRuleError, DomainNotFound
from ..services import empleados as empleado_service


router = APIRouter(prefix="/empleados", tags=["empleados"])


@router.post("/", response_model=empleadoSchema.EmpleadoOut, status_code=status.HTTP_201_CREATED)
def crear_empleado(empleado_in: empleadoSchema.EmpleadoCreate, db: Session = Depends(get_db)):
    try:
        return empleado_service.crear_empleado(db, empleado_in)
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al crear el empleado")


@router.get("/", response_model=List[empleadoSchema.EmpleadoOut])
def listar_empleados(
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    dni: Optional[str] = None,
    legajo: Optional[str] = None,
    email: Optional[str] = None,
    telefono: Optional[str] = None,
    rol: Optional[str] = None,
    estado: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    return empleado_service.listar_empleados(
        db,
        nombre=nombre,
        apellido=apellido,
        dni=dni,
        legajo=legajo,
        email=email,
        telefono=telefono,
        rol=rol,
        estado=estado,
    )


@router.get("/{empleado_id}", response_model=empleadoSchema.EmpleadoOut)
def obtener_empleado(empleado_id: int, db: Session = Depends(get_db)):
    try:
        return empleado_service.obtener_empleado_por_id(db, empleado_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al obtener el empleado")


@router.put("/{empleado_id}", response_model=empleadoSchema.EmpleadoOut)
def actualizar_empleado(empleado_id: int, empleado_in: empleadoSchema.EmpleadoUpdate, db: Session = Depends(get_db)):
    try:
        return empleado_service.actualizar_empleado(db, empleado_id, empleado_in)
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al actualizar el empleado")


@router.delete("/{empleado_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_empleado(empleado_id: int, db: Session = Depends(get_db)):
    try:
        empleado_service.eliminar_empleado(db, empleado_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=e)
