/**
 * LUMINA AI – Sensor Monitor Panel
 * Shows aggregated simulated sensor readings.
 */

function SensorGauge({ label, value, unit, max, color, icon }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div style={styles.gaugeCard}>
      <div style={styles.gaugeTop}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={styles.gaugeLabel}>{label}</p>
          <p className="mono" style={{ ...styles.gaugeValue, color }}>
            {typeof value === 'number'
              ? value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(1)
              : value}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>{unit}</span>
          </p>
        </div>
      </div>
      <div style={styles.gaugeBar}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          transition: 'width 0.6s ease',
          boxShadow: `0 0 8px ${color}44`,
        }} />
      </div>
    </div>
  )
}

export default function SensorMonitor({ sensors, loading }) {
  if (loading && !sensors) {
    return (
      <div className="card" style={styles.wrapper}>
        <h3 style={styles.title}>📊 Sensor Monitoring</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <div className="spinner" />
          <span style={{ color: 'var(--text-muted)' }}>Reading sensors…</span>
        </div>
      </div>
    )
  }

  const s = sensors || {}

  return (
    <div className="card animate-fade" style={styles.wrapper}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={styles.title}>📊 Sensor Monitoring</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
            Simulated LDR · PIR · Traffic sensors
          </p>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          {s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : '—'}
        </span>
      </div>

      <div style={styles.gaugeGrid}>
        <SensorGauge
          label="Avg Ambient Light"
          value={s.avg_ambient_lux || 0}
          unit="lux"
          max={80000}
          color="var(--amber-400)"
          icon="☀️"
        />
        <SensorGauge
          label="Max Ambient Light"
          value={s.max_ambient_lux || 0}
          unit="lux"
          max={80000}
          color="var(--cyan-400)"
          icon="🔆"
        />
        <SensorGauge
          label="Min Ambient Light"
          value={s.min_ambient_lux || 0}
          unit="lux"
          max={80000}
          color="var(--blue-400)"
          icon="🌙"
        />
        <SensorGauge
          label="Avg Traffic Density"
          value={(s.avg_traffic_density || 0) * 100}
          unit="%"
          max={100}
          color="var(--red-400)"
          icon="🚗"
        />
      </div>

      {/* Motion detection summary */}
      <div style={styles.motionRow}>
        <div style={styles.motionCard}>
          <span style={{ fontSize: '1.4rem' }}>🚶</span>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nodes with Motion</p>
            <p className="mono" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--green-400)', lineHeight: 1 }}>
              {s.motion_detected_count ?? '—'}
            </p>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            PIR (Passive Infrared) sensors detect pedestrian and vehicle motion.
            When motion is detected, the AI increases brightness for safety.
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            ⓘ Simulated motion events — no physical sensors connected.
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    padding: '24px',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  gaugeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },
  gaugeCard: {
    padding: '14px 16px',
    borderRadius: 10,
    background: 'rgba(148,174,212,0.04)',
    border: '1px solid rgba(148,174,212,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  gaugeTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  gaugeLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: 2,
  },
  gaugeValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  gaugeBar: {
    height: 5,
    borderRadius: 999,
    background: 'rgba(148,174,212,0.1)',
    overflow: 'hidden',
  },
  motionRow: {
    display: 'flex',
    gap: 16,
    padding: '16px',
    borderRadius: 10,
    background: 'rgba(74,222,128,0.05)',
    border: '1px solid rgba(74,222,128,0.15)',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  motionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 120,
  },
}
