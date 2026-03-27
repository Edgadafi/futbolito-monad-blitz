import { useState } from 'react'
import GameCanvas from './game/GameCanvas'
import BuyCredits from './components/BuyCredits'
import WithdrawCredits from './components/WithdrawCredits'

export default function App() {
  const [credits, setCredits] = useState(0)

  function handleGoal() {
    // Por cada gol se gasta 1 crédito pero se "apuesta" — en demo simplemente sumamos
    // En producción: interacción con smart contract
    console.log('¡Gol anotado!')
  }

  function handleBuy(amount) {
    setCredits(c => c + amount)
  }

  function handleWithdraw(amount) {
    setCredits(c => Math.max(0, c - amount))
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={{ fontSize: 28 }}>⚽</span>
          <div>
            <div style={styles.title}>Futbolito Monad</div>
            <div style={styles.subtitle}>powered by Etherfuse</div>
          </div>
        </div>
        <div style={styles.creditsChip}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Saldo</span>
          <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: 20 }}>
            {credits} <span style={{ fontSize: 13, color: '#64748b' }}>créditos</span>
          </span>
        </div>
      </header>

      {/* Main layout */}
      <main style={styles.main}>
        {/* Game */}
        <section style={styles.gameSection}>
          <GameCanvas
            credits={credits}
            canPlay={credits > 0}
            onGoal={handleGoal}
          />
          <div style={styles.gameHint}>
            {credits > 0
              ? '↕ Arrastra hacia abajo y suelta para disparar'
              : 'Compra créditos con MXN para jugar →'}
          </div>
        </section>

        {/* Sidebar */}
        <aside style={styles.sidebar}>
          {/* Info banner */}
          <div style={styles.banner}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
              🏆 Monad Blitz 2026 — CDMX
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
              Juega, gana créditos y retíralos en MXN directo a tu cuenta bancaria vía SPEI — sin intermediarios.
            </div>
            <div style={styles.badges}>
              <span style={badge('#8b5cf6')}>Monad Testnet</span>
              <span style={badge('#22c55e')}>Etherfuse</span>
              <span style={badge('#f59e0b')}>SPEI</span>
            </div>
          </div>

          <BuyCredits onSuccess={handleBuy} />
          <WithdrawCredits credits={credits} onSuccess={handleWithdraw} />

          {/* Flow diagram */}
          <div style={styles.flowBox}>
            <div style={styles.flowTitle}>Flujo de valor</div>
            <div style={styles.flowRow}>
              <span>💳 MXN</span>
              <span style={{ color: '#475569' }}>──────</span>
              <span>Etherfuse</span>
              <span style={{ color: '#475569' }}>──────</span>
              <span>⚽ Créditos</span>
            </div>
            <div style={{ ...styles.flowRow, marginTop: 4 }}>
              <span>🏦 SPEI</span>
              <span style={{ color: '#475569' }}>◄─────</span>
              <span>Etherfuse</span>
              <span style={{ color: '#475569' }}>◄─────</span>
              <span>🏆 Ganancias</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

function badge(color) {
  return {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    background: color + '22', color, fontSize: 12, fontWeight: 600,
    border: `1px solid ${color}44`
  }
}

const styles = {
  root: {
    minHeight: '100vh', background: '#0f172a',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    color: '#f1f5f9'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', borderBottom: '1px solid #1e293b',
    background: '#0f172a', position: 'sticky', top: 0, zIndex: 100
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 },
  subtitle: { fontSize: 12, color: '#22c55e', marginTop: 2 },
  creditsChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    background: '#1e293b', padding: '8px 16px', borderRadius: 10, gap: 2
  },
  main: {
    display: 'flex', gap: 32, padding: '32px',
    maxWidth: 960, margin: '0 auto', alignItems: 'flex-start',
    flexWrap: 'wrap', justifyContent: 'center'
  },
  gameSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  gameHint: { color: '#475569', fontSize: 13, textAlign: 'center' },
  sidebar: { flex: 1, minWidth: 280, maxWidth: 340 },
  banner: {
    background: '#1e293b', borderRadius: 12, padding: 18,
    border: '1px solid #334155', marginBottom: 16
  },
  badges: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  flowBox: {
    background: '#1e293b', borderRadius: 12, padding: 16,
    border: '1px solid #334155', marginTop: 16
  },
  flowTitle: { color: '#64748b', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  flowRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 12, color: '#94a3b8'
  }
}
