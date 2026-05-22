# backend/app/routers/recepciones.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Recepcion, Producto
from ..schemas import RecepcionCreate
from ..auth import require_admin

router = APIRouter()


@router.post('/')
def registrar_recepcion(rec: RecepcionCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    # Verificar que el producto existe
    producto = db.query(Producto).filter(Producto.id == rec.producto_id).first()
    if not producto:
        raise HTTPException(404, 'Producto no encontrado')
    
    db_rec = Recepcion(**rec.dict())
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)
    
    return {
        'ok': True,
        'mensaje': f'Recepción registrada: {rec.cantidad} unidades de {producto.nombre}'
    }


@router.get('/producto/{producto_id}')
def recepciones_por_producto(producto_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    recepciones = db.query(Recepcion).filter(Recepcion.producto_id == producto_id).all()
    return recepciones


@router.get('/')
def listar_recepciones(db: Session = Depends(get_db), admin=Depends(require_admin)):
    recepciones = db.query(Recepcion).order_by(Recepcion.fecha_recepcion.desc()).all()
    return recepciones