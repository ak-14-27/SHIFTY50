# $hifty50: Virtual Electronic Trading & Investment Platform
## Final EST Evaluation Milestone & Complete Platform Walkthrough

---

### Executive Overview & System Architecture

**$hifty50** is a full-stack, enterprise-grade electronic stock trading and investment simulation platform modeled after institutional trading desks (e.g., Zerodha Kite, Bloomberg Terminal, NSE NEAT). The platform adheres strictly to double-entry ledger bookkeeping, ACID transactional integrity, and price-time priority matching.

The platform is 100% complete across all three academic milestones:
1. **Evaluation 1**: Modular monolith architecture, Auth with JWT, KYC Biometric State Machine, Double-entry Wallet Ledger with ₹1,00,000 initial capital, Audit Logging.
2. **Evaluation 2 / Mid-Term**: 10 NIFTY 50 equities catalog, Price-Time Priority Matching Engine (`matching-engine.service.ts`), partial fill support, multi-entity atomic settlement, live order book depth & spread, holdings & weighted average P&L engine, idempotent payment gateway (`Idempotency-Key`).
3. **EST Final Milestone**:
   - **Mutual Funds & Automated Recurring SIP Engine**: Direct growth plans, category filtering (Equity, Debt, Hybrid, Index), lump-sum investing, recurring SIP mandates with daily/weekly/monthly auto-debit, live demo trigger (`⚡ Trigger Now`).
   - **Regulatory-Standard Contract Notes (ECN)**: Simulated NSE-compliant contract notes with full fee & tax itemization (Brokerage 0.05%, STT 0.1%, Exchange Turnover, SEBI Turnover, GST 18%, Stamp Duty, T+1 settlement).
   - **Tax P&L Statement**: FY assessment with Short-Term Capital Gains (STCG @ 20% under Finance Act 2024), gross equity turnover, itemized realized trades.
   - **Consolidated Multi-Asset Statement**: Unified portfolio across Equities, Mutual Funds, and Liquid Cash with a visual asset allocation percentage bar.
   - **Normalized Trader Leaderboard**: Performance-based rankings scored by return percentage:
     $$\text{Return \%} = \frac{\text{Net Worth} - 100000}{100000} \times 100$$
   - **Super Admin Oversight & Risk Console**: Real-time platform telemetry, ACID invariant metrics, user KYC review approvals, manual double-entry capital adjustments, and live global trade feed.
   - **In-App Real-Time Notification Center**: Bell dropdown with unread counter for trade fills, SIP debits, KYC verification, and wallet transactions.
   - **Obsidian & Neon Mint FinTech Aesthetic**: High-contrast dark theme (`#080C14`), monospace numbers (`JetBrains Mono`), sleek borders, without any academic watermarks.

---

### Demo Accounts & Credentials

All demo accounts share the password: `Password123!`

| Role / Persona | Email | Description | Starting Capital / Status |
| :--- | :--- | :--- | :--- |
| **Active Trader** | `trader@shifty50.com` | Primary demo user with stock holdings, MF holdings, active SIP, and trades | Active KYC (₹55,000 cash, ₹30,000 invested) |
| **Super Admin** | `admin@shifty50.com` | Exchange administrator with access to the Admin Console & Treasury | Active KYC (₹1,00,00,000 central treasury) |
| **Market Maker Bot**| `marketmaker@shifty50.com`| Exchange liquidity provider seeding live bid/ask limit orders on the book | Active KYC (Populates RELIANCE & INFY books) |
| **Ranked Competitor 1** | `priya.sharma@shifty50.com` | Top trader on the Leaderboard | Active KYC (+22.1% normalized return) |
| **Ranked Competitor 2** | `vikram.malhotra@shifty50.com` | Scalper on the Leaderboard | Active KYC (+0.5% normalized return) |
| **Unverified User** | `newbie@shifty50.com` | Freshly registered user for testing the 4-step KYC onboarding wizard | Registered (KYC pending) |

---

### Step-by-Step Evaluator Demo Guide

#### 1. Instant Launch via Windows Batch Scripts
Run both frontend and backend with a single click:
- Double click: `C:\Users\BIT\.gemini\antigravity\scratch\shifty50\run_all.bat`
- Or run independently:
  - Backend: `run_backend.bat` (running on `http://localhost:5000`)
  - Frontend: `run_frontend.bat` (running on `http://localhost:5173`)

