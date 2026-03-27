import { useState } from 'react'
import { useEtherfuse } from '../hooks/useEtherfuse'

export default function BuyCredits({ onSuccess }) {
  const [amount, setAmount] = useState(100)
  const [quote, setQuote] = useState(null)
  const [order, setOrder] = useState(null)
  const [step, setStep] = useState('input') // input | quote | pay | done
  const { getQuote, createOrder, loading, error } = useEtherfuse()

  async function handleQuote() {
    try {
      const q = await getQuote('MXN', 'USDC', amount)
      setQuote(q)
      setStep('quote')
    } catch {}
  }

  async function handleOrder() {
    try {
      // walletAddress debería venir de wallet conectada
      const o = await createOrder({
        quoteId: quote.id || quote.quoteId,
        walletAddress: '0x0000000000000000000000000000000000000000' // TODO: wallet real
      })
      setOrder(o)
      setStep('pay')
    } catch {}
  }

  function handleDone() {
    setStep('input')
    setQuote(null)
    setOrder(null)
    onSuccess && onSuccess(Math.floor(amount))
  }

  return (
    <div style={card}>
      <h3 style={{ margin: '0 0 16px', color: '#22c55e', fontSize: 16 }}>
        💰 Comprar Créditos
      </h3>

      {step === 'input' && (
        <>
          <label style={label}>Cantidad en MXN</label>
          <input
            type="number" min={50} step={50} value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            style={input}
          />
          <div style={hint}>= {amount} créditos de juego</div>
          <button onClick={handleQuote} disabled={loading || amount < 50} style={btnGreen}>
            {loading ? 'Calculando...' : 'Ver precio →'}
          </button>
        </>
      )}

      {step === 'quote' && quote && (
        <>
          <div style={infoBox}>
            <div style={row}><span>Pagas:</span><strong>MXN {amount}</strong></div>
            <div style={row}><span>Recibes:</span><strong>{quote.targetAmount || quote.amount} USDC</strong></div>
            <div style={row}><span>Tipo de cambio:</span><span>{quote.rate || '—'}</span></div>
            <div style={{ ...row, color: '#94a3b8', fontSize: 12 }}>
              <span>Válido por:</span><span>{quote.expiresIn || '5'} min</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setStep('input')} style={btnGray}>← Atrás</button>
            <button onClick={handleOrder} disabled={loading} style={btnGreen}>
              {loading ? 'Creando...' : 'Confirmar ✓'}
            </button>
          </div>
        </>
      )}

      {step === 'pay' && order && (
        <>
          <div style={{ ...infoBox, borderColor: '#f59e0b' }}>
            <p style={{ margin: '0 0 8px', color: '#f59e0b', fontWeight: 600 }}>
              📱 Instrucciones de pago SPEI
            </p>
            <div style={row}><span>CLABE:</span><code style={code}>{order.clabe || order.bankAccount?.clabe || 'Ver app'}</code></div>
            <div style={row}><span>Monto:</span><strong>MXN {amount}</strong></div>
            <div style={row}><span>Referencia:</span><code style={code}>{order.reference || order.id || '—'}</code></div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Haz la transferencia SPEI y los créditos se acreditarán automáticamente vía webhook.
            </p>
          </div>
          <button onClick={handleDone} style={btnGreen}>
            ✅ Ya pagué — dar créditos (demo)
          </button>
        </>
      )}

      {error && <div style={errBox}>⚠️ {error}</div>}
    </div>
  )
}

// Estilos
const card = {
  background: '#1e293b', borderRadius: 12, padding: 20,
  border: '1px solid #334155', marginBottom: 16
}
const label = { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }
const input = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #475569',
  background: '#0f172a', color: '#f1f5f9', fontSize: 16, boxSizing: 'border-box',
  marginBottom: 6
}
const hint = { color: '#64748b', fontSize: 12, marginBottom: 14 }
const btnGreen = {
  width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
  background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 15,
  cursor: 'pointer', marginTop: 4
}
const btnGray = {
  flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
  background: '#334155', color: '#94a3b8', fontWeight: 600, cursor: 'pointer'
}
const infoBox = {
  background: '#0f172a', borderRadius: 8, padding: 14,
  border: '1px solid #334155', marginBottom: 12
}
const row = {
  display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', padding: '4px 0', color: '#cbd5e1', fontSize: 14
}
const code = {
  background: '#1e293b', padding: '2px 6px', borderRadius: 4,
  color: '#f59e0b', fontFamily: 'monospace', fontSize: 13
}
const errBox = {
  background: '#450a0a', color: '#fca5a5', borderRadius: 8,
  padding: '10px 14px', marginTop: 12, fontSize: 13
}
