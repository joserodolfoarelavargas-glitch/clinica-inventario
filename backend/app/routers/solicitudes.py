# backend/app/routers/solicitudes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import Solicitud, Producto
from ..schemas import SolicitudCreate, SolicitudOut
from ..auth import get_current_user, require_admin
from ..business import calcular_stock_actual, calcular_prioridad

router = APIRouter()


def _enrich(sol: Solicitud, db: Session):
    """Enriquece la solicitud con nombres de producto y usuario"""
    producto = db.query(Producto).filter(Producto.id == sol.producto_id).first()
    return {
        'id': sol.id,
        'producto_id': sol.producto_id,
        'usuario_id': sol.usuario_id,
        'cantidad': sol.cantidad,
        'estado': sol.estado,
        'prioridad': sol.prioridad,
        'comentarios': sol.comentarios,
        'fecha_solicitud': sol.fecha_solicitud,
        'fecha_entrega': sol.fecha_entrega,
        'producto_nombre': producto.nombre if producto else '',
        'usuario_nombre': sol.usuario.nombre if sol.usuario else ''
    }


@router.post('/', response_model=SolicitudOut)
def crear_solicitud(sol: SolicitudCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Verificar que el producto existe
    prod = db.query(Producto).filter(Producto.id == sol.producto_id).first()
    if not prod:
        raise HTTPException(404, 'Producto no encontrado')
    
    # Calcular prioridad basada en stock actual
    stock = calcular_stock_actual(db, sol.producto_id)
    prioridad = calcular_prioridad(stock, prod.consumo_diario)
    
    db_sol = Solicitud(
        producto_id=sol.producto_id,
        usuario_id=user.id,
        cantidad=sol.cantidad,
        comentarios=sol.comentarios,
        estado='Pendiente',
        prioridad=prioridad
    )
    
    db.add(db_sol)
    db.commit()
    db.refresh(db_sol)
    
    return _enrich(db_sol, db)


@router.get('/mis', response_model=list[SolicitudOut])
def mis_solicitudes(db: Session = Depends(get_db), user=Depends(get_current_user)):
    solicitudes = db.query(Solicitud).filter(
        Solicitud.usuario_id == user.id
    ).order_by(Solicitud.fecha_solicitud.desc()).all()
    
    return [_enrich(s, db) for s in solicitudes]


@router.get('/pendientes', response_model=list[SolicitudOut])
def solicitudes_pendientes(db: Session = Depends(get_db), admin=Depends(require_admin)):
    solicitudes = db.query(Solicitud).filter(Solicitud.estado == 'Pendiente').all()
    return [_enrich(s, db) for s in solicitudes]


@router.get('/aprobadas', response_model=list[SolicitudOut])
def solicitudes_aprobadas(db: Session = Depends(get_db), admin=Depends(require_admin)):
    solicitudes = db.query(Solicitud).filter(Solicitud.estado == 'Aprobado').all()
    return [_enrich(s, db) for s in solicitudes]


@router.patch('/{sol_id}/aprobar')
def aprobar_solicitud(sol_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    sol = db.query(Solicitud).filter(Solicitud.id == sol_id).first()
    if not sol:
        raise HTTPException(404, 'Solicitud no encontrada')
    
    if sol.estado != 'Pendiente':
        raise HTTPException(400, 'Solo se pueden aprobar solicitudes pendientes')
    
    sol.estado = 'Aprobado'
    db.commit()
    
    return {'ok': True, 'mensaje': 'Solicitud aprobada'}


@router.patch('/{sol_id}/entregar')
def entregar_solicitud(sol_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    sol = db.query(Solicitud).filter(Solicitud.id == sol_id).first()
    if not sol:
        raise HTTPException(404, 'Solicitud no encontrada')
    
    if sol.estado != 'Aprobado':
        raise HTTPException(400, 'Solo se pueden entregar solicitudes aprobadas')
    
    # Verificar que hay suficiente stock
    stock = calcular_stock_actual(db, sol.producto_id)
    if stock < sol.cantidad:
        raise HTTPException(400, f'Stock insuficiente. Stock actual: {stock}')
    
    sol.estado = 'Entregado'
    sol.fecha_entrega = datetime.utcnow()
    db.commit()
    
    return {'ok': True, 'mensaje': 'Solicitud entregada'}


@router.patch('/{sol_id}/cancelar')
def cancelar_solicitud(sol_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    sol = db.query(Solicitud).filter(Solicitud.id == sol_id).first()
    if not sol:
        raise HTTPException(404, 'Solicitud no encontrada')
    
    if sol.estado not in ['Pendiente', 'Aprobado']:
        raise HTTPException(400, 'Solo se pueden cancelar solicitudes pendientes o aprobadas')
    
    sol.estado = 'Cancelado'
    db.commit()
    
    return {'ok': True, 'mensaje': 'Solicitud cancelada'}