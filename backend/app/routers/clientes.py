from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from difflib import SequenceMatcher
from sqlalchemy import or_

from ..database import get_db
from ..schemas import clientes as clienteSchema
from ..services import clientes as clientes_service
from ..models.clientes import Cliente
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


@router.get("/suggest", summary="Sugerencias de clientes por coincidencia aproximada")
def sugerir_clientes(
    query: str = Query(..., min_length=1, description="Texto parcial para buscar en nombre o apellido"),
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db),
):
    q = query.strip()
    if not q:
        return []
    pattern = f"%{q.lower()}%"
    # Buscar hasta 200 candidatos por substring
    candidatos = db.query(Cliente).filter(
        or_(
            Cliente.nombre.ilike(pattern),
            Cliente.apellido.ilike(pattern)
        )
    ).limit(200).all()
    # Si no hay candidatos por substring y la query es >=2 chars, traer primeros 50 para similitud general
    if not candidatos and len(q) >= 2:
        candidatos = db.query(Cliente).limit(50).all()

    scored = []
    q_lower = q.lower()
    for c in candidatos:
        full = f"{c.nombre} {c.apellido}".lower()
        nombre_lower = c.nombre.lower()
        apellido_lower = c.apellido.lower()
        # Scoring base
        ratio = SequenceMatcher(None, q_lower, full).ratio()
        # Boost si empieza con query
        starts_boost = 0.15 if (nombre_lower.startswith(q_lower) or apellido_lower.startswith(q_lower)) else 0.0
        # Boost si query está totalmente contenido en nombre/apellido
        contains_boost = 0.05 if (q_lower in nombre_lower or q_lower in apellido_lower) else 0.0
        score = ratio + starts_boost + contains_boost
        scored.append((score, ratio, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    seleccion = scored[:limit]
    return [
        {
            "id_cliente": c.id_cliente,
            "nombre": c.nombre,
            "apellido": c.apellido,
            "similaridad": round(ratio, 4),
        }
        for score, ratio, c in seleccion
    ]


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
