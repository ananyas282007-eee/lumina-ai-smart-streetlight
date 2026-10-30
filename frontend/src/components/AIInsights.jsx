/**
 * LUMINA AI – AI Insights Panel
 * Displays model status, predictions, and optimisation insights.
 */

const INSIGHT_ICONS = {
  motion:        { icon: '🚶', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  color: 'var(--green-400)' },
  saving:        { icon: '💚', bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)',  color: 'var(--cyan-400)'  },
  avg_brightness:{ icon: '💡', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  color: 'var(--amber-400)' },
  model_status:  { icon: '🤖', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)',  color: 'var(--purple-400)'},
  default:       { icon: 'ℹ️', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  color: 'var(--blue-400)'  },
}

function InsightCard({ insight }) {
  const style = INSIGHT_ICONS[insight.type] || INSIGHT_ICONS.default
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px', borderRadius: 10,
      background: style.bg, border: `1px solid ${style.border}`,
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: style.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0,
      }}>
        {style.icon}
      </div>
      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 2 }}>
        {insight.message}
      </p>
    </div>
  )
}

function ModelInfoRow({ label, value, mono = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(148,174,212,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}

export default function AIInsights({ insights, modelReady, predictions, loading }) {
  const predEntries = predictions?.predictions
    ? Object.entries(predictions.predictions)
    : []

  return (
    <div style={styles.grid}>
      {/* Insights panel */}
      <div className="card animate-fade" style={styles.panel}>
        <div style={styles.panelHeader}>
          <h3 style={styles.panelTitle}>🧠 AI Optimisation Insights</h3>
          <span className={`badge ${modelReady ? 'badge-ai' : 'badge-training'}`}>
            {modelReady ? 'AI Active' : 'Training'}
          </span>
        </div>

        {loading && !insights ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '24px 0' }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Analysing system…</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(insights || []).map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
            {!insights?.length && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>
                No insights available yet.
              </p>
            )}
          </div>
        )}

        {/* Model info */}
        {modelReady && predictions?.model_info && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>
              Model Performance (on synthetic test data)
            </h4>
            <ModelInfoRow label="Algorithm"  value="Random Forest Regressor" />
            <ModelInfoRow label="Training samples" value={(predictions.model_info.samples_trained || '—').toLocaleString()} mono />
            <ModelInfoRow label="MAE" value={`${predictions.model_info.mae ?? '—'} %`} mono />
            <ModelInfoRow label="R² Score" value={predictions.model_info.r2_score ?? '—'} mono />
            <ModelInfoRow label="Data type" value="Synthetic (simulated)" />
          </div>
        )}
      </div>

      {/* Predictions panel */}
      <div className="card animate-fade" style={styles.panel}>
        <div style={styles.panelHeader}>
          <h3 style={styles.panelTitle}>📡 AI Brightness Predictions</h3>
          <span className={`badge ${modelReady ? 'badge-ai' : 'badge-training'}`}>
            {modelReady ? 'Random Forest' : 'Heuristic fallback'}
          </span>
        </div>

        {!modelReady && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: 16 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--amber-400)' }}>
              ⏳ AI model is training. Showing heuristic recommendations.
            </p>
          </div>
        )}

        {loading && !predEntries.length ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '24px 0' }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading predictions…</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {predEntries.map(([nodeId, brightness]) => {
              const pct = Math.round(brightness)
              let color = 'var(--green-400)'
              if (pct === 0)  color = 'var(--text-muted)'
              else if (pct > 70) color = 'var(--cyan-400)'
              else if (pct < 30) color = 'var(--amber-400)'

              return (
                <div key={nodeId} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(148,174,212,0.04)',
                  border: '1px solid rgba(148,174,212,0.08)',
                }}>
                  <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 700, minWidth: 60, fontSize: '0.85rem' }}>
                    {nodeId}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(148,174,212,0.1)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 999,
                      background: `linear-gradient(90deg, ${color}, ${color}99)`,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span className="mono" style={{ color, fontWeight: 700, fontSize: '0.88rem', minWidth: 45, textAlign: 'right' }}>
                    {pct === 0 ? 'OFF' : `${pct}%`}
                  </span>
                </div>
              )
            })}
            {!predEntries.length && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0' }}>
                No predictions available yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 16,
  },
  panel: {
    padding: '24px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
    flexWrap: 'wrap',
  },
  panelTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
}
