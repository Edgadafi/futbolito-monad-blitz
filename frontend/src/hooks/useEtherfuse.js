import { useState } from 'react'

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export function useEtherfuse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function call(method, path, body) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      return data
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  // Quote: on-ramp MXN→USDC o off-ramp USDC→MXN
  const getQuote = (sourceAsset, targetAsset, amount) =>
    call('POST', '/api/quote', { sourceAsset, targetAsset, amount })

  // Crear orden con un quoteId
  const createOrder = (body) => call('POST', '/api/order', body)

  // Estado de la orden
  const getOrderStatus = (id) => call('GET', `/api/order/${id}`)

  // Registrar wallet del jugador en Etherfuse
  const registerWallet = (address, blockchain = 'ethereum') =>
    call('POST', '/api/wallet', { address, blockchain })

  return { getQuote, createOrder, getOrderStatus, registerWallet, loading, error }
}
