import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, createRecepcion, createSolicitud } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardResponsable() {
  const { user } = useAuth();
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [recepcionAbierta, setRecepcionAbierta] = useState(false);
  const [solicitudAbierta, setSolicitudAbierta] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  
  // Tu estado simplificado con exactamente 6 campos esenciales
  const estadoInicialForm = {
    nombre: '',
    um: 'unidad',
    stock_inicial: 0,
    precio_unitario: 0,
    proveedor: '',
    categoria: ''
  };

  const [formData, setFormData] = useState(estadoInicialForm);
  
  const [recepcionData, setRecepcionData] = useState({
    cantidad: 0,
    lote: '',
    num_factura: '',
    proveedor: ''
  });

  const [solicitudData, setSolicitudData] = useState({
    cantidad: 0,
    comentarios: '',
    prioridad: 'Normal'
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Tu excelente mapeo lógico para proteger el contrato del backend
      const productoData = {
        nombre: formData.nombre,
        um: formData.um,
        stock_inicial: formData.stock_inicial,
        precio_unitario: formData.precio_unitario,
        proveedor: formData.proveedor,
        categoria: formData.categoria,
        consumo_diario: 0,
        punto_pedido: 0,
        lote_compra: 1
      };
      
      if (productoSeleccionado) {
        await updateProducto(productoSeleccionado.id, productoData);
      } else {
        await createProducto(productoData);
      }
      setModalAbierto(false);
      setProductoSeleccionado(null);
      setFormData(estadoInicialForm);
      cargarProductos();
      alert('✅ Insumo guardado correctamente en el catálogo');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este insumo médico? Esta acción alterará los históricos.')) {
      try {
        await deleteProducto(id);
        cargarProductos();
      } catch (error) {
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado) return;
    try {
      // Enviamos el payload completo recopilando datos del producto, formulario y contexto de usuario
      await createSolicitud({
        producto_id: productoSeleccionado.id,
        cantidad: solicitudData.cantidad,
        prioridad: solicitudData.prioridad,
        area: user?.area || 'General', // Área de origen obtenida del login
        comentarios: solicitudData.comentarios
      });

      // Limpieza del estado del formulario y cierre de modal
      setSolicitudAbierta(false);
      setSolicitudData({ cantidad: 0, comentarios: '', prioridad: 'Normal' });
      setProductoSeleccionado(null);

      // Recarga de datos para actualizar estados visuales y feedback al usuario
      cargarProductos();
      alert(`🚀 Solicitud enviada con éxito desde el área de ${user?.area || 'General'}`);
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert('Error al procesar la solicitud');
    }
  };

  const handleRecepcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado) return;
    try {
      await createRecepcion({
        producto_id: productoSeleccionado.id,
        cantidad: recepcionData.cantidad,
        lote: recepcionData.lote,
        num_factura: recepcionData.num_factura,
        proveedor: recepcionData.proveedor || productoSeleccionado.proveedor
      });
      setRecepcionAbierta(false);
      setRecepcionData({ cantidad: 0, lote: '', num_factura: '', proveedor: '' });
      setProductoSeleccionado(null);
      cargarProductos();
      alert('📦 Recepción e ingreso a almacén registrados');
    } catch (error) {
      alert('Error al registrar la entrada de stock');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'CRITICO':
      case 'CRÍTICO': 
        return 'text-red-700 bg-red-50 border border-red-200';
      case 'ALERTA': 
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      default: 
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'CRITICO':
      case 'CRÍTICO': return 'Crítico';
      case 'ALERTA': return 'Alerta';
      default: return 'OK';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 text-sm text-gray-500 font-medium">
        ⏳ Cargando inventario maestro clínico...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Catálogo de Productos e Insumos</h2>
          <p className="text-xs text-gray-400">Alta y control de medicamentos, materiales descartables y activos de la clínica.</p>
        </div>
        <button
          onClick={() => {
            setProductoSeleccionado(null);
            setFormData(estadoInicialForm);
            setModalAbierto(true);
          }}
          className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-[#152943] transition-colors shadow-sm"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Tabla Estilizada según Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5">Detalle del Producto</th>
              <th className="px-6 py-3.5">Costo Ref.</th>
              <th className="px-6 py-3.5">Stock Disponible</th>
              <th className="px-6 py-3.5">Estado Almacén</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {productos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 text-sm">{p.nombre}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    <span className="font-semibold text-slate-500">{p.categoria || 'Sin categoría'}</span> — Prov: {p.proveedor || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-600">
                  ${p.precio_unitario ? p.precio_unitario.toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-800 text-sm">{p.stock_actual}</span>{' '}
                  <span className="text-[10px] text-gray-400 font-normal">{p.um}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${getEstadoColor(p.estado)}`}>
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
                    {getEstadoTexto(p.estado)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      const esCritico = p.estado?.toUpperCase() === 'CRITICO' || p.estado?.toUpperCase() === 'CRÍTICO';
                      setSolicitudData({
                        cantidad: 0,
                        comentarios: '',
                        prioridad: esCritico ? 'Alta' : 'Normal'
                      });
                      setSolicitudAbierta(true);
                    }}
                    className="text-white bg-[#1e3a5f] px-2.5 py-1 rounded-md hover:opacity-90 transition-colors font-medium"
                  >
                    Solicitar
                  </button>
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setFormData({
                        nombre: p.nombre,
                        um: p.um || 'unidad',
                        stock_inicial: p.stock_inicial || 0,
                        precio_unitario: p.precio_unitario || 0,
                        proveedor: p.proveedor || '',
                        categoria: p.categoria || ''
                      });
                      setModalAbierto(true);
                    }}
                    className="text-[#1e3a5f] bg-[#EFF6FF] px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setRecepcionAbierta(true);
                    }}
                    className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors font-medium"
                  >
                    + Stock
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">
                  No hay insumos médicos cargados en el sistema actualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CLIENTE - FORMULARIO DE 6 CAMPOS */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100 text-xs">
            <h3 className="text-base font-semibold text-slate-800 mb-1">{productoSeleccionado ? 'Modificar' : 'Nuevo'} Insumo</h3>
            <p className="text-gray-400 mb-4 text-[11px]">Campos obligatorios marcados con asterisco (*)</p>
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Nombre Comercial / Genérico *</label>
                <input type="text" placeholder="Ej: Amoxicilina 500mg" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] transition-colors" required />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Stock Inicial *</label>
                  <input type="number" placeholder="0" value={formData.stock_inicial} onChange={e => setFormData({...formData, stock_inicial: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] disabled:bg-gray-50 disabled:text-gray-400 transition-colors" disabled={!!productoSeleccionado} required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Unidad de Medida *</label>
                  <select value={formData.um} onChange={e => setFormData({...formData, um: e.target.value})} className="w-full border border-gray-300 bg-white rounded-lg px-3 py-1.5 outline-none focus:border-[#1e3a5f] transition-colors">
                    <option value="unidad">Unidad</option>
                    <option value="tableta">Tableta</option>
                    <option value="caja">Caja</option>
                    <option value="frasco">Frasco</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Precio Unitario ($) *</label>
                  <input type="number" step="0.01" placeholder="0.00" value={formData.precio_unitario} onChange={e => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] transition-colors" required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Categoría *</label>
                  <input type="text" placeholder="Ej: Antibióticos" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] transition-colors" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Proveedor Autorizado *</label>
                <input type="text" placeholder="Ej: MediStock Global" value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] transition-colors" required />
              </div>
              
              <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center mt-2">
                ℹ️ Consumo diario, punto de pedido y alertas críticas se procesan por el servidor.
              </div>
              
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white font-medium rounded-lg hover:bg-[#152943] transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - NUEVA SOLICITUD (FLUJO INTERACTIVO) */}
      {solicitudAbierta && productoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100 text-xs">
            <h3 className="text-base font-semibold text-slate-800 mb-1">Nueva Solicitud de Insumo</h3>
            <p className="text-gray-400 mb-4 text-[11px]">Insumo: <strong className="text-slate-700">{productoSeleccionado.nombre}</strong></p>
            
            {/* ALERTA VISUAL DE PRIORIDAD SEGÚN ESTADO FÍSICO */}
            <div className={`mb-4 p-3 rounded-lg border flex items-center space-x-3 ${
              solicitudData.prioridad === 'Alta' 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <span className="text-xl">{solicitudData.prioridad === 'Alta' ? '⚠️' : 'ℹ️'}</span>
              <div>
                <p className="font-bold uppercase tracking-tight">
                  {solicitudData.prioridad === 'Alta' ? 'Prioridad Alta - Insumo Crítico' : 'Prioridad Normal'}
                </p>
                <p className="text-[10px] opacity-80">
                  {solicitudData.prioridad === 'Alta' 
                    ? 'Este producto se encuentra en niveles críticos. Se notificará a farmacia para despacho urgente.' 
                    : 'El nivel de stock es aceptable. La solicitud seguirá el flujo ordinario.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSolicitud} className="space-y-3.5">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Cantidad a Solicitar *</label>
                <input type="number" min="1" placeholder="Ej: 20" value={solicitudData.cantidad} onChange={e => setSolicitudData({...solicitudData, cantidad: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] transition-colors" required />
                <p className="mt-1 text-[10px] text-gray-400">Stock físico en almacén: {productoSeleccionado.stock_actual} {productoSeleccionado.um}</p>
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Justificación o Notas</label>
                <textarea rows={3} placeholder="Opcional: Indique el uso o destino del material..." value={solicitudData.comentarios} onChange={e => setSolicitudData({...solicitudData, comentarios: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f] transition-colors resize-none" />
              </div>
              
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setSolicitudAbierta(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${solicitudData.prioridad === 'Alta' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1e3a5f] hover:bg-[#152943]'}`}>Enviar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL - RECEPCIÓN DE STOCK (+ STOCK) */}
      {recepcionAbierta && productoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-100 text-xs">
            <h3 className="text-base font-semibold text-emerald-950 mb-1">Registrar Recepción</h3>
            <p className="text-gray-400 mb-4 text-[11px]">Ingreso físico para: <strong className="text-slate-700">{productoSeleccionado.nombre}</strong></p>
            
            <form onSubmit={handleRecepcion} className="space-y-3.5">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Cantidad Recibida *</label>
                <input type="number" min="1" placeholder="Ej: 150" value={recepcionData.cantidad} onChange={e => setRecepcionData({...recepcionData, cantidad: parseInt(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition-colors" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Código de Lote</label>
                  <input type="text" placeholder="Ej: LOT-2026" value={recepcionData.lote} onChange={e => setRecepcionData({...recepcionData, lote: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">N° Factura / Remito</label>
                  <input type="text" placeholder="Ej: FAC-0023" value={recepcionData.num_factura} onChange={e => setRecepcionData({...recepcionData, num_factura: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 transition-colors" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setRecepcionAbierta(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">Registrar Entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}