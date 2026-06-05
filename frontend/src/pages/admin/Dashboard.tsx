﻿import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getResumenInventario } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
        <div className="min-h-screen bg-[#F3F4F6]">
            <nav className="bg-[#1e3a5f] shadow-md text-white">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold leading-tight">ClínicaInventory</h1>
                        <small className="text-[10px] opacity-70">Sistema de Gestión de Inventario</small>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold leading-none">{user?.nombre}</p>
                            <p className="text-[10px] opacity-70">{user?.email}</p>
                        </div>
                        <button onClick={logout} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm transition-colors border border-white/20">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Dashboard de Inventario</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Total Productos</div>
                        <div className="text-3xl font-bold text-[#1e3a5f]">{resumen?.total_productos || 0}</div>
                        <div className="text-[10px] text-gray-400 mt-1">En catálogo activo</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-t-4 border-t-red-500">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Críticos</div>
                        <div className="text-3xl font-bold text-red-600">{resumen?.criticos || 0}</div>
                        <div className="text-[10px] text-gray-400 mt-1">Requieren pedido urgente</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-t-4 border-t-yellow-500">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">En Alerta</div>
                        <div className="text-3xl font-bold text-yellow-600">{resumen?.alerta || 0}</div>
                        <div className="text-[10px] text-gray-400 mt-1">Stock por debajo del mínimo</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-t-4 border-t-green-500">
                        <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Stock OK</div>
                        <div className="text-3xl font-bold text-green-600">{resumen?.ok || 0}</div>
                        <div className="text-[10px] text-gray-400 mt-1">Niveles óptimos</div>
                    </div>
                </div>

                {/* ========== BOTONES DE NAVEGACIÓN ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">📦 Gestión de Productos</h3>
                        <p className="text-gray-600 text-sm mb-4">Crear, editar y eliminar productos. Registrar entradas de stock.</p>
                        <button
                            onClick={() => navigate('/productos')}
                            className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                        >
                            Ir a Productos →
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold mb-2">📋 Gestión de Solicitudes</h3>
                        <p className="text-gray-600 text-sm mb-4">Revisar, aprobar y entregar solicitudes de productos.</p>
                        <button
                            onClick={() => navigate('/solicitudes')}
                            className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                        >
                            Ir a Solicitudes →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold mb-2">📊 Reportes</h3>
                        <p className="text-gray-600 text-sm mb-4">Ver productos críticos, alertas y sugerencias de pedido.</p>
                        <button onClick={() => navigate('/reportes')} className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
                            Ver Reportes →
                        </button>
                    </div>
                </div>
                {/* ========================================= */}
            </div>
        </div>
    );
}