#### 2. Stock Trading & Order Matching
1. Sign in as `trader@shifty50.com` / `Password123!`.
2. Navigate to **Trading Terminal**:
   - Inspect live interactive price chart for `RELIANCE` (or `INFY`, `TCS`, `HDFCBANK`).
   - Observe the live **Order Book Depth & Spread**: Bids & Asks populated in real-time.
   - Place a **Market Buy** or **Limit Buy** order (e.g. 5 shares of `RELIANCE` at `₹2,946.00`).
   - Notice the instant match against resting asks: the order fills, cash is deducted with double-entry ledger verification, and the holding is updated immediately.
   - Click the **Bell Icon** on the top right to see the instant trade fill notification!

#### 3. Mutual Funds & Automated Recurring SIP
1. Click the **Mutual Funds & SIP** tab in the sidebar:
   - Filter funds by category: `ALL`, `EQUITY`, `DEBT`, `HYBRID`, `INDEX`.
   - Inspect metrics: NAV, 3Y CAGR, 5Y CAGR, Total Expense Ratio (TER), and fund description.
2. Click **Start SIP** on *Nippon India Small Cap Fund*:
   - Choose Frequency: `Monthly` (or `Daily` / `Weekly`).
   - Enter Installment Amount: `₹2,000`.
   - Click **Activate Mandate**: First installment debits available balance, creates a ledger entry, and allocates units.
3. In **My Active SIP Mandates**:
   - Click **Pause** / **Resume** to demonstrate the state machine.
   - Click **⚡ Trigger Now**: Simulates an automated cron execution live during evaluation, instantly debiting the wallet and allocating units!

#### 4. Institutional Contract Notes & Tax Statements
1. Click the **Reports & Tax P&L** tab:
2. **Contract Notes**:
   - Select any executed trade from the list.
   - Observe the regulatory-standard simulated Electronic Contract Note with Contract Note Number, Trade ID, T+1 settlement date, client tax classification, gross amount, and full statutory tax itemization:
     - Brokerage (0.05%)
     - Securities Transaction Tax (STT: 0.1%)
     - Exchange Turnover Charge (0.00345%)
     - SEBI Turnover Fees (₹10/crore)
     - GST (18% on fees)
     - Stamp Duty (0.015% on buy side)
     - Net Settlement Direction (Payable/Receivable)
   - Click **Print** to preview an official printout.
3. **Tax P&L Tab**:
   - Review gross equity turnover, realized capital gains, STCG tax rate (20% under Finance Act 2024), and itemized trades.
4. **Consolidated Holdings Tab**:
   - Inspect the multi-asset allocation bar (Equities % vs Mutual Funds % vs Cash %) and unified holding valuations.

#### 5. Normalized Trader Leaderboard
1. Click the **Trader Leaderboard** tab:
   - Inspect the top 3 podium cards (👑 Grand Alpha, 🥈 Market Maven, 🥉 Bull Scalper).
   - Review fair normalized return rankings across all participants.
   - Notice the logged-in user row highlighted with a "YOU" badge.

#### 6. Super Admin Oversight & Risk Console
1. Click the **Admin Console** tab:
   - Review platform ACID metrics: total users, platform gross turnover, total trades, and engine state.
   - **User Registry & KYC**: Review unverified accounts and approve with 1 click.
   - **Double-Entry Capital Adjustment**: Select any user, choose `CREDIT` or `DEBIT`, input amount and audit reason, and execute. Balance and ledger update atomically.
   - **Global Trade Feed**: Live feed of all trades executed across the market.

---

### Automated Unit Test Verification

To run all automated test suites across Wallet, Matching Engine, and SIP Services:
```powershell
cd C:\Users\BIT\.gemini\antigravity\scratch\shifty50\backend
npm test
```
**Results**:
- `tests/wallet.service.test.ts` (Double-entry invariants, overdraft protection, ACID isolation) -> **PASS**
- `tests/matching-engine.test.ts` (Price-time priority, partial fills, atomic settlement) -> **PASS**
- `tests/sip.service.test.ts` (Next execution date math, minimum amounts, ledger debit, status toggles) -> **PASS**
- Total: **15 / 15 tests passed** across all 3 test suites.
