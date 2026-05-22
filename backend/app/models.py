from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class Usuario(Base):
    __tablename__ = 'usuarios'
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(120), nullable=False)
    correo = Column(String(120), unique=True, index=True, nullable=False)
    hashed_pass = Column(String(256), nullable=False)
    rol = Column(String(30), default='responsable')
    area = Column(String(80), nullable=True)
    activo = Column(Boolean, default=True)
    
    solicitudes = relationship('Solicitud', back_populates='usuario')


class Producto(Base):
    __tablename__ = 'productos'
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), unique=True, nullable=False)
    um = Column(String(30), default='unidad')
    stock_inicial = Column(Float, default=0)
    consumo_diario = Column(Float, default=0)
    punto_pedido = Column(Float, default=0)
    lote_compra = Column(Integer, default=1)
    precio_unitario = Column(Float, default=0)
    proveedor = Column(String(150), nullable=True)
    categoria = Column(String(80), nullable=True)
    activo = Column(Boolean, default=True)
    
    recepciones = relationship('Recepcion', back_populates='producto')
    solicitudes = relationship('Solicitud', back_populates='producto')


class Recepcion(Base):
    __tablename__ = 'recepciones'
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    cantidad = Column(Float, nullable=False)
    lote = Column(String(80), nullable=True)
    fecha_venc = Column(DateTime, nullable=True)
    num_factura = Column(String(80), nullable=True)
    proveedor = Column(String(150), nullable=True)
    observaciones = Column(Text, nullable=True)
    fecha_recepcion = Column(DateTime, default=datetime.utcnow)
    
    producto = relationship('Producto', back_populates='recepciones')


class EntregaHistorica(Base):
    __tablename__ = 'entregas_historicas'
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    cantidad = Column(Float, nullable=False)
    responsable = Column(String(120), nullable=True)
    area = Column(String(80), nullable=True)
    fecha = Column(DateTime, nullable=False)


class Solicitud(Base):
    __tablename__ = 'solicitudes'
    
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey('productos.id'), nullable=False)
    usuario_id = Column(Integer, ForeignKey('usuarios.id'), nullable=False)
    cantidad = Column(Float, nullable=False)
    estado = Column(String(30), default='Pendiente')
    prioridad = Column(String(20), default='Media')
    comentarios = Column(Text, nullable=True)
    fecha_solicitud = Column(DateTime, default=datetime.utcnow)
    fecha_entrega = Column(DateTime, nullable=True)
    
    producto = relationship('Producto', back_populates='solicitudes')
    usuario = relationship('Usuario', back_populates='solicitudes')
