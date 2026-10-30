/**
 * LUMINA AI – API Service
 * Centralised Axios client for all backend API calls.
 * All data returned is simulated – no real sensors.
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Response interceptor: normalise errors ──
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Unknown API error'
    return Promise.reject(new Error(message))
  }
)

// ── API methods ──
export const apiService = {
  /** System health check */
  getHealth: () => api.get('/api/health'),

  /** Full dashboard summary (nodes + energy + sensors + insights) */
  getDashboard: () => api.get('/api/dashboard'),

  /** All streetlight nodes */
  getNodes: () => api.get('/api/nodes'),

  /** Single node by ID */
  getNode: (nodeId) => api.get(`/api/nodes/${nodeId}`),

  /** Aggregated sensor readings */
  getSensors: () => api.get('/api/sensors'),

  /** AI brightness predictions */
  getPredictions: () => api.get('/api/predictions'),

  /** Energy statistics */
  getEnergy: () => api.get('/api/energy'),

  /** Manually trigger a simulation update */
  triggerUpdate: () => api.post('/api/simulation/update'),

  /** Trigger model re-training */
  triggerTraining: () => api.post('/api/simulation/train'),

  /** Model info */
  getModelInfo: () => api.get('/api/model/info'),
}

export default api
