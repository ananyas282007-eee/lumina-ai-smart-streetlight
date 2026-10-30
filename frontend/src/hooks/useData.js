/**
 * LUMINA AI – Custom React hooks for data fetching.
 * All data returned from the API is simulated.
 */
import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../services/api'

// ── Generic polling hook ──
function usePolling(fetchFn, interval = 30000, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch()                              // Initial fetch
    const id = setInterval(fetch, interval)
    return () => clearInterval(id)
  }, [fetch, interval])

  return { data, loading, error, refetch: fetch }
}

// ── Dashboard summary (polls every 15 s for live feel) ──
export function useDashboard() {
  return usePolling(() => apiService.getDashboard(), 15000)
}

// ── All nodes ──
export function useNodes() {
  return usePolling(() => apiService.getNodes(), 15000)
}

// ── Energy stats ──
export function useEnergy() {
  return usePolling(() => apiService.getEnergy(), 20000)
}

// ── AI Predictions ──
export function usePredictions() {
  return usePolling(() => apiService.getPredictions(), 20000)
}

// ── Health check ──
export function useHealth() {
  return usePolling(() => apiService.getHealth(), 30000)
}
