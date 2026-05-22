# backend/app/routers/productos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Producto
from ..schemas import ProductoCreate, ProductoOut
from ..auth import get_current_user, require_admin
from ..business import calcular_stock_actual, calcular_estado_producto, calcular_sugerencia_pedido

router = APIRouter()


@router.get('/', response_model=List[ProductoOut])
def listar_productos(db: Session = Depends(get_db), user=Depends(get_current_user)):
    productos = db.query(Producto).filter(Producto.activo == True).all()
    result = []
    
    for p in productos:
        stock = calcular_stock_actual(db, p.id)
        estado = calcular_estado_producto(stock, p.consumo_diario)
        
        out = ProductoOut(
            id=p.id,
            nombre=p.nombre,
            um=p.um,
            stock_inicial=p.stock_inicial,
            consumo_diario=p.consumo_diario,
            punto_pedido=p.punto_pedido,
            lote_compra=p.lote_compra,
            precio_unitario=p.precio_unitario,
            proveedor=p.proveedor,
            categoria=p.categoria,
            stock_actual=stock,
            estado=estado
        )
        result.append(out)
    
    return result


@router.post('/', response_model=ProductoOut)
def crear_producto(prod: ProductoCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    # Verificar si ya existe un producto con ese nombre
    existe = db.query(Producto).filter(Producto.nombre == prod.nombre).first()
    if existe:
        raise HTTPException(400, 'Ya existe un producto con ese nombre')
    
    db_prod = Producto(**prod.dict())
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    
    return ProductoOut(
        **db_prod.__dict__,
        stock_actual=0,
        estado='OK'
    )


@router.put('/{prod_id}', response_model=ProductoOut)
def editar_producto(prod_id: int, prod: ProductoCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    db_prod = db.query(Producto).filter(Producto.id == prod_id).first()
    if not db_prod:
        raise HTTPException(404, 'Producto no encontrado')
    
    for key, value in prod.dict().items():
        setattr(db_prod, key, value)
    
    db.commit()
    db.refresh(db_prod)
    
    stock = calcular_stock_actual(db, prod_id)
    estado = calcular_estado_producto(stock, db_prod.consumo_diario)
    
    return ProductoOut(
        **db_prod.__dict__,
        stock_actual=stock,
        estado=estado
    )


@router.delete('/{prod_id}')
def eliminar_producto(prod_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    db_prod = db.query(Producto).filter(Producto.id == prod_id).first()
    if not db_prod:
        raise HTTPException(404, 'Producto no encontrado')
    
    db_prod.activo = False  # Soft delete
    db.commit()
    
    return {'ok': True, 'mensaje': 'Producto eliminado'}


@router.get('/sugerencias')
def sugerencias_pedido(db: Session = Depends(get_db), admin=Depends(require_admin)):
    productos = db.query(Producto).filter(Producto.activo == True).all()
    criticos = []
    
    for p in productos:
        sug = calcular_sugerencia_pedido(db, p.id)
        if sug['estado'] in ('CRÍTICO', 'ALERTA'):
            criticos.append({
                'id': p.id,
                'nombre': p.nombre,
                'um': p.um,
                'proveedor': p.proveedor,
                'categoria': p.categoria,
                **sug
            })
    
    return sorted(criticos, key=lambda x: x['stock_actual'])