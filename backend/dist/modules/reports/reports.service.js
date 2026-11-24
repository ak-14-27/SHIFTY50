"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const prisma_1 = require("../../shared/db/prisma");
class ReportsService {
    /**
     * Generates a regulatory-standard simulated Contract Note for an executed trade
     */
    static async getContractNote(userId, tradeId) {
        const trade = await prisma_1.prisma.trade.findUnique({
            where: { id: tradeId },
            include: {
                buyerOrder: true,
                sellerOrder: true,
            },
        });
        if (!trade) {
            throw { status: 404, message: 'Trade record not found' };
        }
        if (trade.buyerId !== userId && trade.sellerId !== userId) {
            throw { status: 403, message: 'Unauthorized access to this contract note' };
        }
        const isBuyer = trade.buyerId === userId;
        const stock = await prisma_1.prisma.stock.findUnique({ where: { symbol: trade.symbol } });
        // Financial calculation breakdown (Standard Indian Stock Exchange norms)
        const grossAmount = trade.tradeAmount;
        const brokerage = isBuyer ? trade.buyerFee : trade.sellerFee; // 0.05%
        const stt = Number((grossAmount * 0.001).toFixed(2)); // Securities Transaction Tax (0.1%)
        const exchangeTurnoverCharge = Number((grossAmount * 0.0000345).toFixed(2)); // 0.00345%
        const sebiCharges = Number((grossAmount * 0.000001).toFixed(2)); // ₹10 per crore
        const gst = Number(((brokerage + exchangeTurnoverCharge) * 0.18).toFixed(2)); // 18% GST on services
        const stampDuty = isBuyer ? Number((grossAmount * 0.00015).toFixed(2)) : 0.0; // 0.015% on buys
        const totalStatutoryTaxes = Number((stt + exchangeTurnoverCharge + sebiCharges + gst + stampDuty).toFixed(2));
        const netTotal = isBuyer
            ? Number((grossAmount + brokerage + totalStatutoryTaxes).toFixed(2))
            : Number((grossAmount - brokerage - totalStatutoryTaxes).toFixed(2));
        const settlementDate = new Date(trade.executedAt);
        settlementDate.setDate(settlementDate.getDate() + 1); // T+1 rolling settlement
        return {
            contractNoteNumber: `CN-NSE-${trade.id.slice(0, 8).toUpperCase()}-${new Date(trade.executedAt).getFullYear()}`,
            tradeId: trade.id,
            orderId: isBuyer ? trade.buyerOrderId : trade.sellerOrderId,
            tradeDate: trade.executedAt,
            settlementDate: settlementDate.toISOString(),
            exchange: 'NSE (National Stock Exchange - Simulated)',
            settlementNumber: `N-2026${new Date(trade.executedAt).getMonth() + 1}${new Date(trade.executedAt).getDate()}`,
            clientInfo: {
                userId,
                taxStatus: 'Resident Individual',
            },
            security: {
                symbol: trade.symbol,
                isin: `INE${trade.symbol.padStart(9, '0')}`,
                name: stock?.name || trade.symbol,
                side: isBuyer ? 'BUY' : 'SELL',
                quantity: trade.quantity,
                grossRate: trade.executionPrice,
                grossAmount,
            },
            charges: {
                brokerage,
                stt,
                exchangeTurnoverCharge,
                sebiCharges,
                gst,
                stampDuty,
                totalTaxesAndCharges: Number((brokerage + totalStatutoryTaxes).toFixed(2)),
            },
            netPayableReceivable: {
                amount: netTotal,
                direction: isBuyer ? 'PAYABLE (DEBITED)' : 'RECEIVABLE (CREDITED)',
            },
            disclaimer: 'This is a computer-generated simulated contract note from $hifty50 Fintech Simulation Platform for academic evaluation.',
        };
    }
    /**
     * Generates financial year Tax P&L Statement with STCG, LTCG, and turnover metrics
     */
    static async getTaxPnlStatement(userId, financialYear = '2026-2027') {
        const [trades, rawHoldings, mfTransactions] = await Promise.all([
            prisma_1.prisma.trade.findMany({
                where: { sellerId: userId },
                orderBy: { executedAt: 'desc' },
            }),
            prisma_1.prisma.holding.findMany({
                where: { userId },
                include: { stock: true },
            }),
            prisma_1.prisma.mutualFundTransaction.findMany({
                where: { userId, transactionType: 'REDEMPTION' },
                include: { fund: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        // Equity Realized Gains
        let equityTurnover = 0;
        let equityRealizedPnL = 0;
        const realizedTrades = trades.map((t) => {
            equityTurnover += t.tradeAmount;
            // Estimate cost basis at previous close or 95% execution price if exact buy order not available
            const estimatedCost = t.tradeAmount * 0.95;
            const profit = Number((t.tradeAmount - estimatedCost - t.sellerFee).toFixed(2));
            equityRealizedPnL += profit;
            return {
                tradeId: t.id,
                symbol: t.symbol,
                date: t.executedAt,
                quantity: t.quantity,
                salePrice: t.executionPrice,
                totalTurnover: t.tradeAmount,
                charges: t.sellerFee,
                realizedPnL: profit,
                gainType: 'STCG (Short-Term Capital Gain)',
            };
        });
        // Mutual Fund Redemptions
        let mfRealizedPnL = 0;
        const realizedMf = mfTransactions.map((mf) => {
            const estimatedCost = mf.amount * 0.92;
            const profit = Number((mf.amount - estimatedCost).toFixed(2));
            mfRealizedPnL += profit;
            return {
                fundName: mf.fund.name,
                date: mf.createdAt,
                units: mf.units,
                nav: mf.nav,
                amount: mf.amount,
                realizedPnL: profit,
                gainType: 'STCG (Mutual Funds)',
            };
        });
        const totalRealizedGains = Number((equityRealizedPnL + mfRealizedPnL).toFixed(2));
        // Tax computation (Finance Act 2024 revised rates: STCG @ 20%, LTCG @ 12.5%)
        const stcgTaxRate = 0.20;
        const estimatedTaxLiability = totalRealizedGains > 0 ? Number((totalRealizedGains * stcgTaxRate).toFixed(2)) : 0.0;
        return {
            financialYear,
            userId,
            summary: {
                equityTurnover: Number(equityTurnover.toFixed(2)),
                equityRealizedGains: Number(equityRealizedPnL.toFixed(2)),
                mutualFundRealizedGains: Number(mfRealizedPnL.toFixed(2)),
                totalRealizedGains,
                stcgTaxRate: '20% (Equity & Mutual Funds)',
                estimatedTaxLiability,
            },
            equityTrades: realizedTrades,
            mutualFundRedemptions: realizedMf,
            unrealizedPositionsCount: rawHoldings.filter((h) => h.quantity > 0).length,
        };
    }
    /**
     * Generates a consolidated Holdings & Asset Allocation Statement
     */
    static async getHoldingsStatement(userId) {
        const [wallet, stockHoldings, mfHoldings] = await Promise.all([
            prisma_1.prisma.wallet.findUnique({ where: { userId } }),
            prisma_1.prisma.holding.findMany({
                where: { userId, quantity: { gt: 0 } },
                include: { stock: true },
            }),
            prisma_1.prisma.mutualFundHolding.findMany({
                where: { userId, units: { gt: 0 } },
                include: { fund: true },
            }),
        ]);
        if (!wallet)
            throw { status: 404, message: 'Wallet not found' };
        let totalStockValuation = 0;
        let totalStockInvested = 0;
        const formattedStocks = stockHoldings.map((h) => {
            const curVal = Number((h.quantity * h.stock.currentPrice).toFixed(2));
            const invested = Number((h.quantity * h.averageBuyPrice).toFixed(2));
            const pnl = Number((curVal - invested).toFixed(2));
            const pnlPct = invested > 0 ? Number(((pnl / invested) * 100).toFixed(2)) : 0;
            totalStockValuation += curVal;
            totalStockInvested += invested;
            return {
                assetType: 'EQUITY_STOCK',
                symbol: h.symbol,
                name: h.stock.name,
                quantity: h.quantity,
                averagePrice: h.averageBuyPrice,
                currentPrice: h.stock.currentPrice,
                investedAmount: invested,
                currentValuation: curVal,
                pnl,
                pnlPct,
            };
        });
        let totalMfValuation = 0;
        let totalMfInvested = 0;
        const formattedMf = mfHoldings.map((h) => {
            const curVal = Number((h.units * h.fund.nav).toFixed(2));
            const pnl = Number((curVal - h.totalInvested).toFixed(2));
            const pnlPct = h.totalInvested > 0 ? Number(((pnl / h.totalInvested) * 100).toFixed(2)) : 0;
            totalMfValuation += curVal;
            totalMfInvested += h.totalInvested;
            return {
                assetType: 'MUTUAL_FUND',
                symbol: h.fund.code,
                name: h.fund.name,
                quantity: h.units,
                averagePrice: h.averageNav,
                currentPrice: h.fund.nav,
                investedAmount: h.totalInvested,
                currentValuation: curVal,
                pnl,
                pnlPct,
            };
        });
        const liquidCash = wallet.availableBalance;
        const reservedCash = wallet.reservedBalance;
        const totalPortfolioValuation = Number((totalStockValuation + totalMfValuation + liquidCash + reservedCash).toFixed(2));
        const assetAllocation = {
            stocksPct: totalPortfolioValuation > 0 ? Number(((totalStockValuation / totalPortfolioValuation) * 100).toFixed(1)) : 0,
            mutualFundsPct: totalPortfolioValuation > 0 ? Number(((totalMfValuation / totalPortfolioValuation) * 100).toFixed(1)) : 0,
            liquidCashPct: totalPortfolioValuation > 0 ? Number((((liquidCash + reservedCash) / totalPortfolioValuation) * 100).toFixed(1)) : 0,
        };
        return {
            statementDate: new Date().toISOString(),
            totalPortfolioValuation,
            totalInvested: Number((totalStockInvested + totalMfInvested).toFixed(2)),
            overallUnrealizedPnl: Number(((totalStockValuation + totalMfValuation) - (totalStockInvested + totalMfInvested)).toFixed(2)),
            liquidCash,
            reservedCash,
            assetAllocation,
            stocks: formattedStocks,
            mutualFunds: formattedMf,
        };
    }
}
exports.ReportsService = ReportsService;
//# sourceMappingURL=reports.service.js.map