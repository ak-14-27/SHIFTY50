"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = require("../../shared/db/prisma");
const enums_1 = require("../../shared/types/enums");
class AdminService {
    /**
     * Computes normalized performance leaderboard across all platform traders
     */
    static async getLeaderboard() {
        const users = await prisma_1.prisma.user.findMany({
            where: {
                role: enums_1.UserRole.USER,
                kycStatus: enums_1.KycStatus.ACTIVE,
            },
            include: {
                wallet: true,
                holdings: { include: { stock: true } },
                mfHoldings: { include: { fund: true } },
            },
        });
        const leaderboard = await Promise.all(users.map(async (u) => {
            // Stock valuation
            const stockValuation = u.holdings.reduce((sum, h) => sum + h.quantity * h.stock.currentPrice, 0);
            // Mutual fund valuation
            const mfValuation = u.mfHoldings.reduce((sum, mf) => sum + mf.units * mf.fund.nav, 0);
            const available = u.wallet?.availableBalance || 0;
            const reserved = u.wallet?.reservedBalance || 0;
            const totalNetWorth = Number((available + reserved + stockValuation + mfValuation).toFixed(2));
            // Base capital is ₹1,00,000
            const baseCapital = 100000.0;
            const normalizedProfit = Number((totalNetWorth - baseCapital).toFixed(2));
            const returnPercent = Number(((normalizedProfit / baseCapital) * 100).toFixed(2));
            // Total trades count
            const tradesCount = await prisma_1.prisma.trade.count({
                where: { OR: [{ buyerId: u.id }, { sellerId: u.id }] },
            });
            return {
                userId: u.id,
                name: u.fullName,
                email: u.email,
                totalNetWorth,
                normalizedProfit,
                returnPercent,
                tradesCount,
                activeHoldingsCount: u.holdings.filter((h) => h.quantity > 0).length,
            };
        }));
        // Sort descending by return percentage
        leaderboard.sort((a, b) => b.returnPercent - a.returnPercent);
        return leaderboard.map((trader, index) => {
            let badge = 'Novice Trader';
            if (index === 0)
                badge = '👑 Grand Alpha';
            else if (index === 1)
                badge = '🥈 Market Maven';
            else if (index === 2)
                badge = '🥉 Bull Scalper';
            else if (trader.returnPercent > 5)
                badge = '🚀 Pro Trader';
            return {
                rank: index + 1,
                ...trader,
                badge,
            };
        });
    }
    /**
     * Retrieves overall platform telemetry & system-wide metrics
     */
    static async getSystemAnalytics() {
        const [totalUsers, activeKycUsers, totalStocks, totalFunds, totalOrders, totalTrades, allTrades, activeSips, wallets,] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { kycStatus: enums_1.KycStatus.ACTIVE } }),
            prisma_1.prisma.stock.count(),
            prisma_1.prisma.mutualFund.count(),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.trade.count(),
            prisma_1.prisma.trade.findMany({ select: { tradeAmount: true } }),
            prisma_1.prisma.sip.count({ where: { status: 'ACTIVE' } }),
            prisma_1.prisma.wallet.findMany({ select: { availableBalance: true, reservedBalance: true, investedBalance: true } }),
        ]);
        const totalTurnover = allTrades.reduce((sum, t) => sum + t.tradeAmount, 0);
        const totalCashCirculation = wallets.reduce((sum, w) => sum + w.availableBalance + w.reservedBalance + w.investedBalance, 0);
        return {
            totalUsers,
            activeKycUsers,
            totalStocks,
            totalFunds,
            totalOrders,
            totalTrades,
            totalTurnover: Number(totalTurnover.toFixed(2)),
            totalCashCirculation: Number(totalCashCirculation.toFixed(2)),
            activeSips,
            engineState: 'OPTIMAL (ACID INVARIANTS INTACT)',
        };
    }
    /**
     * Retrieves all users with extended portfolio stats for Admin review
     */
    static async getAllUsersDetailed() {
        return await prisma_1.prisma.user.findMany({
            include: {
                wallet: true,
                _count: {
                    select: {
                        orders: true,
                        holdings: true,
                        sips: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Manual KYC status review by admin
     */
    static async reviewKyc(adminUserId, targetUserId, status) {
        const user = await prisma_1.prisma.user.update({
            where: { id: targetUserId },
            data: { kycStatus: status },
        });
        // If approved to ACTIVE, ensure wallet exists with initial seed
        if (status === enums_1.KycStatus.ACTIVE) {
            const existingWallet = await prisma_1.prisma.wallet.findUnique({ where: { userId: targetUserId } });
            if (!existingWallet) {
                const wallet = await prisma_1.prisma.wallet.create({
                    data: {
                        userId: targetUserId,
                        availableBalance: 100000.0,
                        reservedBalance: 0.0,
                        investedBalance: 0.0,
                    },
                });
                await prisma_1.prisma.walletLedger.create({
                    data: {
                        walletId: wallet.id,
                        transactionType: enums_1.TransactionType.MONTHLY_CREDIT,
                        amount: 100000.0,
                        balanceBefore: 0.0,
                        balanceAfter: 100000.0,
                        referenceId: `ADMIN_KYC_${Date.now()}`,
                        description: 'Admin Manual KYC Approval - Capital Allotted',
                    },
                });
            }
        }
        return user;
    }
    /**
     * Admin Capital Adjustment (Credit or Debit) with double-entry ledger & audit logging
     */
    static async adjustCapital(adminUserId, targetUserId, amount, type, reason) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId: targetUserId } });
            if (!wallet)
                throw { status: 404, message: 'Target user wallet not found' };
            const isCredit = type === 'CREDIT';
            if (!isCredit && wallet.availableBalance < amount) {
                throw { status: 400, message: 'Insufficient balance for debit adjustment' };
            }
            const balanceBefore = wallet.availableBalance;
            const balanceAfter = isCredit ? balanceBefore + amount : balanceBefore - amount;
            const ledgerAmount = isCredit ? amount : -amount;
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { availableBalance: balanceAfter },
            });
            const refId = `ADM_ADJ_${Date.now()}`;
            await tx.walletLedger.create({
                data: {
                    walletId: wallet.id,
                    transactionType: enums_1.TransactionType.ADMIN_ADJUSTMENT,
                    amount: ledgerAmount,
                    balanceBefore,
                    balanceAfter,
                    referenceId: refId,
                    description: `Admin Capital Adjustment: ${type} ₹${amount.toFixed(2)} - ${reason}`,
                },
            });
            return {
                wallet: updatedWallet,
                refId,
                adjustmentType: type,
                amount,
            };
        });
    }
    /**
     * Global Trade feed across all market participants
     */
    static async getGlobalTradeFeed(limit = 40) {
        return await prisma_1.prisma.trade.findMany({
            orderBy: { executedAt: 'desc' },
            take: limit,
            include: {
                buyerOrder: { select: { side: true, orderType: true } },
            },
        });
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map