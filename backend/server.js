const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

const EF = axios.create({
  baseURL: process.env.ETHERFUSE_BASE_URL || 'https://api.sand.etherfuse.com',
  headers: { Authorization: process.env.ETHERFUSE_API_KEY }
})

// Health
app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.ETHERFUSE_BASE_URL }))

// Activos disponibles
app.get('/api/assets', async (req, res) => {
  try {
    const { data } = await EF.get('/ramp/assets', {
      params: { blockchain: req.query.blockchain || 'ethereum' }
    })
    res.json(data)
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message, detail: e.response?.data })
  }
})

// Quote: on-ramp (MXN → USDC) u off-ramp (USDC → MXN)
// POST body: { sourceAsset, targetAsset, amount }
app.post('/api/quote', async (req, res) => {
  try {
    const { sourceAsset, targetAsset, amount } = req.body
    const { data } = await EF.get('/ramp/quote', {
      params: { sourceAsset, targetAsset, amount }
    })
    res.json(data)
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message, detail: e.response?.data })
  }
})

// Crear orden
// POST body: { quoteId, walletAddress, bankAccountId? }
app.post('/api/order', async (req, res) => {
  try {
    const { data } = await EF.post('/ramp/order', req.body)
    res.json(data)
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message, detail: e.response?.data })
  }
})

// Estado de una orden
app.get('/api/order/:id', async (req, res) => {
  try {
    const { data } = await EF.get(`/ramp/order/${req.params.id}`)
    res.json(data)
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message })
  }
})

// Webhook — Etherfuse llama aquí cuando una orden se completa
app.post('/api/webhook', (req, res) => {
  const event = req.body
  console.log('[Webhook]', event.type, JSON.stringify(event.data, null, 2))

  if (event.type === 'order_completed') {
    const { orderId, walletAddress, amount, type } = event.data || {}
    if (type === 'onramp') {
      console.log(`✅ ON-RAMP completado → wallet ${walletAddress}, orden ${orderId}, ${amount} MXN`)
      // TODO: acreditar créditos en DB o llamar al smart contract
    } else if (type === 'offramp') {
      console.log(`✅ OFF-RAMP completado → orden ${orderId}, ${amount} MXN enviados por SPEI`)
    }
  }
  res.json({ received: true })
})

// Registrar wallet del usuario en Etherfuse
app.post('/api/wallet', async (req, res) => {
  try {
    const { address, blockchain } = req.body
    const { data } = await EF.post('/ramp/wallet', {
      address,
      blockchain: blockchain || 'ethereum'
    })
    res.json(data)
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message, detail: e.response?.data })
  }
})

// Registrar CLABE bancaria para off-ramp
app.post('/api/bank-account', async (req, res) => {
  try {
    const { data } = await EF.post('/ramp/bank-account', req.body)
    res.json(data)
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.message, detail: e.response?.data })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)
  console.log(`🔑 Etherfuse URL: ${process.env.ETHERFUSE_BASE_URL || 'https://api.sand.etherfuse.com'}`)
})
