# $hifty50: Virtual Electronic Trading & Investment Simulation Platform

**Milestone**: Final EST Evaluation Release (100% Complete)  
**Authors**: Anurag Kumar (1024031059), Rudra Shukla (1024031057)  
**Department**: Computer Science and Engineering, Thapar Institute of Engineering and Technology  

---

## 📌 1. Project Overview & Complete Capabilities

**$hifty50** is a risk-free virtual electronic trading and investment simulation platform modeled after institutional trading platforms such as **Zerodha Kite**, **Groww**, and the **National Stock Exchange (NSE)**.

The platform is 100% implemented across all evaluation milestones:

### 🌟 Milestone 1: Core Foundation & Security (Completed)
- **Modular Monolith Backend**: Express + TypeScript with strict layer separation and global error handling.
- **Biometric KYC State Machine**: Sequential lifecycle (`REGISTERED` $\to$ `VERIFICATION_PENDING` $\to$ `VERIFIED` $\to$ `ACTIVE`).
- **Double-Entry Wallet Ledger**: Virtual ₹1,00,000 monthly capital allotment with immutable double-entry transaction history (`availableBalance + reservedBalance + investedBalance = Total Assets`).
- **Tamper-Evident Audit Logging**: Cryptographically auditable event log capturing IP, user IDs, actions, and metadata.

### 🚀 Milestone 2 & Mid-Term: Trading Engine & Settlement (Completed)
- **Custom Price-Time Priority Matching Engine**: Matches Limit & Market orders based on best price and earliest timestamp; handles partial fills seamlessly.
- **Atomic Multi-Entity Trade Settlement**: Atomically debits/credits buyer and seller wallets, charges 0.05% brokerage fees, and updates stock holdings in a single database transaction.
- **Holdings & Real-Time P&L Engine**: Real-time weighted average purchase price and floating Unrealized/Realized P&L calculation.
- **Live Order Book Depth & Spread**: Real-time Bid/Ask depth bars, spread calculations, and market liquidity.
- **Idempotent Virtual Payment Gateway**: Zero double-credit risks via `Idempotency-Key` headers and verifiable receipt issuance.

### 🏆 Final EST Milestone: Mutual Funds, Reports, Leaderboard & Admin (Completed)
- **Institutional Mutual Funds & Recurring SIP Engine**: Direct growth plans across 4 categories (Equity, Debt, Hybrid, Index), lump-sum investing, recurring automated SIP mandates (Daily, Weekly, Monthly), pause/resume/cancel state transitions, and a live evaluation demo trigger (`⚡ Trigger Now`).
- **Regulatory-Compliant Simulated Contract Notes (ECN)**: Auditable SEBI/NSE-standard simulated electronic contract notes itemizing Brokerage (0.05%), STT (0.1%), Exchange Turnover, SEBI Turnover, GST (18%), Stamp Duty, T+1 settlement dates, and net direction.
- **Tax P&L Statement**: Financial year assessment, Short-Term Capital Gains (STCG @ 20% under Finance Act 2024), gross equity turnover, and itemized realized trades.
- **Consolidated Holdings Statement**: Combined portfolio breakdown across Equities, Mutual Funds, and Liquid Cash with a visual asset allocation percentage bar.
- **Normalized Performance Leaderboard**: Fair rankings scored by percentage return:
  $$\text{Return \%} = \frac{\text{Net Worth} - 100000}{100000} \times 100$$
  with custom podium badges (👑 Grand Alpha, 🥈 Market Maven, 🥉 Bull Scalper).
- **Exchange Admin Oversight Console**: Real-time platform telemetry, ACID invariant metrics, user KYC review approvals, manual double-entry capital adjustments, and live global trade feed.
- **In-App Notification Dispatcher**: Real-time notification bell dropdown with unread badge counter for trade execution fills, SIP installment debits, KYC verification, and wallet transactions.
- **Obsidian & Neon Mint Aesthetic**: Polished, professional dark theme (`#080C14`), monospace numbers (`JetBrains Mono`), sleek borders, without any academic watermarks.

---

## 💻 2. One-Click Quick Start (Windows)

Launch both servers with a single double-click on **`run_all.bat`** in the project root:
```cmd
run_all.bat
```

Or run each service individually in separate terminals:
- **Backend (Port 5000)**:
  ```cmd
  cd backend
  npm install
  npx prisma generate
  npx prisma db push
  npm run prisma:seed
  npm run dev
  ```
- **Frontend (Port 5173)**:
  ```cmd
  cd frontend
  npm install
  npm run dev
  ```

---

## 🔑 3. Demo Credentials

All seeded accounts share the password: **`Password123!`**

