from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import clientes as clienteModel
from ..schemas import clientes as clienteSchema

router = APIRouter(prefix="/clientes", tags=["clientes"])


@router.post("/", response_model=clienteSchema.ClienteOut, status_code=status.HTTP_201_CREATED)
def crear_cliente(cliente_in: clienteSchema.ClienteCreate, db: Session = Depends(get_db)):
    existing = db.query(clienteModel.Cliente).filter(clienteModel.Cliente.dni == cliente_in.dni).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un cliente con ese DNI")

    cliente = clienteModel.Cliente(**cliente_in.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.get("/", response_model=List[clienteSchema.ClienteOut])
def listar_clientes(db: Session = Depends(get_db)):
    return db.query(clienteModel.Cliente).all()


@router.get("/{cliente_id}", response_model=clienteSchema.ClienteOut)
def obtener_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(clienteModel.Cliente).get(cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


@router.put("/{cliente_id}", response_model=clienteSchema.ClienteOut)
def actualizar_cliente(cliente_id: int, cliente_in: clienteSchema.ClienteUpdate, db: Session = Depends(get_db)):
    cliente = db.query(clienteModel.Cliente).get(cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    data = cliente_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(cliente, field, value)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = db.query(clienteModel.Cliente).get(cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    db.delete(cliente)
    db.commit()
    return None
