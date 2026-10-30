/**
 * LUMINA AI – Simulation Controls Panel
 * Allows manual triggering of simulation updates and model retraining.
 */
import { useState } from 'react'
import { apiService } from '../services/api'

export default function SimControls({ onUpdate }) {
  const [updating, setUpdating]   = useState(false)
  const [training, setTraining]   = useState(false)
  const [lastAction, setLastAction] = useState(null)
  const [error, setError]         = useState(null)

  async function handleUpdate() {
    setUpdating(true)
    setError(null)
    try {
      const result = await apiService.triggerUpdate()
      setLastAction({ type: 'update', time: new Date().toLocaleTimeString(), message: 'Simulation updated successfully.' })
      if (onUpdate) onUpdate(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  async function handleRetrain() {
    setTraining(true)
    setError(null)
    try {
      const result = await apiService.triggerTraining()
      setLastAction({ type: 'train', time: new Date().toLocaleTimeString(), message: result.message || 'Training started.' })
    } catch (err) {
      setError(err.message)
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="card animate-fade" style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🎛️ Simulation Controls</h3>
          <p style={styles.subtitle}>Manually trigger simulation updates or model retraining</p>
        </div>
        <span className="badge badge-online">Live</span>
      </div>

      <div style={styles.buttons}>
        {/* Update button */}
        <button
          className="btn btn-primary"
          onClick={handleUpdate}
          disabled={updating}
          id="btn-update-simulation"
          style={{ flex: 1, minWidth: 160 }}
        >
          {updating ? (
            <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Updating…</>
          ) : (
            <><span>🔄</span> Update Simulation</>
          )}
        </button>

        {/* Retrain button */}
        <button
          className="btn btn-secondary"
          onClick={handleRetrain}
          disabled={training}
          id="btn-retrain-model"
          style={{ flex: 1, minWidth: 160 }}
        >
          {training ? (
            <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: 'var(--cyan-400)' }} /> Starting…</>
          ) : (
            <><span>🤖</span> Re-train AI Model</>
          )}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div style={styles.errorBox}>
          <span style={{ color: 'var(--red-400)', fontSize: '0.8rem' }}>
            ❌ {error}
          </span>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>
            Make sure the FastAPI backend is running on port 8000.
          </p>
        </div>
      )}

      {lastAction && !error && (
        <div style={styles.successBox}>
          <span style={{ color: 'var(--green-400)', fontSize: '0.8rem' }}>
            ✅ [{lastAction.time}] {lastAction.message}
          </span>
        </div>
      )}

      {/* Info */}
      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>⏱️</span>
          <div>
            <p style={styles.infoLabel}>Auto-refresh</p>
            <p style={styles.infoValue}>Every 15 seconds</p>
          </div>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>🔧</span>
          <div>
            <p style={styles.infoLabel}>Update cycle</p>
            <p style={styles.infoValue}>30 s (backend)</p>
          </div>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>🌐</span>
          <div>
            <p style={styles.infoLabel}>API endpoint</p>
            <p style={styles.infoValue} className="mono">localhost:8000</p>
          </div>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>🏷️</span>
          <div>
            <p style={styles.infoLabel}>Data type</p>
            <p style={styles.infoValue}>Simulated only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: 3,
  },
  buttons: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  errorBox: {
    padding: '12px 14px',
    borderRadius: 8,
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    marginBottom: 12,
  },
  successBox: {
    padding: '10px 14px',
    borderRadius: 8,
    background: 'rgba(74,222,128,0.08)',
    border: '1px solid rgba(74,222,128,0.2)',
    marginBottom: 12,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 10,
    marginTop: 4,
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(148,174,212,0.04)',
    border: '1px solid rgba(148,174,212,0.08)',
  },
  infoIcon: {
    fontSize: '1rem',
    flexShrink: 0,
    paddingTop: 2,
  },
  infoLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
}
