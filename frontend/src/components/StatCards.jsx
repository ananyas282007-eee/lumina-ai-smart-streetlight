/**
 * LUMINA AI – KPI / Stat cards row
 * Shows: Total Nodes, Active Lights, Current Power, Energy Saved, Avg Brightness
 */

/* Icon helpers */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const CARDS = [
  {
    key: 'total_nodes',
    label: 'Total Nodes',
    unit: '',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    color: 'var(--blue-400)',
    glow: 'rgba(96,165,250,0.3)',
    bg: 'rgba(59,130,246,0.08)',
  },
  {
    key: 'active_nodes',
    label: 'Active Lights',
    unit: '',
    icon: 'M9 18l6-6-6-6',
    color: 'var(--green-400)',
    glow: 'rgba(74,222,128,0.3)',
    bg: 'rgba(34,197,94,0.08)',
    iconPath: 'M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14',
  },
  {
    key: 'current_power_w',
    label: 'Current Power',
    unit: ' W',
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    color: 'var(--amber-400)',
    glow: 'rgba(251,191,36,0.3)',
    bg: 'rgba(245,158,11,0.08)',
  },
  {
    key: 'saved_energy_kwh_per_hour',
    label: 'Energy Saved',
    unit: ' kWh/h',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    color: 'var(--cyan-400)',
    glow: 'rgba(34,211,238,0.3)',
    bg: 'rgba(6,182,212,0.08)',
  },
  {
    key: 'savings_percentage',
    label: 'AI Savings',
    unit: '%',
    icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14',
    color: 'var(--purple-400)',
    glow: 'rgba(192,132,252,0.3)',
    bg: 'rgba(168,85,247,0.08)',
  },
]

export default function StatCards({ energy, loading }) {
  if (loading && !energy) {
    return (
      <div style={styles.grid}>
        {CARDS.map((c) => (
          <SkeletonCard key={c.key} color={c.color} bg={c.bg} label={c.label} />
        ))}
      </div>
    )
  }

  return (
    <div style={styles.grid} className="animate-fade">
      {CARDS.map((card) => {
        const raw = energy?.[card.key] ?? 0
        const value = typeof raw === 'number' ? raw : 0
        const display = card.unit === ' %' || card.key === 'savings_percentage'
          ? `${value.toFixed(1)}%`
          : card.unit === ' W'
            ? `${value.toFixed(1)} W`
            : card.unit === ' kWh/h'
              ? `${value.toFixed(4)} kWh/h`
              : value

        const iconPath = card.iconPath || card.icon

        return (
          <div key={card.key} className="card" style={{ ...styles.card, background: card.bg }}>
            {/* Icon */}
            <div style={{ ...styles.iconBox, background: card.bg, boxShadow: `0 0 20px ${card.glow}` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={iconPath} />
              </svg>
            </div>

            {/* Value */}
            <div style={styles.valueRow}>
              <span className="mono" style={{ ...styles.value, color: card.color }}>
                {loading ? '—' : display}
              </span>
              {card.key === 'savings_percentage' && !loading && (
                <span style={{ ...styles.badge, background: card.bg, color: card.color }}>
                  vs baseline
                </span>
              )}
            </div>

            {/* Label */}
            <span style={styles.label}>{card.label}</span>

            {/* Subtle bottom bar */}
            <div style={{ ...styles.bottomBar, background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
          </div>
        )
      })}
    </div>
  )
}

function SkeletonCard({ color, bg, label }) {
  return (
    <div className="card" style={{ ...styles.card, background: bg }}>
      <div style={{ ...styles.iconBox, background: bg, opacity: 0.4 }} />
      <div style={{ height: 36, width: '60%', background: 'rgba(148,174,212,0.1)', borderRadius: 8, marginTop: 12 }} />
      <span style={styles.label}>{label}</span>
      <div style={{ ...styles.bottomBar, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: 0.3 }} />
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
  },
  card: {
    padding: '20px 22px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    cursor: 'default',
    minWidth: 0,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 999,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  label: {
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
}
