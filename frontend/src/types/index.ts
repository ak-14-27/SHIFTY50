export type KycStatus = 'REGISTERED' | 'VERIFICATION_PENDING' | 'VERIFIED' | 'ACTIVE';
export type UserRole = 'USER' | 'ADMIN';
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET' | 'STOP_LOSS';
export type OrderStatus = 'PLACED' | 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export type TransactionType =
  | 'MONTHLY_CREDIT'
  | 'FUNDS_ADDED'
  | 'ORDER_HOLD'
  | 'ORDER_RELEASE'
  | 'TRADE_DEBIT'
  | 'TRADE_CREDIT'
  | 'MUTUAL_FUND_INVEST'
  | 'MUTUAL_FUND_REDEEM'
  | 'SIP_DEDUCTION'
  | 'ADMIN_ADJUSTMENT';

export type MutualFundCategory = 'EQUITY' | 'DEBT' | 'HYBRID' | 'INDEX';
export type SipFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type SipStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type NotificationType =
  | 'ORDER_MATCH'
  | 'SIP_EXECUTION'
  | 'PAYMENT_CREDIT'
  | 'KYC_UPDATE'
  | 'SYSTEM_ALERT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  kycStatus: KycStatus;
  role: UserRole;
  panMock?: string;
  aadhaarMock?: string;
  createdAt: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  reservedBalance: number;
  investedBalance: number;
  totalPortfolioValue: number;
  currency: string;
  updatedAt: string;
}

export interface WalletLedgerEntry {
  id: string;
  walletId: string;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  volume: number;
  changePercent: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  status: OrderStatus;
  price: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  totalAmount: number;
  reservedAmount: number;
  createdAt: string;
  updatedAt: string;
  stock?: {
    name: string;
    currentPrice: number;
  };
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  ordersCount: number;
}

export interface OrderBookDepth {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  totalBidQty: number;
  totalAskQty: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValuation: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedProfit: number;
  dayChangePercent: number;
}

export interface PortfolioSummary {
  availableCash: number;
  reservedCash: number;
  totalInvestedValue: number;
  currentPortfolioValue: number;
  netWorth: number;
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  totalNetPnL: number;
  overallReturnPercent: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: OrderSide;
  price: number;
  quantity: number;
  totalAmount: number;
  fee: number;
  executedAt: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  idempotencyKey: string;
  amount: number;
  paymentMethod: string;
  status: string;
  receiptId: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  metadata?: string;
  ipAddress?: string;
  timestamp: string;
}

// EST Final Modules Types
export interface MutualFund {
  id: string;
  name: string;
  code: string;
  category: MutualFundCategory;
  nav: number;
  cagr3y: number;
  cagr5y: number;
  expenseRatio: number;
  risk: string;
  description: string;
  updatedAt?: string;
}

export interface MutualFundHolding {
  id: string;
  userId: string;
  fundId: string;
  units: number;
  averageNav: number;
  totalInvested: number;
  fund: MutualFund;
  currentValuation?: number;
  unrealizedPnL?: number;
  returnPercent?: number;
}

export interface Sip {
  id: string;
  userId: string;
  fundId: string;
  amount: number;
  frequency: SipFrequency;
  status: SipStatus;
  startDate: string;
  nextExecutionDate: string;
  totalInstallments: number;
  successfulInstallments: number;
  createdAt?: string;
  fund: MutualFund;
}

export interface ContractNote {
  contractNoteNumber: string;
  tradeId: string;
  orderId: string;
  tradeDate: string;
  settlementDate: string;
  exchange: string;
  settlementNumber: string;
  clientInfo: {
    userId: string;
    taxStatus: string;
  };
  security: {
    symbol: string;
    isin: string;
    name: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    grossRate: number;
    grossAmount: number;
  };
  charges: {
    brokerage: number;
    stt: number;
    exchangeTurnoverCharge: number;
    sebiCharges: number;
    gst: number;
    stampDuty: number;
    totalTaxesAndCharges: number;
  };
  netPayableReceivable: {
    amount: number;
    direction: string;
  };
  disclaimer: string;
}

export interface TaxPnlReport {
  financialYear: string;
  userId: string;
  summary: {
    equityTurnover: number;
    equityRealizedGains: number;
    mutualFundRealizedGains: number;
    totalRealizedGains: number;
    stcgTaxRate: string;
    estimatedTaxLiability: number;
  };
  equityTrades: Array<{
    tradeId: string;
    symbol: string;
    date: string;
    quantity: number;
    salePrice: number;
    totalTurnover: number;
    charges: number;
    realizedPnL: number;
    gainType: string;
  }>;
  mutualFundRedemptions: Array<{
    fundName: string;
    date: string;
    units: number;
    nav: number;
    amount: number;
    realizedPnL: number;
    gainType: string;
  }>;
}

export interface HoldingsStatement {
  statementDate: string;
  totalPortfolioValuation: number;
  totalInvested: number;
  overallUnrealizedPnl: number;
  liquidCash: number;
  reservedCash: number;
  assetAllocation: {
    stocksPct: number;
    mutualFundsPct: number;
    liquidCashPct: number;
  };
  stocks: Array<{
    assetType: string;
    symbol: string;
    name: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    investedAmount: number;
    currentValuation: number;
    pnl: number;
    pnlPct: number;
  }>;
  mutualFunds: Array<{
    assetType: string;
    symbol: string;
    name: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    investedAmount: number;
    currentValuation: number;
    pnl: number;
    pnlPct: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  totalNetWorth: number;
  normalizedProfit: number;
  returnPercent: number;
  tradesCount: number;
  activeHoldingsCount: number;
  badge: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface SystemAnalytics {
  totalUsers: number;
  activeKycUsers: number;
  totalStocks: number;
  totalFunds: number;
  totalOrders: number;
  totalTrades: number;
  totalTurnover: number;
  totalCashCirculation: number;
  activeSips: number;
  engineState: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: any;
  timestamp: string;
}
