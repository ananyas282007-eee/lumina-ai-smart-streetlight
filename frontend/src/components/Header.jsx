/**
 * LUMINA AI – Header / Navigation bar component
 */
import { useState, useEffect } from 'react'
import { useHealth } from '../hooks/useData'

/* Simple SVG icon wrappers */
const LightbulbIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
)

export default function Header({ modelReady }) {
  const { data: health } = useHealth()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const isOnline = health?.status === 'online'

  return (
    <header style={styles.header}>
      {/* Glow line at top */}
      <div style={styles.topGlow} />

      <div style={styles.inner}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>
              <LightbulbIcon />
            </div>
            <div style={styles.logoRing} />
          </div>
          <div>
            <h1 style={styles.title}>
              <span className="gradient-text">LUMINA AI</span>
            </h1>
            <p style={styles.subtitle}>Smart Streetlight Energy Optimisation System</p>
          </div>
        </div>

        {/* Status indicators */}
        <div style={styles.statusArea}>
          {/* Backend status */}
          <div style={styles.statusPill}>
            <span
              className={`pulse-dot ${isOnline ? 'pulse-green' : 'pulse-red'}`}
              style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}
            />
            <span style={styles.statusLabel}>
              {isOnline ? 'Backend Online' : 'Backend Offline'}
            </span>
          </div>

          {/* Model status */}
          <div style={styles.statusPill}>
            <span
              className={`pulse-dot ${modelReady ? 'pulse-cyan' : 'pulse-amber'}`}
              style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}
            />
            <span style={styles.statusLabel}>
              {modelReady ? 'AI Model Ready' : 'AI Training…'}
            </span>
          </div>

          {/* Clock */}
          <div style={styles.clock}>
            <span className="mono" style={{ color: 'var(--cyan-300)', fontSize: '0.85rem', fontWeight: 600 }}>
              {time.toLocaleTimeString()}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Prototype notice bar */}
      <div style={styles.noticeBanner}>
        <span style={{ color: 'var(--amber-400)', fontSize: '0.7rem', fontWeight: 600 }}>⚠ SOFTWARE PROTOTYPE</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 8 }}>
          All sensor readings are simulated estimates — no physical hardware connected.
        </span>
      </div>
    </header>
  )
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(2, 8, 24, 0.9)',
    borderBottom: '1px solid var(--glass-border)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
  topGlow: {
    height: 2,
    background: 'linear-gradient(90deg, transparent, var(--cyan-500), var(--blue-500), var(--green-500), transparent)',
  },
  inner: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logoWrap: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.25))',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--cyan-400)',
    position: 'relative',
    zIndex: 1,
  },
  logoRing: {
    position: 'absolute',
    inset: -3,
    borderRadius: 17,
    border: '1px solid transparent',
    background: 'linear-gradient(135deg, var(--cyan-500), var(--blue-600)) border-box',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'destination-out',
    maskComposite: 'exclude',
    opacity: 0.6,
    animation: 'glowPulse 3s ease-in-out infinite',
  },
  title: {
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: 2,
  },
  statusArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(6, 13, 31, 0.6)',
    border: '1px solid var(--border-subtle)',
  },
  statusLabel: {
    fontSize: '0.78rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  clock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  noticeBanner: {
    background: 'rgba(251, 191, 36, 0.04)',
    borderTop: '1px solid rgba(251, 191, 36, 0.1)',
    padding: '5px 24px',
    textAlign: 'center',
  },
}
