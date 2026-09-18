# Anagu — Land Administration Framework

> An integrated **Blockchain–GIS–NFT–Community Verification Oracle–MQTT** framework
> for land title registration, verification, and lawful revocation.
>
> Statutory basis: Nigeria's Land Use Act (1978), Section 28.

---

## Quick Start

```bash
# 1. Clone and enter the repo
git clone <repo-url> anagu && cd anagu

# 2. Copy environment config
cp .env.example .env
# Edit .env — at minimum, review all passwords and keys

# 3. Start all infrastructure services
docker compose up -d

# 4. Confirm all services are healthy
docker compose ps

# 5. Run database migrations (from backend)
cd apps/backend && npm install && npm run migration:run

# 6. Deploy smart contracts (from contracts/)
cd ../../contracts && npm install && npx hardhat run scripts/deploy.ts --network besu_local

# 7. Start the backend
cd ../apps/backend && npm run start:dev

# 8. Start the web frontend
cd ../web && npm install && npm run dev

# 9. Start the mobile app (requires Expo Go on device or emulator)
cd ../mobile && npm install && npx expo start
```

---

## Documentation

The complete build guide, architecture, component specs, API reference, database schema,
test procedures, and results tables are in:

**[PROJECT.md](./PROJECT.md)**

Read `PROJECT.md` first. Everything is there.

---

## Architecture

```
Next.js (web) + React Native/Expo (mobile)
            ↓
        NestJS Backend
    ┌───────────────────────┐
    │ GIS │ Oracle │ MQTT   │
    │ Blockchain │ Auth     │
    └───────────────────────┘
    ↓           ↓         ↓
PostgreSQL   Hyperledger  EMQX
+PostGIS     Besu (QBFT)  MQTT
    ↓           ↓
  Redis       MinIO
```

---

## Build Order (Do Not Skip Steps)

| Step | Component | Gate |
|------|-----------|------|
| 0 | Environment setup | All services healthy |
| 1 | GIS spatial verification | Test parcels classify correctly |
| 2 | Blockchain / NFT / revocation | 6-case test suite passes |
| 3 | Oracle + MQTT | Verification + MQTT tests pass |
| 4 | Integration | End-to-end workflow passes |
| 5 | Cross-cutting evaluation | All 8 results tables filled |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web | Next.js 14 |
| Mobile | React Native / Expo |
| Backend | NestJS (Node.js / TypeScript) |
| Database | PostgreSQL 15 + PostGIS 3 |
| Blockchain | Hyperledger Besu (PoA-QBFT-DPoS) |
| Smart Contracts | Solidity + Hardhat + OpenZeppelin |
| Messaging | MQTT — EMQX |
| Cache | Redis |
| Object Storage | MinIO |
| Containers | Docker Compose |

---

## Project Structure

```
monorepo/
├── apps/
│   ├── web/          # Next.js portal
│   ├── mobile/       # React Native (Expo) field app
│   └── backend/      # NestJS API
├── contracts/        # Solidity smart contracts
├── infra/besu/       # Hyperledger Besu config
├── docker-compose.yml
├── .env.example
├── PROJECT.md        # ← Full spec and build guide
└── README.md         # ← This file
```

---

## License

See LICENSE file.
