# ⚽ Futbolito Monad Blitz

> Hackathon: Monad Blitz CDMX 2026 | Bounty: Etherfuse $3,500 MXN

Juego de pinball/futbolito on-chain en Monad con integración nativa de **Etherfuse** como on/off ramp en MXN vía SPEI.

## Contrato desplegado ✅

- **Red:** Monad Testnet (Chain ID: 10143)
- **Dirección:** `0x733177De022870Eb7Cfd0B72fAC63F53a1F96f48`
- **TX Deploy:** `0x2bcfbcab7cbbe91b5d0b1aa406914651126613ebd1c5fc433568642aa06caf69`
- **Explorer:** https://testnet.monadexplorer.com/address/0x733177De022870Eb7Cfd0B72fAC63F53a1F96f48

## El problema

Los juegos Web3 son inaccesibles en México — requieren crypto previa y no hay forma fácil de entrar/salir con MXN.

## La solución

Futbolito Monad Blitz permite:
- 💰 **Comprar créditos con MXN** via Etherfuse on-ramp (SPEI)
- ⚽ **Jugar** el clásico futbolito/pinball en el browser
- 🏦 **Retirar ganancias en MXN** via Etherfuse off-ramp (SPEI)
- 🔗 **Todo registrado on-chain** en Monad testnet

## Stack

- **Frontend:** React + Vite + Matter.js
- **Backend:** Node.js + Express
- **Smart Contract:** Solidity en Monad Testnet
- **On/Off Ramp:** Etherfuse FX API (MXN ↔ USDC via SPEI)

## Flujo Etherfuse

```
Usuario paga MXN (SPEI) → Etherfuse on-ramp → Backend confirma webhook
→ depositCredits() en contrato → Usuario juega → redeemCredits()
→ Etherfuse off-ramp → MXN en cuenta bancaria del jugador
```

## Cómo correr

```bash
# Backend
cd backend && cp .env.example .env
# Edita .env con ETHERFUSE_API_KEY
node server.js

# Frontend
cd frontend && npm install && npm run dev
```
