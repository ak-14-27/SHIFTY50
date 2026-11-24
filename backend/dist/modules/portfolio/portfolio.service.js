"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const prisma_1 = require("../../shared/db/prisma");
class PortfolioService {
    /**
     * Computes real-time portfolio metrics, individual stock holdings, and P&L breakdown
     */
    static async getUserPortfolio(userId) {
        const [wallet, rawHoldings] = await Promise.all([
            prisma_1.prisma.wallet.findUnique({ where: { userId } }),
            prisma_1.prisma.holding.findMany({
                where: { userId },
                include: {
                    stock: true,
                },
            }),
        ]);
        if (!wallet) {
            throw { status: 404, message: 'Wallet not found for this user' };
        }
        let totalInvestedValue = 0;
        let currentPortfolioValue = 0;
        let totalRealizedPnL = 0;
        const holdings = rawHoldings
            .filter((h) => h.quantity > 0 || h.realizedProfit !== 0)
            .map((h) => {
            const currentPrice = h.stock.currentPrice;
            const currentValuation = Number((h.quantity * currentPrice).toFixed(2));
            const investedAmount = Number((h.quantity * h.averageBuyPrice).toFixed(2));
            const unrealizedPnL = Number((currentValuation - investedAmount).toFixed(2));
            const unrealizedPnLPercent = investedAmount > 0
                ? Number((((currentPrice - h.averageBuyPrice) / h.averageBuyPrice) * 100).toFixed(2))
                : 0;
            totalInvestedValue += investedAmount;
            currentPortfolioValue += currentValuation;
            totalRealizedPnL += h.realizedProfit;
            return {
                id: h.id,
                symbol: h.symbol,
                name: h.stock.name,
                sector: h.stock.sector,
                quantity: h.quantity,
                averageBuyPrice: h.averageBuyPrice,
                currentPrice,
                investedAmount,
                currentValuation,
                unrealizedPnL,
                unrealizedPnLPercent,
                realizedProfit: Number(h.realizedProfit.toFixed(2)),
                dayChangePercent: h.stock.changePercent,
            };
        });
        const totalUnrealizedPnL = Number((currentPortfolioValue - totalInvestedValue).toFixed(2));
        const overallReturnPercent = totalInvestedValue > 0
            ? Number((((currentPortfolioValue - totalInvestedValue) / totalInvestedValue) * 100).toFixed(2))
            : 0;
        const totalNetPnL = Number((totalUnrealizedPnL + totalRealizedPnL).toFixed(2));
        const netWorth = Number((wallet.availableBalance + wallet.reservedBalance + currentPortfolioValue).toFixed(2));
        return {
            summary: {
                availableCash: wallet.availableBalance,
                reservedCash: wallet.reservedBalance,
                totalInvestedValue: Number(totalInvestedValue.toFixed(2)),
                currentPortfolioValue: Number(currentPortfolioValue.toFixed(2)),
                netWorth,
                totalUnrealizedPnL,
                totalRealizedPnL: Number(totalRealizedPnL.toFixed(2)),
                totalNetPnL,
                overallReturnPercent,
            },
            holdings: holdings.filter((h) => h.quantity > 0),
            historicalPositions: holdings.filter((h) => h.quantity === 0 && h.realizedProfit !== 0),
        };
    }
    /**
     * Retrieves all executed trades for the user
     */
    static async getUserTrades(userId) {
        const trades = await prisma_1.prisma.trade.findMany({
            where: {
                OR: [{ buyerId: userId }, { sellerId: userId }],
            },
            orderBy: { executedAt: 'desc' },
            take: 50,
        });
        return trades.map((t) => {
            const isBuyer = t.buyerId === userId;
            return {
                id: t.id,
                symbol: t.symbol,
                side: isBuyer ? 'BUY' : 'SELL',
                price: t.executionPrice,
                quantity: t.quantity,
                totalAmount: t.tradeAmount,
                fee: isBuyer ? t.buyerFee : t.sellerFee,
                executedAt: t.executedAt,
            };
        });
    }
}
exports.PortfolioService = PortfolioService;
//# sourceMappingURL=portfolio.service.js.map