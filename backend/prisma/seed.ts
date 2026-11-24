import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  KycStatus,
  UserRole,
  TransactionType,
  OrderSide,
  OrderType,
  OrderStatus,
  MutualFundCategory,
  SipFrequency,
  SipStatus,
  NotificationType,
} from '../src/shared/types/enums';

const prisma = new PrismaClient();

const INITIAL_STOCKS = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy & Petrochemicals',
    currentPrice: 2945.50,
    openPrice: 2920.00,
    highPrice: 2962.00,
    lowPrice: 2915.00,
    previousClose: 2918.75,
    volume: 3450200,
    changePercent: 0.92,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Information Technology',
    currentPrice: 4210.80,
    openPrice: 4240.00,
    highPrice: 4265.50,
    lowPrice: 4195.00,
    previousClose: 4250.00,
    volume: 1820400,
    changePercent: -0.92,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    currentPrice: 1785.40,
    openPrice: 1765.00,
    highPrice: 1798.20,
    lowPrice: 1760.10,
    previousClose: 1762.30,
    volume: 4521000,
    changePercent: 1.31,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking & Financials',
    currentPrice: 1642.15,
    openPrice: 1635.00,
    highPrice: 1650.00,
    lowPrice: 1630.50,
    previousClose: 1638.00,
    volume: 6109200,
    changePercent: 0.25,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    sector: 'Banking & Financials',
    currentPrice: 1180.60,
    openPrice: 1172.00,
    highPrice: 1188.00,
    lowPrice: 1168.00,
    previousClose: 1170.50,
    volume: 5320800,
    changePercent: 0.86,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobile',
    currentPrice: 1045.20,
    openPrice: 1025.00,
    highPrice: 1052.40,
    lowPrice: 1022.00,
    previousClose: 1028.90,
    volume: 7891200,
    changePercent: 1.58,
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'Consumer Goods (FMCG)',
    currentPrice: 504.35,
    openPrice: 502.00,
    highPrice: 507.80,
    lowPrice: 500.50,
    previousClose: 501.90,
    volume: 3890100,
    changePercent: 0.49,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecommunication',
    currentPrice: 1528.90,
    openPrice: 1515.00,
    highPrice: 1535.00,
    lowPrice: 1510.00,
    previousClose: 1518.20,
    volume: 2410900,
    changePercent: 0.71,
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Banking & Financials',
    currentPrice: 822.45,
    openPrice: 818.00,
    highPrice: 827.00,
    lowPrice: 815.20,
    previousClose: 819.50,
    volume: 4890000,
    changePercent: 0.36,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Construction & Capital Goods',
    currentPrice: 3680.00,
    openPrice: 3650.00,
    highPrice: 3710.00,
    lowPrice: 3642.00,
    previousClose: 3660.00,
    volume: 1240500,
    changePercent: 0.55,
  },
];

