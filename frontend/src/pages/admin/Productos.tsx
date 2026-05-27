import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, createRecepcion } from '../../services/api';

export default function Productos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [recepcionAbierta, setRecepcionAbierta] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    um: 'unidad',
    stock_inicial: 0,
    consumo_diario: 0,
    punto_pedido: 0,
    lote_compra: 1,
    precio_unitario: 0,
    proveedor: '',
    categoria: ''
  });
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
      setFormData({
        nombre: '', um: 'unidad', stock_inicial: 0, consumo_diario: 0,
        punto_pedido: 0, lote_compra: 1, precio_unitario: 0, proveedor: '', categoria: ''
      });
      cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este producto?')) {
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
        proveedor: recepcionData.proveedor
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
    switch (estado) {
      case 'CRITICO': return 'text-red-600 bg-red-100';
      case 'ALERTA': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'CRITICO': return 'Crítico';
      case 'ALERTA': return 'Alerta';
      default: return 'OK';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
        <button
          onClick={() => {
            setProductoSeleccionado(null);
            setFormData({
              nombre: '', um: 'unidad', stock_inicial: 0, consumo_diario: 0,
              punto_pedido: 0, lote_compra: 1, precio_unitario: 0, proveedor: '', categoria: ''
            });
            setModalAbierto(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo Diario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{p.nombre}</div>
                  <div className="text-sm text-gray-500">{p.categoria}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{p.stock_actual} {p.um}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.consumo_diario}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(p.estado)}`}>
                    {getEstadoTexto(p.estado)}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setFormData({
                        nombre: p.nombre, um: p.um, stock_inicial: p.stock_inicial,
                        consumo_diario: p.consumo_diario, punto_pedido: p.punto_pedido,
                        lote_compra: p.lote_compra, precio_unitario: p.precio_unitario,
                        proveedor: p.proveedor || '', categoria: p.categoria || ''
                      });
                      setModalAbierto(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setProductoSeleccionado(p);
                      setRecepcionAbierta(true);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    + Stock
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Producto */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{productoSeleccionado ? 'Editar' : 'Nuevo'} Producto</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Unidad de medida" value={formData.um} onChange={e => setFormData({...formData, um: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <input type="number" placeholder="Stock inicial" value={formData.stock_inicial} onChange={e => setFormData({...formData, stock_inicial: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              <input type="number" placeholder="Consumo diario" value={formData.consumo_diario} onChange={e => setFormData({...formData, consumo_diario: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              <input type="number" placeholder="Punto de pedido" value={formData.punto_pedido} onChange={e => setFormData({...formData, punto_pedido: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" />
              <input type="text" placeholder="Proveedor" value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recepción */}
      {recepcionAbierta && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Recepción - {productoSeleccionado.nombre}</h3>
            <form onSubmit={handleRecepcion} className="space-y-4">
              <input type="number" placeholder="Cantidad" value={recepcionData.cantidad} onChange={e => setRecepcionData({...recepcionData, cantidad: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2" required />
              <input type="text" placeholder="Lote" value={recepcionData.lote} onChange={e => setRecepcionData({...recepcionData, lote: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <input type="text" placeholder="N° Factura" value={recepcionData.num_factura} onChange={e => setRecepcionData({...recepcionData, num_factura: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setRecepcionAbierta(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}