/**
 * LUMINA AI – Energy Charts component
 * Uses Recharts to visualize power consumption and brightness distribution.
 */
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie
} from 'recharts'

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(6, 13, 31, 0.95)',
      border: '1px solid var(--glass-border)',
      borderRadius: 10,
      padding: '10px 14px',
      backdropFilter: 'blur(12px)',
    }}>
      {label && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 6 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.82rem', fontFamily: "'JetBrains Mono', monospace" }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</strong>
          {p.unit || ''}
        </p>
      ))}
    </div>
  )
}

/* ── Brightness Bar Chart ── */
function BrightnessChart({ nodes }) {
  const data = (nodes || []).map(n => ({
    id: n.node_id,
    Current: parseFloat(n.current_brightness.toFixed(1)),
    Recommended: parseFloat(n.recommended_brightness.toFixed(1)),
  }))

  return (
    <div style={styles.chartCard} className="card">
      <h3 style={styles.chartTitle}>💡 Brightness: Current vs AI Recommended</h3>
      <p style={styles.chartSub}>Per-node comparison (simulated, %)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,174,212,0.08)" vertical={false} />
          <XAxis dataKey="id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Bar dataKey="Current" name="Current" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Recommended" name="AI Recommended" fill="#a855f7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Power Consumption Bar Chart ── */
function PowerChart({ nodes }) {
  const data = (nodes || []).map(n => ({
    id: n.node_id,
    Power: parseFloat(n.power_consumption_w.toFixed(2)),
    Baseline: 100,
  }))

  return (
    <div style={styles.chartCard} className="card">
      <h3 style={styles.chartTitle}>⚡ Power Consumption vs Baseline</h3>
      <p style={styles.chartSub}>Per-node actual vs 100 W baseline (simulated estimates)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,174,212,0.08)" vertical={false} />
          <XAxis dataKey="id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit=" W" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Bar dataKey="Baseline" name="100 W Baseline" fill="rgba(248,113,113,0.3)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Power" name="Current Power" fill="#4ade80" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.Power > 75 ? '#f87171' : entry.Power > 40 ? '#fbbf24' : '#4ade80'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Energy Donut (baseline vs optimised vs saved) ── */
function EnergyDonut({ energy }) {
  if (!energy) return null

  const optimised = parseFloat((energy.current_energy_kwh_per_hour || 0).toFixed(4))
  const saved     = parseFloat((energy.saved_energy_kwh_per_hour || 0).toFixed(4))
  const data = [
    { name: 'Optimised Usage', value: optimised, color: '#22d3ee' },
    { name: 'Energy Saved',    value: saved,     color: '#4ade80' },
  ]

  return (
    <div style={styles.chartCard} className="card">
      <h3 style={styles.chartTitle}>🔋 Energy Split (kWh/hour)</h3>
      <p style={styles.chartSub}>Optimised consumption vs energy saved vs 100 W baseline</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={60} outerRadius={90}
            paddingAngle={4} dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>

      {/* Centre label */}
      <div style={{ textAlign: 'center', marginTop: -8 }}>
        <span className="mono" style={{ color: 'var(--green-400)', fontSize: '1.2rem', fontWeight: 700 }}>
          {energy.savings_percentage?.toFixed(1)}%
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
          estimated savings
        </span>
      </div>
    </div>
  )
}

/* ── Ambient Lux Bar Chart ── */
function LuxChart({ nodes }) {
  const data = (nodes || []).map(n => ({
    id: n.node_id,
    Lux: parseFloat(n.ambient_lux.toFixed(0)),
  }))

  return (
    <div style={styles.chartCard} className="card">
      <h3 style={styles.chartTitle}>☀️ Simulated Ambient Light</h3>
      <p style={styles.chartSub}>Ambient lux per node (simulated LDR sensor)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,174,212,0.08)" vertical={false} />
          <XAxis dataKey="id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Lux" name="Ambient Lux" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.Lux > 10000 ? '#fbbf24' : entry.Lux > 1000 ? '#60a5fa' : '#94aed4'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Main export ── */
export default function EnergyCharts({ nodes, energy, loading }) {
  if (loading && !nodes) {
    return (
      <div style={styles.grid}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card" style={{ ...styles.chartCard, height: 290, opacity: 0.4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
              <div className="spinner" />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading chart…</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={styles.grid} className="animate-fade">
      <BrightnessChart nodes={nodes} />
      <PowerChart nodes={nodes} />
      <EnergyDonut energy={energy} />
      <LuxChart nodes={nodes} />
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 16,
  },
  chartCard: {
    padding: '20px 22px',
    minHeight: 290,
  },
  chartTitle: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    fontWeight: 700,
    marginBottom: 4,
  },
  chartSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginBottom: 16,
  },
}
