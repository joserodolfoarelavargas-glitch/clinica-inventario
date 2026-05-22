# backend/app/routers/reportes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Producto, Solicitud, EntregaHistorica
from ..auth import require_admin
from ..business import calcular_stock_actual, calcular_estado_producto

router = APIRouter()


@router.get('/consumo')
def reporte_consumo(dias: int = 30, db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Reporte de consumo de productos en los últimos N días"""
    fecha_limite = datetime.utcnow() - timedelta(days=dias)
    
    # Entregas históricas en el período
    entregas = db.query(
        EntregaHistorica.producto_id,
        func.sum(EntregaHistorica.cantidad).label('total_entregado')
    ).filter(EntregaHistorica.fecha >= fecha_limite).group_by(EntregaHistorica.producto_id).all()
    
    # Solicitudes entregadas en el período
    solicitudes = db.query(
        Solicitud.producto_id,
        func.sum(Solicitud.cantidad).label('total_solicitado')
    ).filter(
        and_(Solicitud.fecha_entrega >= fecha_limite, Solicitud.estado == 'Entregado')
    ).group_by(Solicitud.producto_id).all()
    
    # Crear diccionarios para fácil acceso
    entregas_dict = {e.producto_id: e.total_entregado for e in entregas}
    solicitudes_dict = {s.producto_id: s.total_solicitado for s in solicitudes}
    
    # Obtener todos los productos activos
    productos = db.query(Producto).filter(Producto.activo == True).all()
    
    resultado = []
    for p in productos:
        stock = calcular_stock_actual(db, p.id)
        estado = calcular_estado_producto(stock, p.consumo_diario)
        
        resultado.append({
            'id': p.id,
            'nombre': p.nombre,
            'um': p.um,
            'consumo_diario_prom': p.consumo_diario,
            'stock_actual': stock,
            'estado': estado,
            'entregas_historicas_periodo': entregas_dict.get(p.id, 0),
            'solicitudes_entregadas_periodo': solicitudes_dict.get(p.id, 0),
            'total_salidas': entregas_dict.get(p.id, 0) + solicitudes_dict.get(p.id, 0)
        })
    
    return sorted(resultado, key=lambda x: x['total_salidas'], reverse=True)


@router.get('/resumen')
def resumen_inventario(db: Session = Depends(get_db), admin=Depends(require_admin)):
    """Resumen general del inventario"""
    productos = db.query(Producto).filter(Producto.activo == True).all()
    
    criticos = 0
    alerta = 0
    ok = 0
    stock_total = 0
    
    for p in productos:
        stock = calcular_stock_actual(db, p.id)
        estado = calcular_estado_producto(stock, p.consumo_diario)
        stock_total += stock
        
        if estado == 'CRÍTICO':
            criticos += 1
        elif estado == 'ALERTA':
            alerta += 1
        else:
            ok += 1
    
    return {
        'total_productos': len(productos),
        'criticos': criticos,
        'alerta': alerta,
        'ok': ok,
        'stock_total': round(stock_total, 2),
        'fecha_reporte': datetime.utcnow()
    }