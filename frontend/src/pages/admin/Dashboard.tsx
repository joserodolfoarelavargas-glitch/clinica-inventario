import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getResumenInventario } from '../../services/api';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [resumen, setResumen] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resumenData = await getResumenInventario();
                setResumen(resumenData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">ClínicaInventory</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{user?.nombre}</span>
                        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-gray-500 text-sm">Total Productos</div>
                        <div className="text-3xl font-bold text-gray-800">{resumen?.total_productos || 0}</div>
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

                {/* ========== BOTONES DE NAVEGACIÓN ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">📦 Gestión de Productos</h3>
                        <p className="text-gray-600 text-sm mb-4">Crear, editar y eliminar productos. Registrar entradas de stock.</p>
                        <button
                            onClick={() => window.location.href = '/productos'}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            Ir a Productos →
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">📋 Gestión de Solicitudes</h3>
                        <p className="text-gray-600 text-sm mb-4">Revisar, aprobar y entregar solicitudes de productos.</p>
                        <button
                            onClick={() => window.location.href = '/solicitudes'}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                            Ir a Solicitudes →
                        </button>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">📊 Reportes</h3>
                        <p className="text-gray-600 text-sm mb-4">Ver productos críticos, alertas y sugerencias de pedido.</p>
                        <button onClick={() => window.location.href = '/reportes'} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                            Ver Reportes →
                        </button>
                    </div>
                </div>
                {/* ========================================= */}
            </div>
        </div>
    );
}