| User Role | Email | Status | Description |
| :--- | :--- | :--- | :--- |
| **Active Trader** | `trader@shifty50.com` | `ACTIVE` | Primary demo user with stock holdings, MF holdings, active SIP, and trades |
| **Super Admin** | `admin@shifty50.com` | `ACTIVE` | System Administrator with Admin Console & Treasury controls |
| **Market Maker** | `marketmaker@shifty50.com` | `ACTIVE` | Exchange bot providing live bid/ask order book liquidity |
| **Ranked Competitor 1**| `priya.sharma@shifty50.com`| `ACTIVE` | #1 on the Leaderboard (+22.1% return) |
| **Ranked Competitor 2**| `vikram.malhotra@shifty50.com`| `ACTIVE` | Competitor on the Leaderboard (+0.5% return) |
| **Newbie User** | `newbie@shifty50.com` | `REGISTERED` | For testing the 4-step KYC onboarding wizard |

---

## 🧪 4. Automated Unit Test Verification

To execute all unit tests across the Wallet, Matching Engine, and SIP Services:
```cmd
cd C:\Users\BIT\.gemini\antigravity\scratch\shifty50\backend
npm test
```

### Test Results:
- `tests/wallet.service.test.ts` (Double-entry invariants, overdraft protection, ACID isolation) -> **PASS**
- `tests/matching-engine.test.ts` (Price-time priority, partial fills, atomic settlement) -> **PASS**
- `tests/sip.service.test.ts` (Next execution date calculation, minimum amounts, ledger debit, status toggles) -> **PASS**
- **Summary**: **15 / 15 tests passing across 3 test suites**.

---

## 📂 5. Directory Structure

```
shifty50/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Extended SQLite/Postgres schema (Users, Wallets, Stocks, Orders, Trades, MutualFunds, SIPs, Notifications, Audits)
│   │   └── seed.ts                    # Seeds 10 NIFTY 50 equities, 6 mutual funds, active SIPs, orders, and demo traders
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin/                 # Telemetry, user KYC review, capital adjustment, leaderboard
│   │   │   ├── auth/                  # JWT auth & KYC state machine
│   │   │   ├── market/                # Live stock catalog, sector filters, price ticks
│   │   │   ├── mutual-funds/          # Lump-sum investing, fund catalog, holdings
│   │   │   ├── notifications/         # Real-time event notifications & read status
│   │   │   ├── order/                 # Price-Time Priority Matching Engine & depth calculation
│   │   │   ├── payment/               # Idempotent payment gateway
│   │   │   ├── portfolio/             # Weighted average holdings & real-time P&L analytics
│   │   │   ├── reports/               # Contract notes (ECN), Tax P&L, consolidated statements
│   │   │   ├── sip/                   # Automated recurring SIP execution & demo trigger
│   │   │   ├── user/                  # User profile & tamper-proof audit trail
│   │   │   └── wallet/                # Double-entry ledger balance engine
│   │   ├── shared/                    # Prisma singleton, middlewares, enums, response helpers
│   │   ├── app.ts                     # Express modular application
│   │   └── server.ts                  # Server entry point
│   ├── tests/
│   │   ├── matching-engine.test.ts    # Matching engine & settlement tests
│   │   ├── sip.service.test.ts        # SIP scheduler & mutual fund tests
│   │   └── wallet.service.test.ts     # Double-entry ledger invariant tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                # TickerTape, Navbar, Sidebar, StockChart, OrderBookWidget, KycWizard, VirtualCapitalModal, etc.
│   │   ├── context/                   # AuthContext with token persistence
│   │   ├── pages/
│   │   │   ├── AdminConsole.tsx       # Platform telemetry, user KYC review, capital adjustments
│   │   │   ├── AuditLogs.tsx          # Security & audit trail
│   │   │   ├── Dashboard.tsx          # Market overview & quick metrics
│   │   │   ├── HoldingsPortfolio.tsx  # Stock holdings & P&L breakdown
│   │   │   ├── Leaderboard.tsx        # Normalized trader rankings & podium cards
│   │   │   ├── Login.tsx              # Clean FinTech authentication
│   │   │   ├── MutualFundsHub.tsx     # Fund catalog, lump-sum modal, SIP scheduler
│   │   │   ├── Register.tsx           # Account registration
│   │   │   ├── ReportsHub.tsx         # Contract notes, Tax P&L, consolidated holdings
│   │   │   ├── TradingTerminal.tsx    # Live chart, order book depth, order placement
│   │   │   └── WalletHub.tsx          # Double-entry ledger transaction history
│   │   ├── services/                  # Axios service integrations
│   │   ├── types/                     # TypeScript data schemas
│   │   └── App.tsx                    # Main navigation router
│   └── package.json
├── run_all.bat                        # Launches both backend and frontend simultaneously
├── run_backend.bat                    # Auto-seeds and launches backend on port 5000
├── run_frontend.bat                   # Launches frontend on port 5173
├── walkthrough.md                     # Comprehensive walkthrough & evaluation demo script
└── README.md
```