const INITIAL_MUTUAL_FUNDS = [
  {
    name: 'Parag Parikh Flexi Cap Fund - Direct (G)',
    code: 'PPFAS_FLEXICAP',
    category: MutualFundCategory.EQUITY,
    nav: 76.42,
    cagr3y: 21.8,
    cagr5y: 24.5,
    expenseRatio: 0.62,
    risk: 'VERY_HIGH',
    description: 'Flagship diversified multi-cap fund investing across domestic and global equities.',
  },
  {
    name: 'HDFC Top 100 Fund - Direct (G)',
    code: 'HDFC_TOP100',
    category: MutualFundCategory.EQUITY,
    nav: 1142.80,
    cagr3y: 19.4,
    cagr5y: 18.2,
    expenseRatio: 0.98,
    risk: 'HIGH',
    description: 'Large cap bluechip fund focusing on established market leaders in NIFTY 100.',
  },
  {
    name: 'Nippon India Small Cap Fund - Direct (G)',
    code: 'NIPPON_SMALLCAP',
    category: MutualFundCategory.EQUITY,
    nav: 178.60,
    cagr3y: 27.2,
    cagr5y: 29.1,
    expenseRatio: 0.68,
    risk: 'VERY_HIGH',
    description: 'High-growth small cap equity fund targeting emerging business leaders.',
  },
  {
    name: 'UTI Nifty 50 Index Fund - Direct (G)',
    code: 'UTI_NIFTY50',
    category: MutualFundCategory.INDEX,
    nav: 172.30,
    cagr3y: 15.2,
    cagr5y: 16.4,
    expenseRatio: 0.18,
    risk: 'HIGH',
    description: 'Low-cost passive index fund mirroring the performance of NIFTY 50 benchmark.',
  },
  {
    name: 'Mirae Asset Balanced Advantage Fund - Direct (G)',
    code: 'MIRAE_BAF',
    category: MutualFundCategory.HYBRID,
    nav: 16.45,
    cagr3y: 13.8,
    cagr5y: 14.2,
    expenseRatio: 0.55,
    risk: 'MODERATE',
    description: 'Dynamic asset allocation fund shifting between equity and debt based on market valuation.',
  },
  {
    name: 'ICICI Prudential Liquid Fund - Direct (G)',
    code: 'ICICI_LIQUID',
    category: MutualFundCategory.DEBT,
    nav: 374.50,
    cagr3y: 6.4,
    cagr5y: 5.9,
    expenseRatio: 0.20,
    risk: 'LOW',
    description: 'Ultra-low risk debt fund investing in overnight and short-term sovereign paper.',
  },
];

