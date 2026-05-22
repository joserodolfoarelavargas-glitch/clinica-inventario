import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH ============
export const login = async (correo: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', correo);
  params.append('password', password);
  
  const response = await axios.post(`${API_BASE_URL}/auth/login`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ============ PRODUCTOS ============
export const getProductos = async () => {
  const response = await api.get('/productos/');
  return response.data;
};

export const createProducto = async (producto: any) => {
  const response = await api.post('/productos/', producto);
  return response.data;
};

export const updateProducto = async (id: number, producto: any) => {
  const response = await api.put(`/productos/${id}`, producto);
  return response.data;
};

export const deleteProducto = async (id: number) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

export const getSugerencias = async () => {
  const response = await api.get('/productos/sugerencias');
  return response.data;
};

// ============ SOLICITUDES ============
export const createSolicitud = async (solicitud: any) => {
  const response = await api.post('/solicitudes/', solicitud);
  return response.data;
};

export const getMisSolicitudes = async () => {
  const response = await api.get('/solicitudes/mis');
  return response.data;
};

export const getPendientes = async () => {
  const response = await api.get('/solicitudes/pendientes');
  return response.data;
};

export const getAprobadas = async () => {
  const response = await api.get('/solicitudes/aprobadas');
  return response.data;
};

export const aprobarSolicitud = async (id: number) => {
  const response = await api.patch(`/solicitudes/${id}/aprobar`);
  return response.data;
};

export const entregarSolicitud = async (id: number) => {
  const response = await api.patch(`/solicitudes/${id}/entregar`);
  return response.data;
};

export const cancelarSolicitud = async (id: number) => {
  const response = await api.patch(`/solicitudes/${id}/cancelar`);
  return response.data;
};

// ============ RECEPCIONES ============
export const createRecepcion = async (recepcion: any) => {
  const response = await api.post('/recepciones/', recepcion);
  return response.data;
};

export const getRecepciones = async () => {
  const response = await api.get('/recepciones/');
  return response.data;
};

// ============ USUARIOS ============
export const getUsuarios = async () => {
  const response = await api.get('/usuarios/');
  return response.data;
};

export const createUsuario = async (usuario: any) => {
  const response = await api.post('/usuarios/', usuario);
  return response.data;
};

// ============ REPORTES ============
export const getResumenInventario = async () => {
  const response = await api.get('/reportes/resumen');
  return response.data;
};

export const getReporteConsumo = async (dias: number = 30) => {
  const response = await api.get(`/reportes/consumo?dias=${dias}`);
  return response.data;
};

export default api;