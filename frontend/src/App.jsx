/**
 * LUMINA AI – Main Dashboard Application
 * =========================================
 * Assembles all components into the full dashboard.
 * Data is fetched from the FastAPI backend via React hooks.
 *
 * SOFTWARE PROTOTYPE – all sensor values are simulated.
 */
import { useState, useCallback } from 'react'
import { useDashboard, usePredictions } from './hooks/useData'
import Header      from './components/Header'
import StatCards   from './components/StatCards'
import NodeTable   from './components/NodeTable'
import EnergyCharts from './components/EnergyCharts'
import AIInsights  from './components/AIInsights'
import SensorMonitor from './components/SensorMonitor'
import SimControls from './components/SimControls'

/* ── Section wrapper ── */
function Section({ title, children, style }) {
  return (
    <section style={{ marginBottom: 28, ...style }}>
      {title && (
        <h2 style={{
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 700,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          {title}
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </h2>
      )}
      {children}
    </section>
  )
}

/* ── Error banner ── */
function ErrorBanner({ message }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderRadius: 12,
      background: 'rgba(248,113,113,0.08)',
      border: '1px solid rgba(248,113,113,0.25)',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    }}>
      <span style={{ fontSize: '1.3rem' }}>⚠️</span>
      <div>
        <p style={{ color: 'var(--red-400)', fontSize: '0.9rem', fontWeight: 600 }}>
          Backend Connection Error
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
          {message}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>
          💡 Make sure the FastAPI server is running:
          <code style={{
            background: 'rgba(148,174,212,0.1)',
            padding: '2px 6px',
            borderRadius: 4,
            marginLeft: 6,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
          }}>
            cd backend &amp;&amp; venv\Scripts\uvicorn main:app --reload
          </code>
        </p>
      </div>
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const { data: dashboard, loading, error, refetch } = useDashboard()
  const { data: predictions, loading: predLoading }  = usePredictions()
  const [manualUpdate, setManualUpdate] = useState(null)

  // When a manual update comes from SimControls, merge it in
  const handleSimUpdate = useCallback((result) => {
    setManualUpdate(result)
    refetch()   // Also trigger the dashboard poll immediately
  }, [refetch])

  // Resolve data: prefer manual update if fresh, else dashboard
  const activeData = manualUpdate || dashboard
  const nodes   = activeData?.nodes   || []
  const energy  = activeData?.energy  || null
  const sensors = activeData?.sensors || null
  const insights = activeData?.insights || []
  const modelReady = activeData?.model_ready ?? false

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Header ── */}
      <Header modelReady={modelReady} />

      {/* ── Main content ── */}
      <main style={styles.main}>

        {/* Connection error */}
        {error && !loading && <ErrorBanner message={error} />}

        {/* Loading splash */}
        {loading && !activeData && (
          <div style={styles.loadingSplash}>
            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3 }} />
            <div>
              <p style={{ color: 'var(--cyan-400)', fontSize: '1rem', fontWeight: 600 }}>
                Connecting to LUMINA AI backend…
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
                Starting simulation engine and AI model.
              </p>
            </div>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <Section title="System Overview">
          <StatCards energy={energy} loading={loading} />
        </Section>

        {/* ── Sensor + Controls row ── */}
        <Section title="Sensor Monitoring & Controls">
          <div style={styles.twoCol}>
            <SensorMonitor sensors={sensors} loading={loading} />
            <SimControls onUpdate={handleSimUpdate} />
          </div>
        </Section>

        {/* ── AI Insights ── */}
        <Section title="AI Optimisation">
          <AIInsights
            insights={insights}
            modelReady={modelReady}
            predictions={predictions}
            loading={predLoading}
          />
        </Section>

        {/* ── Charts ── */}
        <Section title="Energy & Brightness Analytics">
          <EnergyCharts nodes={nodes} energy={energy} loading={loading} />
        </Section>

        {/* ── Node Table ── */}
        <Section title="Streetlight Node Status">
          <NodeTable nodes={nodes} loading={loading} />
        </Section>

        {/* ── Footer ── */}
        <footer style={styles.footer}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center' }}>
            LUMINA AI • AI-Based Smart Streetlight Energy Optimisation System •{' '}
            <span style={{ color: 'var(--amber-400)' }}>Software-only prototype</span> •
            All sensor readings simulated • No physical hardware connected
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'center', marginTop: 4 }}>
            Built with Python 3 · FastAPI · Scikit-learn (Random Forest) · React · Recharts
          </p>
        </footer>
      </main>
    </div>
  )
}

const styles = {
  main: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '28px 24px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 16,
  },
  loadingSplash: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '24px',
    marginBottom: 24,
    borderRadius: 12,
    background: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid rgba(6, 182, 212, 0.15)',
  },
  footer: {
    marginTop: 40,
    paddingTop: 24,
    borderTop: '1px solid var(--border-subtle)',
  },
}
