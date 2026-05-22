from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# Token y Autenticación
class Token(BaseModel):
    access_token: str
    token_type: str
    rol: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Usuarios
class UsuarioCreate(BaseModel):
    nombre: str
    correo: EmailStr
    password: str
    rol: str = 'responsable'
    area: Optional[str] = None


class UsuarioOut(BaseModel):
    id: int
    nombre: str
    correo: str
    rol: str
    area: Optional[str] = None
    
    class Config:
        from_attributes = True


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None
    password: Optional[str] = None
    rol: Optional[str] = None
    area: Optional[str] = None
    activo: Optional[bool] = None


# Productos
class ProductoCreate(BaseModel):
    nombre: str
    um: str = 'unidad'
    stock_inicial: float = 0
    consumo_diario: float = 0
    punto_pedido: float = 0
    lote_compra: int = 1
    precio_unitario: float = 0
    proveedor: Optional[str] = None
    categoria: Optional[str] = None


class ProductoOut(BaseModel):
    id: int
    nombre: str
    um: str
    stock_inicial: float
    consumo_diario: float
    punto_pedido: float
    lote_compra: int
    precio_unitario: float
    proveedor: Optional[str] = None
    categoria: Optional[str] = None
    stock_actual: float = 0
    estado: str = 'OK'
    
    class Config:
        from_attributes = True


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    um: Optional[str] = None
    stock_inicial: Optional[float] = None
    consumo_diario: Optional[float] = None
    punto_pedido: Optional[float] = None
    lote_compra: Optional[int] = None
    precio_unitario: Optional[float] = None
    proveedor: Optional[str] = None
    categoria: Optional[str] = None
    activo: Optional[bool] = None


# Solicitudes
class SolicitudCreate(BaseModel):
    producto_id: int
    cantidad: float
    comentarios: Optional[str] = None


class SolicitudOut(BaseModel):
    id: int
    producto_id: int
    usuario_id: int
    cantidad: float
    estado: str
    prioridad: str
    comentarios: Optional[str]
    fecha_solicitud: datetime
    fecha_entrega: Optional[datetime]
    producto_nombre: Optional[str] = None
    usuario_nombre: Optional[str] = None
    
    class Config:
        from_attributes = True


class SolicitudUpdate(BaseModel):
    estado: Optional[str] = None
    comentarios: Optional[str] = None


# Recepciones
class RecepcionCreate(BaseModel):
    producto_id: int
    cantidad: float
    lote: Optional[str] = None
    fecha_venc: Optional[datetime] = None
    num_factura: Optional[str] = None
    proveedor: Optional[str] = None
    observaciones: Optional[str] = None


class RecepcionOut(BaseModel):
    id: int
    producto_id: int
    cantidad: float
    lote: Optional[str]
    fecha_venc: Optional[datetime]
    num_factura: Optional[str]
    proveedor: Optional[str]
    observaciones: Optional[str]
    fecha_recepcion: datetime
    
    class Config:
        from_attributes = True


# Entregas Históricas
class EntregaHistoricaCreate(BaseModel):
    producto_id: int
    cantidad: float
    responsable: Optional[str] = None
    area: Optional[str] = None
    fecha: datetime


class EntregaHistoricaOut(BaseModel):
    id: int
    producto_id: int
    cantidad: float
    responsable: Optional[str]
    area: Optional[str]
    fecha: datetime
    
    class Config:
        from_attributes = True
