import { useEffect, useState } from 'react';
import { getPendientes, getAprobadas, getMisSolicitudes, aprobarSolicitud, entregarSolicitud, cancelarSolicitud } from '../../services/api';

export default function Solicitudes() {
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [aprobadas, setAprobadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pendientes' | 'aprobadas' | 'historial'>('pendientes');

  useEffect(() => {
    cargarSolicitudes();
  }, [tab]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      if (tab === 'pendientes') {
        const data = await getPendientes();
        setPendientes(data);
      } else if (tab === 'aprobadas') {
        const data = await getAprobadas();
        setAprobadas(data);
      } else {
        const data = await getMisSolicitudes();
        setPendientes(data);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: number) => {
    try {
      await aprobarSolicitud(id);
      cargarSolicitudes();
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
    }
  };

  const handleEntregar = async (id: number) => {
    try {
      await entregarSolicitud(id);
      cargarSolicitudes();
    } catch (error) {
      console.error('Error entregando solicitud:', error);
    }
  };

  const handleCancelar = async (id: number) => {
    if (confirm('¿Cancelar esta solicitud?')) {
      try {
        await cancelarSolicitud(id);
        cargarSolicitudes();
      } catch (error) {
        console.error('Error cancelando solicitud:', error);
      }
    }
  };

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

  const solicitudesMostrar = tab === 'pendientes' ? pendientes : tab === 'aprobadas' ? aprobadas : pendientes;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Solicitudes</h2>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setTab('pendientes')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'pendientes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pendientes ({pendientes.length})
        </button>
        <button
          onClick={() => setTab('aprobadas')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'aprobadas'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Aprobadas
        </button>
        <button
          onClick={() => setTab('historial')}
          className={`px-4 py-2 font-medium transition ${
            tab === 'historial'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : solicitudesMostrar.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay solicitudes</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {solicitudesMostrar.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{s.usuario_nombre}</td>
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
                  <td className="px-6 py-4 space-x-2">
                    {s.estado === 'Pendiente' && (
                      <button
                        onClick={() => handleAprobar(s.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Aprobar
                      </button>
                    )}
                    {s.estado === 'Aprobado' && (
                      <button
                        onClick={() => handleEntregar(s.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Entregar
                      </button>
                    )}
                    {(s.estado === 'Pendiente' || s.estado === 'Aprobado') && (
                      <button
                        onClick={() => handleCancelar(s.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    )}
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