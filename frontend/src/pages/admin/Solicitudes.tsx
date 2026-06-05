import { useEffect, useState } from 'react';
import { getSolicitudes, updateSolicitudStatus } from '../../services/api';

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'Pendiente' | 'Aprobado' | 'Entregado'>('Pendiente');

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await getSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    try {
      await updateSolicitudStatus(id, nuevoEstado);
      await cargarSolicitudes(); // Recarga la lista en tiempo real
    } catch (error) {
      console.error(`Error al cambiar estado a ${nuevoEstado}:`, error);
    }
  };

  // Clasificación dinámica de las solicitudes recibidas desde el backend
  const pendientes = solicitudes.filter((s) => s.estado === 'Pendiente');
  const aprobadas = solicitudes.filter((s) => s.estado === 'Aprobado');
  const entregadas = solicitudes.filter((s) => s.estado === 'Entregado');

  // Selecciona qué lista mostrar dependiendo de la pestaña activa
  const solicitudesMostrar = 
    tab === 'Pendiente' ? pendientes : 
    tab === 'Aprobado' ? aprobadas : 
    entregadas;

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'text-red-600 bg-red-100';
      case 'Media': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Solicitudes</h2>
      </div>

      {/* Pestañas de Navegación (Tabs) */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setTab('Pendiente')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'Pendiente'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pendientes ({pendientes.length})
        </button>
        <button
          onClick={() => setTab('Aprobado')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'Aprobado'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Aprobadas ({aprobadas.length})
        </button>
        <button
          onClick={() => setTab('Entregado')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'Entregado'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Entregadas / Historial ({entregadas.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando solicitudes...</div>
      ) : solicitudesMostrar.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay solicitudes en esta sección</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                {tab !== 'Entregado' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudesMostrar.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{s.usuario_nombre || 'Personal de Salud'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{s.producto_nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{s.cantidad}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPrioridadColor(s.prioridad)}`}>
                      {s.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(s.estado)}`}>
                      {s.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(s.fecha_solicitud).toLocaleDateString()}
                  </td>
                  
                  {/* Renderizado condicional de acciones según el estado de la pestaña */}
                  {tab !== 'Entregado' && (
                    <td className="px-6 py-4 space-x-2">
                      {s.estado === 'Pendiente' && (
                        <>
                          <button
                            onClick={() => handleCambiarEstado(s.id, 'Aprobado')}
                            className="text-green-600 hover:text-green-800 text-sm font-medium mr-2"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(s.id, 'Rechazado')}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {s.estado === 'Aprobado' && (
                        <button
                          onClick={() => handleCambiarEstado(s.id, 'Entregado')}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-medium"
                        >
                          Marcar Entregado
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}