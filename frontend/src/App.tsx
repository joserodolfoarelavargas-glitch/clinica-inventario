import React from 'react';
import Reportes from './pages/admin/Reportes';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Productos from './pages/admin/Productos';
import Solicitudes from './pages/admin/Solicitudes';
import DashboardResponsable from './pages/responsable/DashboardResponsable';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactElement; adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.rol !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.rol === 'admin' ? <AdminDashboard /> : <DashboardResponsable />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/productos"
        element={
          <ProtectedRoute adminOnly>
            <div className="min-h-screen bg-gray-100">
              <nav className="bg-white shadow-md px-4 py-3 flex items-center">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Volver
                </button>
                <h1 className="text-xl font-bold text-gray-800">ClínicaInventory - Productos</h1>
              </nav>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <Productos />
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/solicitudes"
        element={
          <ProtectedRoute adminOnly>
            <div className="min-h-screen bg-gray-100">
              <nav className="bg-white shadow-md px-4 py-3 flex items-center">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Volver
                </button>
                <h1 className="text-xl font-bold text-gray-800">ClínicaInventory - Solicitudes</h1>
              </nav>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <Solicitudes />
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute adminOnly>
            <div className="min-h-screen bg-gray-100">
              <nav className="bg-white shadow-md px-4 py-3 flex items-center">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Volver
                </button>
                <h1 className="text-xl font-bold text-gray-800">ClínicaInventory - Reportes</h1>
              </nav>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <Reportes />
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto: redirige a dashboard o login */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Ruta para cualquier otra URL no encontrada */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;