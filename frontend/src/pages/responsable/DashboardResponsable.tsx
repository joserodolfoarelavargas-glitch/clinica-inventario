import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProductos, createSolicitud, getMisSolicitudes } from '../../services/api';

export default function DashboardResponsable() {
  const { user, logout } = useAuth();
  const [productos, setProductos] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    producto_id: 0,
    cantidad: 0,
    comentarios: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [productosData, solicitudesData] = await Promise.all([
        getProductos(),
        getMisSolicitudes()
      ]);
      setProductos(productosData);
      setSolicitudes(solicitudesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSolicitud(formData);
      setModalAbierto(false);
      setFormData({ producto_id: 0, cantidad: 0, comentarios: '' });
      cargarDatos();
    } catch (error) {
      console.error('Error creando solicitud:', error);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'Aprobado': return 'text-blue-600 bg-blue-100';
      case 'Entregado': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">ClínicaInventory - Responsable</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.nombre} ({user?.area})</span>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Solicitudes</h2>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nueva Solicitud
          </button>
        </div>

        {/* Tabla de solicitudes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No has creado ninguna solicitud
                  </td>
                </tr>
              ) : (
                solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.producto_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{s.cantidad}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(s.estado)}`}>
                        {s.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.prioridad}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(s.fecha_solicitud).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Nueva Solicitud */}
        {modalAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Nueva Solicitud</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  value={formData.producto_id}
                  onChange={(e) => setFormData({...formData, producto_id: parseInt(e.target.value)})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value={0}>Seleccionar producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} - Stock: {p.stock_actual}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Cantidad"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />

                <textarea
                  placeholder="Comentarios (opcional)"
                  value={formData.comentarios}
                  onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Enviar Solicitud
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}