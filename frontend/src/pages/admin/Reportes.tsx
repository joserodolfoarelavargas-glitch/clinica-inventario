import { useEffect, useState } from 'react';
import { getProductos, getSugerencias, getResumenInventario } from '../../services/api';

export default function Reportes() {
  const [productos, setProductos] = useState<any[]>([]);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'criticos' | 'sugerencias' | 'todos'>('criticos');

  useEffect(() => {
    cargarDatos();
  }, [tab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [productosData, sugerenciasData, resumenData] = await Promise.all([
        getProductos(),
        getSugerencias(),
        getResumenInventario()
      ]);
      setProductos(productosData);
      setSugerencias(sugerenciasData);
      setResumen(resumenData);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'CRITICO': return 'text-red-600 bg-red-100 border-red-200';
      case 'ALERTA': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'CRITICO': return '🔴 Crítico';
      case 'ALERTA': return '🟡 Alerta';
      default: return '🟢 OK';
    }
  };

  const productosCriticos = productos.filter(p => p.estado === 'CRITICO');
  const productosAlerta = productos.filter(p => p.estado === 'ALERTA');
 

  if (loading) {
    return <div className="text-center py-8">Cargando reportes...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
        <p className="text-gray-500 mt-1">Análisis de inventario y sugerencias de pedido</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Total Productos</div>
          <div className="text-3xl font-bold text-gray-800">{resumen?.total_productos || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="text-gray-500 text-sm">Stock Total</div>
          <div className="text-3xl font-bold text-gray-800">{resumen?.stock_total || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="text-gray-500 text-sm">Productos Críticos</div>
          <div className="text-3xl font-bold text-red-600">{resumen?.criticos || 0}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="text-gray-500 text-sm">En Alerta</div>
          <div className="text-3xl font-bold text-yellow-600">{resumen?.alerta || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setTab('criticos')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'criticos'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚠️ Críticos y Alerta ({productosCriticos.length + productosAlerta.length})
        </button>
        <button
          onClick={() => setTab('sugerencias')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'sugerencias'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 Sugerencias de Pedido ({sugerencias.length})
        </button>
        <button
          onClick={() => setTab('todos')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'todos'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Todos los Productos
        </button>
      </div>

      {/* Tab: Críticos y Alerta */}
      {tab === 'criticos' && (
        <div className="space-y-6">
          {productosCriticos.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <h3 className="text-lg font-semibold text-red-700">🔴 Productos con Stock Crítico</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo Diario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punto de Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productosCriticos.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-semibold">{p.stock_actual} {p.um}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.consumo_diario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.punto_pedido}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.proveedor || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {productosAlerta.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-700">🟡 Productos en Alerta</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo Diario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días restantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productosAlerta.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nombre}</td>
                      <td className="px-6 py-4 text-sm text-yellow-600 font-semibold">{p.stock_actual} {p.um}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.consumo_diario}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.consumo_diario > 0 ? Math.floor(p.stock_actual / p.consumo_diario) : '∞'} días
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {productosCriticos.length === 0 && productosAlerta.length === 0 && (
            <div className="bg-green-50 text-green-700 px-6 py-4 rounded-lg text-center">
              ✅ ¡Excelente! Todos los productos tienen stock adecuado.
            </div>
          )}
        </div>
      )}

      {/* Tab: Sugerencias de Pedido */}
      {tab === 'sugerencias' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {sugerencias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              📦 No hay sugerencias de pedido. Todos los productos tienen stock suficiente.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Máx Deseado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Sugerida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sugerencias.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.stock_actual} {s.um}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{Math.round(s.stock_max_deseado)}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-bold">{s.cantidad_sugerida}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.proveedor || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(s.estado)}`}>
                        {getEstadoTexto(s.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Todos los Productos */}
      {tab === 'todos' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumo Diario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punto Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.stock_actual} {p.um}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.consumo_diario}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.punto_pedido}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(p.estado)}`}>
                      {getEstadoTexto(p.estado)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}