/**
 * LUMINA AI – Streetlight Nodes Table
 * Shows status of all simulated streetlight nodes.
 */

function BrightnessRing({ value }) {
  const isOff = value === 0
  const pct = Math.round(value)
  let color = 'var(--green-400)'
  if (isOff)         color = 'var(--text-muted)'
  else if (pct > 70) color = 'var(--cyan-400)'
  else if (pct > 40) color = 'var(--green-400)'
  else               color = 'var(--amber-400)'

  const circumference = 2 * Math.PI * 20  // r=20
  const offset = circumference * (1 - pct / 100)

  return (
    <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(148,174,212,0.1)" strokeWidth="4" />
        {/* Progress */}
        <circle
          cx="26" cy="26" r="20" fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={isOff ? circumference : offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '0.72rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: isOff ? 'var(--text-muted)' : color,
      }}>
        {isOff ? 'OFF' : `${pct}%`}
      </div>
    </div>
  )
}

function MotionBadge({ detected }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
      background: detected ? 'rgba(74,222,128,0.12)' : 'rgba(148,174,212,0.08)',
      color: detected ? 'var(--green-400)' : 'var(--text-muted)',
      border: `1px solid ${detected ? 'rgba(74,222,128,0.3)' : 'rgba(148,174,212,0.1)'}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: detected ? 'var(--green-400)' : 'var(--text-muted)',
        animation: detected ? 'pulse 2s infinite' : 'none',
      }} />
      {detected ? 'Detected' : 'None'}
    </span>
  )
}

function TrafficBar({ value }) {
  const pct = Math.round(value * 100)
  let color = 'var(--green-400)'
  if (pct > 70) color = 'var(--red-400)'
  else if (pct > 40) color = 'var(--amber-400)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'rgba(148,174,212,0.1)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: 30 }}>
        {pct}%
      </span>
    </div>
  )
}

export default function NodeTable({ nodes, loading }) {
  if (loading && !nodes) {
    return (
      <div className="card" style={styles.wrapper}>
        <div style={styles.header}>
          <h3 style={styles.title}>🌐 Streetlight Nodes</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 12 }}>
          <div className="spinner" />
          <span style={{ color: 'var(--text-secondary)' }}>Loading nodes…</span>
        </div>
      </div>
    )
  }

  const nodeList = nodes || []

  return (
    <div className="card animate-fade" style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🌐 Streetlight Nodes</h3>
          <p style={styles.subtitle}>Real-time simulated status for all nodes</p>
        </div>
        <div style={styles.count}>
          <span className="mono" style={{ color: 'var(--cyan-400)', fontSize: '1.4rem', fontWeight: 700 }}>
            {nodeList.filter(n => n.current_brightness > 0).length}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            /{nodeList.length} active
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Node ID</th>
              <th>Location</th>
              <th>Ambient Lux</th>
              <th>Motion</th>
              <th>Traffic</th>
              <th>Current Brightness</th>
              <th>AI Recommended</th>
              <th>Power (W)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {nodeList.map((node) => (
              <tr key={node.node_id}>
                <td>
                  <span className="mono" style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>
                    {node.node_id}
                  </span>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {node.location}
                </td>
                <td>
                  <span className="mono" style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    {node.ambient_lux > 1000
                      ? `${(node.ambient_lux / 1000).toFixed(1)}k`
                      : node.ambient_lux.toFixed(1)
                    } lx
                  </span>
                </td>
                <td>
                  <MotionBadge detected={node.motion_detected} />
                </td>
                <td>
                  <TrafficBar value={node.traffic_density} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BrightnessRing value={node.current_brightness} />
                  </div>
                </td>
                <td>
                  <span className="mono" style={{
                    color: 'var(--purple-400)', fontSize: '0.85rem', fontWeight: 600
                  }}>
                    {node.recommended_brightness.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span className="mono" style={{ color: 'var(--amber-400)', fontSize: '0.85rem' }}>
                    {node.power_consumption_w.toFixed(1)} W
                  </span>
                </td>
                <td>
                  <span className={`badge ${node.status === 'active' ? 'badge-online' : 'badge-offline'}`}>
                    {node.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'right' }}>
        ⓘ All values are simulated estimates. Assumes 100 W equivalent lamp per node.
      </p>
    </div>
  )
}

const styles = {
  wrapper: {
    padding: '24px',
    overflow: 'hidden',
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
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: 3,
  },
  count: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
}
