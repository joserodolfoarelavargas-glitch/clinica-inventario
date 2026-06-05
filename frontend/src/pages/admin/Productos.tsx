import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, createRecepcion } from '../../services/api';

export default function Productos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [recepcionAbierta, setRecepcionAbierta] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  
  // Estado inicial simplificado: Los campos estadísticos se quedan en segundo plano en 0
  const estadoInicialForm = {
    nombre: '',
    um: 'unidad',
    stock_inicial: 0,
    consumo_diario: 0,  // Automático
    punto_pedido: 0,    // Automático
    lote_compra: 1,     // Automático
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
      if (productoSeleccionado) {
        await updateProducto(productoSeleccionado.id, formData);
      } else {
        await createProducto(formData);
      }
      setModalAbierto(false);
      setProductoSeleccionado(null);
      setFormData(estadoInicialForm);
      cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este insumo del catálogo médico?')) {
      try {
        await deleteProducto(id);
        cargarProductos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
      }
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
    } catch (error) {
      console.error('Error registrando recepción:', error);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'CRÍTICO':
      case 'CRITICO': 
        return 'text-red-700 bg-red-100 border border-red-200';
      case 'ALERTA': 
        return 'text-amber-700 bg-amber-100 border border-amber-200';
      default: 
        return 'text-emerald-700 bg-emerald-100 border border-emerald-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 text-sm text-gray-500 font-medium">
        ⏳ Cargando catálogo de insumos médicos...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Barra de Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-slate-800">Catálogo de Productos e Insumos</h2>
          <p className="text-xs text-gray-400">Control maestro de medicamentos y materiales de la clínica</p>
        </div>
        <button
          onClick={() => {
            setProductoSeleccionado(null);
            setFormData(estadoInicialForm);
            setModalAbierto(true);
          }}
          className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition shadow-sm"
        >
          + Registrar Insumo
        </button>
      </div>

      {/* Tabla Principal Estilo Mockup */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Insumo / Medicamento</th>
              <th className="px-6 py-3">Precio Ref.</th>
              <th className="px-6 py-3">Stock Físico</th>
              <th className="px-6 py-3">Estado Logístico</th>
              <th className="px-6 py-3 text-right">Acciones de Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {productos.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{p.nombre}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{p.categoria || 'Sin categoría'} — Prov: {p.proveedor || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-600">
                  ${p.precio_unitario ? p.precio_unitario.toFixed(2) : '0.00'}
                </td>
                <td className="px-6 py-4 font-bold text-slate-800">
                  {p.stock_actual} <span className="font-normal text-gray-400 text-[11px]">{p.um || p.unidad_medida}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getEstadoColor(p.estado)}`}>
                    {p.estado || 'OK'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setFormData({
                        nombre: p.nombre,
                        um: p.um || p.unidad_medida || 'unidad',
                        stock_inicial: p.stock_inicial || 0,
                        consumo_diario: p.consumo_diario || 0,
                        punto_pedido: p.punto_pedido || 0,
                        lote_compra: p.lote_compra || 1,
                        precio_unitario: p.precio_unitario || 0,
                        proveedor: p.proveedor || '',
                        categoria: p.categoria || ''
                      });
                      setModalAbierto(true);
                    }}
                    className="text-[#1e3a5f] bg-[#EFF6FF] px-2 py-1 rounded hover:bg-blue-100 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setRecepcionAbierta(true);
                    }}
                    className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition font-medium"
                  >
                    + Stock
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-700 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">No hay productos registrados en el inventario.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SIMPLIFICADO: REGISTRO / EDICIÓN DE PRODUCTO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4">
              <h3 className="text-base font-medium text-slate-800">{productoSeleccionado ? 'Modificar' : 'Nuevo'} Insumo Clínico</h3>
              <p className="text-xs text-gray-400">Los parámetros de alertas y consumos se calcularán automáticamente.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Nombre Comercial / Genérico *</label>
                <input type="text" placeholder="Ej: Paracetamol 500mg" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Categoría *</label>
                  <input type="text" placeholder="Ej: Analgésicos, Material Sucio" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]" required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Unidad de Medida *</label>
                  <select value={formData.um} onChange={e => setFormData({...formData, um: e.target.value})} className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]">
                    <option value="unidad">Unidad (Ampolla/Frasco)</option>
                    <option value="tableta">Tableta / Comprimido</option>
                    <option value="caja">Caja cerrada</option>
                    <option value="ml">Mililitros (ml)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Stock Inicial Físico *</label>
                  <input type="number" min="0" placeholder="0" value={formData.stock_inicial} onChange={e => setFormData({...formData, stock_inicial: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]" disabled={!!productoSeleccionado} required />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Precio Unitario ($) *</label>
                  <input type="number" step="0.01" min="0" placeholder="0.00" value={formData.precio_unitario} onChange={e => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Proveedor Autorizado *</label>
                <input type="text" placeholder="Ej: Droguería Central S.A." value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#1e3a5f]" required />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg font-medium hover:opacity-90 transition">Guardar Insumo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE RECEPCIÓN DE STOCK (+ STOCK) */}
      {recepcionAbierta && productoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4">
              <h3 className="text-base font-medium text-emerald-950">Ingreso de Suministros por Almacén</h3>
              <p className="text-xs text-gray-400">Incrementar inventario físico para: <strong className="text-slate-700">{productoSeleccionado.nombre}</strong></p>
            </div>
            
            <form onSubmit={handleRecepcion} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Cantidad Recibida *</label>
                <input type="number" min="1" placeholder="Ej: 100" value={recepcionData.cantidad} onChange={e => setRecepcionData({...recepcionData, cantidad: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Código de Lote / Serie</label>
                  <input type="text" placeholder="LOTE-2026X" value={recepcionData.lote} onChange={e => setRecepcionData({...recepcionData, lote: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600" />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">N° de Factura / Remisión</label>
                  <input type="text" placeholder="FAC-001-992" value={recepcionData.num_factura} onChange={e => setRecepcionData({...recepcionData, num_factura: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600" />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">Proveedor de Despacho (Opcional)</label>
                <input type="text" placeholder={productoSeleccionado.proveedor || "Dejar vacío para mantener proveedor por defecto"} value={recepcionData.proveedor} onChange={e => setRecepcionData({...recepcionData, proveedor: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-600" />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setRecepcionAbierta(false)} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-medium hover:bg-emerald-800 transition">Registrar Entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}