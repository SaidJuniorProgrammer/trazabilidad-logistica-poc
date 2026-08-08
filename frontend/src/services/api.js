import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Resumen Ejecutivo
  getResumenKPIs: () => api.get('/api/kpis/resumen'),
  getAlertasActivas: () => api.get('/api/alertas/activas'),
  
  // Eslabón 1: Transporte
  getTransporte: (fechaIni, fechaFin, tipo) => api.get(`/api/transporte?fecha_ini=${fechaIni}&fecha_fin=${fechaFin}&tipo=${tipo}`),
  registrarTransporteSimulado: (data) => api.post('/api/evento', data),
  getClima: (lat, lon) => api.get(`/api/clima?lat=${lat}&lon=${lon}`),
  
  // Eslabón 2: Dosificación
  getDosificacion: (normativa, fecha) => api.get(`/api/dosificacion?normativa=${normativa}&fecha=${fecha}`),
  registrarDosificacion: (data) => api.post('/api/dosificacion', data),
  getRankingOperarios: () => api.get('/api/operarios/ranking'),
  
  // Auditoría Blockchain
  verificarCadena: (loteId) => api.get(`/api/blockchain/verificar/${loteId}`),
  getCadenaCompleta: (loteId) => api.get(`/api/eventos/${loteId}`)
};

export default apiService;
