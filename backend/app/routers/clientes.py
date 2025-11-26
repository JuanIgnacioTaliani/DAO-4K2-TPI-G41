from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import clientes as clienteSchema
from ..services import clientes as clientes_service
from ..services.exceptions import DomainNotFound, BusinessRuleError

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.post("/", response_model=clienteSchema.ClienteOut, status_code=status.HTTP_201_CREATED)
def crear_cliente(cliente_in: clienteSchema.ClienteCreate,db: Session = Depends(get_db)):
    try:
        return clientes_service.crear_cliente(db, cliente_in)
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al crear el cliente")


@router.get("/", response_model=List[clienteSchema.ClienteOut])
def listar_clientes(
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    dni: Optional[str] = None,
    telefono: Optional[str] = None,
    email: Optional[str] = None,
    direccion: Optional[str] = None,
    estado: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    return clientes_service.listar_clientes(
        nombre=nombre,
        apellido=apellido,
        dni=dni,
        telefono=telefono,
        email=email,
        direccion=direccion,
        estado=estado,
        db=db
    )


@router.get("/{cliente_id}", response_model=clienteSchema.ClienteOut)
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    try:
        return clientes_service.obtener_cliente_por_id(db, cliente_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al obtener el cliente")


@router.put("/{cliente_id}", response_model=clienteSchema.ClienteOut)
def actualizar_cliente(cliente_id: int, cliente_in: clienteSchema.ClienteUpdate, db: Session = Depends(get_db)):
    try:
        return clientes_service.actualizar_cliente(db, cliente_id, cliente_in)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al actualizar el cliente")


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    try:
        clientes_service.eliminar_cliente(db, cliente_id)
    except DomainNotFound as e:
        raise HTTPException(status_code=404, detail=str(e))
    except BusinessRuleError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Error interno al eliminar el cliente")
