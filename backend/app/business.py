import math
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import Producto, Recepcion, Solicitud, EntregaHistorica
from .config import settings


def calcular_stock_actual(db: Session, producto_id: int) -> float:
    prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not prod:
        return 0.0
    sal_hist = db.query(func.sum(EntregaHistorica.cantidad)).filter(EntregaHistorica.producto_id == producto_id).scalar() or 0.0
    sal_sol = db.query(func.sum(Solicitud.cantidad)).filter(Solicitud.producto_id == producto_id, Solicitud.estado == "Entregado").scalar() or 0.0
    ingresos = db.query(func.sum(Recepcion.cantidad)).filter(Recepcion.producto_id == producto_id).scalar() or 0.0
    stock = prod.stock_inicial - sal_hist - sal_sol + ingresos
    return max(stock, 0.0)


def calcular_prioridad(stock_actual: float, consumo_diario: float) -> str:
    if consumo_diario <= 0:
        return "Baja"
    if stock_actual < consumo_diario * settings.DIAS_STOCK_MINIMO:
        return "Alta"
    elif stock_actual < consumo_diario * settings.DIAS_ALERTA:
        return "Media"
    return "Baja"


def calcular_estado_producto(stock_actual: float, consumo_diario: float) -> str:
    if consumo_diario <= 0:
        return "OK" if stock_actual > 0 else "CRITICO"
    if stock_actual <= consumo_diario * settings.DIAS_STOCK_MINIMO:
        return "CRITICO"
    elif stock_actual <= consumo_diario * settings.DIAS_ALERTA:
        return "ALERTA"
    return "OK"


def calcular_sugerencia_pedido(db: Session, producto_id: int) -> dict:
    prod = db.query(Producto).filter(Producto.id == producto_id).first()
    if not prod:
        return {"stock_actual": 0, "stock_max_deseado": 0, "cantidad_sugerida": 0, "estado": "CRITICO"}
    stock_actual = calcular_stock_actual(db, producto_id)
    stock_max = prod.consumo_diario * settings.DIAS_STOCK_MAXIMO
    cantidad_base = max(0, stock_max - stock_actual)
    lote = max(prod.lote_compra, 1)
    cantidad_final = math.ceil(cantidad_base / lote) * lote
    return {
        "stock_actual": stock_actual,
        "stock_max_deseado": stock_max,
        "cantidad_sugerida": cantidad_final,
        "estado": calcular_estado_producto(stock_actual, prod.consumo_diario),
    }
