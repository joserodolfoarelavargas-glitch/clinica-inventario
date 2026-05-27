import { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto, createRecepcion } from '../../services/api';

export default function Productos() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [recepcionAbierta, setRecepcionAbierta] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  
  // Formulario SIMPLIFICADO - solo campos esenciales
  const [formData, setFormData] = useState({
    nombre: '',
    um: 'unidad',
    stock_inicial: 0,
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
      // Enviar solo los campos necesarios, el backend calculará el resto
      const productoData = {
        nombre: formData.nombre,
        um: formData.um,
        stock_inicial: formData.stock_inicial,
        precio_unitario: formData.precio_unitario,
        proveedor: formData.proveedor,
        categoria: formData.categoria,
        consumo_diario: 0,  // Se calculará automáticamente
        punto_pedido: 0,    // Se calculará automáticamente
        lote_compra: 1      // Valor por defecto
      };
      
      if (productoSeleccionado) {
        await updateProducto(productoSeleccionado.id, productoData);
      } else {
        await createProducto(productoData);
      }
      setModalAbierto(false);
      setProductoSeleccionado(null);
      setFormData({
        nombre: '', um: 'unidad', stock_inicial: 0, precio_unitario: 0, proveedor: '', categoria: ''
      });
      cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('Error al guardar el producto. Verifica los datos.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await deleteProducto(id);
        cargarProductos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
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
      alert('✅ Recepción registrada exitosamente');
    } catch (error) {
      console.error('Error registrando recepción:', error);
      alert('Error al registrar la recepción');
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
          <p className="text-gray-500 text-sm mt-1">Gestión del catálogo de productos</p>
        </div>
        <button
          onClick={() => {
            setProductoSeleccionado(null);
            setFormData({
              nombre: '', um: 'unidad', stock_inicial: 0, precio_unitario: 0, proveedor: '', categoria: ''
            });
            setModalAbierto(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo Diario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay productos. Haz clic en "Nuevo Producto" para crear uno.
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.nombre}</div>
                      <div className="text-xs text-gray-500">{p.um}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.categoria || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${p.stock_actual <= p.punto_pedido ? 'text-red-600' : 'text-gray-900'}`}>
                        {p.stock_actual}
                      </span>
                      <span className="text-gray-400 text-xs"> / {p.stock_inicial}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.consumo_diario || 0} {p.um}/día</td>
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
                            precio_unitario: p.precio_unitario, proveedor: p.proveedor || '', categoria: p.categoria || ''
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Producto - Formulario SIMPLIFICADO (solo 6 campos) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo 1: Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Paracetamol 500mg"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Campo 2: Stock inicial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock inicial <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="Cantidad inicial"
                  value={formData.stock_inicial}
                  onChange={e => setFormData({...formData, stock_inicial: parseFloat(e.target.value) || 0})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Cantidad con la que se inicia el inventario</p>
              </div>

              {/* Campo 3: Unidad de medida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de medida <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.um}
                  onChange={e => setFormData({...formData, um: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="unidad">Unidad</option>
                  <option value="tableta">Tableta</option>
                  <option value="cápsula">Cápsula</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="mg">Miligramo (mg)</option>
                  <option value="caja">Caja</option>
                  <option value="frasco">Frasco</option>
                  <option value="ampolla">Ampolla</option>
                </select>
              </div>

              {/* Campo 4: Precio unitario (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio compra unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.precio_unitario}
                  onChange={e => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Campo 5: Categoría (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  placeholder="Ej: Analgésicos, Antibióticos"
                  value={formData.categoria}
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Campo 6: Proveedor (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Nombre del proveedor"
                  value={formData.proveedor}
                  onChange={e => setFormData({...formData, proveedor: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Información de campos automáticos */}
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700 mb-1">📊 Datos automáticos:</p>
                <ul className="text-xs space-y-1">
                  <li>• <strong>Consumo diario:</strong> Se calcula del histórico</li>
                  <li>• <strong>Punto de pedido:</strong> Consumo × 3 días</li>
                  <li>• <strong>Stock actual:</strong> Stock inicial - entregas + recepciones</li>
                  <li>• <strong>Estado:</strong> CRÍTICO / ALERTA / OK</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {productoSeleccionado ? 'Actualizar' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recepción (+ Stock) */}
      {recepcionAbierta && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Registrar Recepción - {productoSeleccionado.nombre}</h3>
              <button onClick={() => setRecepcionAbierta(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRecepcion} className="space-y-4">
              <input type="number" placeholder="Cantidad" value={recepcionData.cantidad} onChange={e => setRecepcionData({...recepcionData, cantidad: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2" required />
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