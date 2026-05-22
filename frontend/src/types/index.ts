export interface Producto {
  id: number;
  nombre: string;
  um: string;
  stock_inicial: number;
  consumo_diario: number;
  punto_pedido: number;
  lote_compra: number;
  precio_unitario: number;
  proveedor: string | null;
  categoria: string | null;
  stock_actual: number;
  estado: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  area: string | null;
}

export interface Solicitud {
  id: number;
  producto_id: number;
  usuario_id: number;
  cantidad: number;
  estado: string;
  prioridad: string;
  comentarios: string | null;
  fecha_solicitud: string;
  fecha_entrega: string | null;
  producto_nombre: string;
  usuario_nombre: string;
}