async function main() {
  console.log('🌱 Starting $hifty50 database seed for Full EST Final Release...');

  // Clean existing tables in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.mutualFundTransaction.deleteMany();
  await prisma.sip.deleteMany();
  await prisma.mutualFundHolding.deleteMany();
  await prisma.mutualFund.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.order.deleteMany();
  await prisma.holding.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.walletLedger.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

  // 1. Seed Stocks
  console.log('📈 Seeding NIFTY 50 Stocks...');
  for (const stock of INITIAL_STOCKS) {
    await prisma.stock.create({
      data: stock,
    });
  }

  // 2. Seed Mutual Funds
  console.log('📊 Seeding Institutional Mutual Funds Catalog...');
  const createdFunds = [];
  for (const fund of INITIAL_MUTUAL_FUNDS) {
    const f = await prisma.mutualFund.create({
      data: fund,
    });
    createdFunds.push(f);
  }

  // 3. Create Admin User (System Treasury)
  console.log('👑 Creating System Administrator...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@shifty50.com',
      passwordHash: defaultPasswordHash,
      fullName: 'System Administrator',
      kycStatus: KycStatus.ACTIVE,
      panMock: 'ADMXX9999Z',
      aadhaarMock: '111122223333',
      role: UserRole.ADMIN,
      wallet: {
        create: {
          availableBalance: 10000000.0,
          reservedBalance: 0.0,
          investedBalance: 0.0,
          currency: 'INR',
          ledgerEntries: {
            create: {
              transactionType: TransactionType.MONTHLY_CREDIT,
              amount: 10000000.0,
              balanceBefore: 0.0,
              balanceAfter: 10000000.0,
              referenceId: 'TREASURY_INIT_001',
              description: 'Central Clearing & Treasury Account Initialization',
            },
          },
        },
      },
    },
  });

  // 4. Create Market Maker Bot User (to populate order book bids & asks for live trading demo)
  console.log('🤖 Creating Exchange Market Maker...');
  const marketMaker = await prisma.user.create({
    data: {
      email: 'marketmaker@shifty50.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Exchange Liquidity Provider',
      kycStatus: KycStatus.ACTIVE,
      panMock: 'MMBOT1234K',
      aadhaarMock: '999988887777',
      role: UserRole.USER,
      wallet: {
        create: {
          availableBalance: 5000000.0,
          reservedBalance: 1000000.0,
          investedBalance: 2000000.0,
          currency: 'INR',
          ledgerEntries: {
            create: {
              transactionType: TransactionType.MONTHLY_CREDIT,
              amount: 8000000.0,
              balanceBefore: 0.0,
              balanceAfter: 8000000.0,
              referenceId: 'MM_SEED_01',
              description: 'Liquidity Provider Initial Balance',
            },
          },
        },
      },
    },
  });

  // 5. Create Active Demo Trader (Anurag Shukla)
  console.log('👤 Creating Active Trader (Anurag Shukla)...');
  const activeTrader = await prisma.user.create({
    data: {
      email: 'trader@shifty50.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Anurag Shukla',
      kycStatus: KycStatus.ACTIVE,
      panMock: 'ABCDE1234F',
      aadhaarMock: '453278912345',
      role: UserRole.USER,
      wallet: {
        create: {
          availableBalance: 55000.0,
          reservedBalance: 15000.0,
          investedBalance: 30000.0,
          currency: 'INR',
          ledgerEntries: {
            create: [
              {
                transactionType: TransactionType.MONTHLY_CREDIT,
                amount: 100000.0,
                balanceBefore: 0.0,
                balanceAfter: 100000.0,
                referenceId: 'ALLOC_MONTH_2026_09',
                description: 'Initial Monthly Virtual Capital Allocation (₹1,00,000)',
              },
              {
                transactionType: TransactionType.ORDER_HOLD,
                amount: -15000.0,
                balanceBefore: 100000.0,
                balanceAfter: 85000.0,
                referenceId: 'ORD_HOLD_INIT_01',
                description: 'Funds locked for Limit Order (5x RELIANCE @ ₹2,940)',
              },
              {
                transactionType: TransactionType.TRADE_DEBIT,
                amount: -20000.0,
                balanceBefore: 85000.0,
                balanceAfter: 65000.0,
                referenceId: 'TRD_SETTLE_INIT_02',
                description: 'Trade Settled: Purchased 11x INFY @ ₹1,780.00',
              },
              {
                transactionType: TransactionType.MUTUAL_FUND_INVEST,
                amount: -10000.0,
                balanceBefore: 65000.0,
                balanceAfter: 55000.0,
                referenceId: 'MF_INV_INIT_03',
                description: 'Mutual Fund Investment: Parag Parikh Flexi Cap Fund',
              },
            ],
          },
        },
      },
      holdings: {
        create: [
          {
            symbol: 'INFY',
            quantity: 11,
            averageBuyPrice: 1780.0,
            totalInvested: 19580.0,
            realizedProfit: 0.0,
          },
          {
            symbol: 'TATAMOTORS',
            quantity: 10,
            averageBuyPrice: 1010.0,
            totalInvested: 10100.0,
            realizedProfit: 450.0,
          },
        ],
      },
    },
  });

  // Seed MF Holdings for Active Trader
  const flexiCapFund = createdFunds[0]; // Parag Parikh
  await prisma.mutualFundHolding.create({
    data: {
      userId: activeTrader.id,
      fundId: flexiCapFund.id,
      units: 130.855,
      averageNav: 76.42,
      totalInvested: 10000.0,
    },
  });

  // Seed Active SIP for Active Trader
  const sampleSip = await prisma.sip.create({
    data: {
      userId: activeTrader.id,
      fundId: flexiCapFund.id,
      amount: 5000.0,
      frequency: SipFrequency.MONTHLY,
      status: SipStatus.ACTIVE,
      nextExecutionDate: new Date(Date.now() + 86400000 * 5),
      totalInstallments: 12,
      successfulInstallments: 2,
    },
  });

  // Seed Sample Notifications for Active Trader
  await prisma.notification.createMany({
    data: [
      {
        userId: activeTrader.id,
        title: 'Capital Allotted',
        message: 'Welcome to $hifty50! Initial virtual trading capital of ₹1,00,000 has been credited to your wallet.',
        type: NotificationType.PAYMENT_CREDIT,
        referenceId: 'ALLOC_MONTH_2026_09',
        isRead: true,
      },
      {
        userId: activeTrader.id,
        title: 'KYC Verified',
        message: 'Your biometric PAN/Aadhaar identity has been approved. High-frequency electronic trading is enabled.',
        type: NotificationType.KYC_UPDATE,
        referenceId: 'KYC_AUTO_01',
        isRead: true,
      },
      {
        userId: activeTrader.id,
        title: 'Trade Executed: INFY',
        message: 'Matched 11 shares of INFY at ₹1,780.00. Electronic contract note is available in Reports.',
        type: NotificationType.ORDER_MATCH,
        referenceId: 'TRD_INFY_01',
        isRead: false,
      },
      {
        userId: activeTrader.id,
        title: 'SIP Installment Processed',
        message: 'SIP debit of ₹5,000 for Parag Parikh Flexi Cap Fund successfully executed.',
        type: NotificationType.SIP_EXECUTION,
        referenceId: sampleSip.id,
        isRead: false,
      },
    ],
  });

  // 6. Create Additional Ranked Traders for Competitive Leaderboard
  console.log('🏆 Creating Ranked Competitors for Leaderboard...');
  const trader2 = await prisma.user.create({
    data: {
      email: 'priya.sharma@shifty50.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Priya Sharma',
      kycStatus: KycStatus.ACTIVE,
      panMock: 'PRYSH5678Q',
      aadhaarMock: '887766554433',
      role: UserRole.USER,
      wallet: {
        create: {
          availableBalance: 82000.0,
          reservedBalance: 0.0,
          investedBalance: 40100.0,
          currency: 'INR',
          ledgerEntries: {
            create: {
              transactionType: TransactionType.MONTHLY_CREDIT,
              amount: 100000.0,
              balanceBefore: 0.0,
              balanceAfter: 100000.0,
              referenceId: 'ALLOC_PRIYA_01',
              description: 'Initial Monthly Virtual Capital Allocation',
            },
          },
        },
      },
      holdings: {
        create: [
          {
            symbol: 'RELIANCE',
            quantity: 10,
            averageBuyPrice: 2850.0,
            totalInvested: 28500.0,
            realizedProfit: 1200.0,
          },
          {
            symbol: 'BHARTIARTL',
            quantity: 8,
            averageBuyPrice: 1450.0,
            totalInvested: 11600.0,
            realizedProfit: 630.0,
          },
        ],
      },
    },
  });

  const trader3 = await prisma.user.create({
    data: {
      email: 'vikram.malhotra@shifty50.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Vikram Malhotra',
      kycStatus: KycStatus.ACTIVE,
      panMock: 'VIKML9012M',
      aadhaarMock: '223344556677',
      role: UserRole.USER,
      wallet: {
        create: {
          availableBalance: 40000.0,
          reservedBalance: 10000.0,
          investedBalance: 49200.0,
          currency: 'INR',
          ledgerEntries: {
            create: {
              transactionType: TransactionType.MONTHLY_CREDIT,
              amount: 100000.0,
              balanceBefore: 0.0,
              balanceAfter: 100000.0,
              referenceId: 'ALLOC_VIKRAM_01',
              description: 'Initial Monthly Virtual Capital Allocation',
            },
          },
        },
      },
      holdings: {
        create: [
          {
            symbol: 'TCS',
            quantity: 12,
            averageBuyPrice: 4100.0,
            totalInvested: 49200.0,
            realizedProfit: 1320.0,
          },
        ],
      },
    },
  });

  // 7. Create Registered User (Pending KYC submission)
  const registeredUser = await prisma.user.create({
    data: {
      email: 'newbie@shifty50.com',
      passwordHash: defaultPasswordHash,
      fullName: 'Rudra Kumar',
      kycStatus: KycStatus.REGISTERED,
      role: UserRole.USER,
    },
  });

  // 8. Populate Initial Order Book depth on RELIANCE and INFY
  console.log('📚 Seeding Initial Order Book Depth...');
  const sampleOrders = [
    // Bids for RELIANCE (Buy Orders)
    {
      userId: marketMaker.id,
      symbol: 'RELIANCE',
      side: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      price: 2942.0,
      quantity: 50,
      remainingQuantity: 50,
      totalAmount: 147100.0,
      status: OrderStatus.OPEN,
    },
    {
      userId: marketMaker.id,
      symbol: 'RELIANCE',
      side: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      price: 2940.0,
      quantity: 100,
      remainingQuantity: 100,
      totalAmount: 294000.0,
      status: OrderStatus.OPEN,
    },
    {
      userId: activeTrader.id,
      symbol: 'RELIANCE',
      side: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      price: 2938.5,
      quantity: 5,
      remainingQuantity: 5,
      totalAmount: 14692.5,
      status: OrderStatus.OPEN,
    },
    // Asks for RELIANCE (Sell Orders)
    {
      userId: marketMaker.id,
      symbol: 'RELIANCE',
      side: OrderSide.SELL,
      orderType: OrderType.LIMIT,
      price: 2946.0,
      quantity: 40,
      remainingQuantity: 40,
      totalAmount: 117840.0,
      status: OrderStatus.OPEN,
    },
    {
      userId: marketMaker.id,
      symbol: 'RELIANCE',
      side: OrderSide.SELL,
      orderType: OrderType.LIMIT,
      price: 2948.5,
      quantity: 80,
      remainingQuantity: 80,
      totalAmount: 235880.0,
      status: OrderStatus.OPEN,
    },
    {
      userId: marketMaker.id,
      symbol: 'RELIANCE',
      side: OrderSide.SELL,
      orderType: OrderType.LIMIT,
      price: 2950.0,
      quantity: 120,
      remainingQuantity: 120,
      totalAmount: 354000.0,
      status: OrderStatus.OPEN,
    },
    // Bids & Asks for INFY
    {
      userId: marketMaker.id,
      symbol: 'INFY',
      side: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      price: 1782.0,
      quantity: 60,
      remainingQuantity: 60,
      totalAmount: 106920.0,
      status: OrderStatus.OPEN,
    },
    {
      userId: marketMaker.id,
      symbol: 'INFY',
      side: OrderSide.SELL,
      orderType: OrderType.LIMIT,
      price: 1788.0,
      quantity: 75,
      remainingQuantity: 75,
      totalAmount: 134100.0,
      status: OrderStatus.OPEN,
    },
  ];

  for (const ord of sampleOrders) {
    await prisma.order.create({
      data: ord,
    });
  }

  // 9. Seed Sample Trade Executions
  const sampleBuyOrder = await prisma.order.findFirst({ where: { symbol: 'INFY' } });
  const sampleSellOrder = await prisma.order.findFirst({ where: { symbol: 'RELIANCE' } });

  const sampleTrade = await prisma.trade.create({
    data: {
      symbol: 'INFY',
      executionPrice: 1780.0,
      quantity: 11,
      tradeAmount: 19580.0,
      buyerFee: 19.58,
      sellerFee: 19.58,
      buyerOrderId: sampleBuyOrder?.id || 'demo-order-1',
      sellerOrderId: sampleSellOrder?.id || 'demo-order-2',
      buyerId: activeTrader.id,
      sellerId: marketMaker.id,
    },
  });

  const sampleTrade2 = await prisma.trade.create({
    data: {
      symbol: 'TATAMOTORS',
      executionPrice: 1010.0,
      quantity: 10,
      tradeAmount: 10100.0,
      buyerFee: 10.10,
      sellerFee: 10.10,
      buyerOrderId: sampleBuyOrder?.id || 'demo-order-3',
      sellerOrderId: sampleSellOrder?.id || 'demo-order-4',
      buyerId: activeTrader.id,
      sellerId: marketMaker.id,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'EST_FINAL_SEED',
      entityName: 'Database',
      metadata: JSON.stringify({
        seededStocks: INITIAL_STOCKS.length,
        seededFunds: INITIAL_MUTUAL_FUNDS.length,
        seededOrders: sampleOrders.length,
      }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ EST Final Release Database successfully seeded!');
  console.log('----------------------------------------------------');
  console.log('📊 10 NIFTY 50 Stocks Loaded with live price metrics');
  console.log('📈 6 Institutional Mutual Funds (Equity, Debt, Hybrid, Index)');
  console.log('📖 Order Book seeded with Bids & Asks on RELIANCE & INFY');
  console.log('💼 Active Traders loaded with Stocks, Funds, SIP & Notifications');
  console.log('🏆 Competitive Leaderboard active');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
