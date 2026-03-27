import { useState } from 'react'
import { useEtherfuse } from '../hooks/useEtherfuse'

export default function WithdrawCredits({ credits, onSuccess }) {
  const [amount, setAmount] = useState(50)
  const [clabe, setClabe] = useState('')
  const [quote, setQuote] = useState(null)
  const [step, setStep] = useState('input') // input | quote | done
  const { getQuote, createOrder, loading, error } = useEtherfuse()

  async function handleQuote() {
    try {
      const q = await getQuote('USDC', 'MXN', amount)
      setQuote(q)
      setStep('quote')
    } catch {}
  }

  async function handleWithdraw() {
    try {
      await createOrder({
        quoteId: quote.id || quote.quoteId,
        walletAddress: '0x0000000000000000000000000000000000000000', // TODO: wallet real
        bankAccountClabe: clabe
      })
      setStep('done')
      onSuccess && onSuccess(amount)
    } catch {}
  }

  if (credits < 50) {
    return (
      <div style={card}>
        <h3 style={{ margin: '0 0 8px', color: '#64748b', fontSize: 16 }}>💸 Retirar a cuenta</h3>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
          Necesitas al menos 50 créditos para retirar.
        </p>
      </div>
    )
  }

  return (
    <div style={card}>
      <h3 style={{ margin: '0 0 16px', color: '#3b82f6', fontSize: 16 }}>💸 Retirar a cuenta MXN</h3>

      {step === 'input' && (
        <>
          <label style={label}>Créditos a retirar (max {credits})</label>
          <input
            type="number" min={50} max={credits} step={50} value={amount}
            onChange={e => setAmount(Math.min(credits, Number(e.target.value)))}
            style={input}
          />
          <div style={hint}>≈ MXN {amount} por SPEI</div>
          <label style={{ ...label, marginTop: 12 }}>CLABE bancaria (18 dígitos)</label>
          <input
            type="text" placeholder="000000000000000000" maxLength={18}
            value={clabe} onChange={e => setClabe(e.target.value.replace(/\D/g, '').slice(0, 18))}
            style={input}
          />
          <button
            onClick={handleQuote}
            disabled={loading || amount < 50 || clabe.length !== 18}
            style={btnBlue}
          >
            {loading ? 'Calculando...' : 'Ver cotización →'}
          </button>
        </>
      )}

      {step === 'quote' && quote && (
        <>
          <div style={infoBox}>
            <div style={row}><span>Retiras:</span><strong>{amount} créditos</strong></div>
            <div style={row}><span>Recibes:</span><strong>MXN {quote.targetAmount || amount}</strong></div>
            <div style={row}><span>CLABE:</span><code style={code}>{clabe}</code></div>
            <div style={{ ...row, color: '#94a3b8', fontSize: 12 }}>
              <span>Tiempo estimado:</span><span>1-2 días hábiles</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep('input')} style={btnGray}>← Atrás</button>
            <button onClick={handleWithdraw} disabled={loading} style={btnBlue}>
              {loading ? 'Procesando...' : 'Confirmar retiro ✓'}
            </button>
          </div>
        </>
      )}

      {step === 'done' && (
        <div style={{ ...infoBox, borderColor: '#3b82f6', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <p style={{ color: '#93c5fd', fontWeight: 600, margin: '0 0 4px' }}>¡Retiro en proceso!</p>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            MXN {amount} llegarán a tu CLABE en 1-2 días hábiles vía SPEI.
          </p>
          <button onClick={() => setStep('input')} style={{ ...btnBlue, marginTop: 14 }}>
            Nuevo retiro
          </button>
        </div>
      )}

      {error && <div style={errBox}>⚠️ {error}</div>}
    </div>
  )
}

const card = { background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155' }
const label = { display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }
const input = {
  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #475569',
  background: '#0f172a', color: '#f1f5f9', fontSize: 15, boxSizing: 'border-box', marginBottom: 6
}
const hint = { color: '#64748b', fontSize: 12, marginBottom: 14 }
const btnBlue = {
  flex: 1, width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
  background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4
}
const btnGray = {
  flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
  background: '#334155', color: '#94a3b8', fontWeight: 600, cursor: 'pointer'
}
const infoBox = { background: '#0f172a', borderRadius: 8, padding: 14, border: '1px solid #334155', marginBottom: 12 }
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', color: '#cbd5e1', fontSize: 14 }
const code = { background: '#1e293b', padding: '2px 6px', borderRadius: 4, color: '#60a5fa', fontFamily: 'monospace', fontSize: 12 }
const errBox = { background: '#450a0a', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 13 }
