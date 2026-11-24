"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MutualFundsService = void 0;
const prisma_1 = require("../../shared/db/prisma");
const enums_1 = require("../../shared/types/enums");
class MutualFundsService {
    /**
     * Retrieves catalog of mutual funds with optional category filter and search
     */
    static async getAllFunds(category, search) {
        const where = {};
        if (category && category !== 'ALL') {
            where.category = category.toUpperCase();
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { code: { contains: search.toUpperCase() } },
            ];
        }
        return await prisma_1.prisma.mutualFund.findMany({
            where,
            orderBy: { cagr3y: 'desc' },
        });
    }
    /**
     * Retrieves single mutual fund details and performance history
     */
    static async getFundById(fundId) {
        const fund = await prisma_1.prisma.mutualFund.findUnique({
            where: { id: fundId },
        });
        if (!fund) {
            throw { status: 404, message: 'Mutual Fund not found' };
        }
        return fund;
    }
    /**
     * Performs an atomic lump-sum investment in a mutual fund
     */
    static async investLumpSum(userId, fundId, amount) {
        if (amount < 500) {
            throw { status: 400, message: 'Minimum investment amount is ₹500' };
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            const fund = await tx.mutualFund.findUnique({ where: { id: fundId } });
            if (!fund)
                throw { status: 404, message: 'Mutual Fund not found' };
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet || wallet.availableBalance < amount) {
                throw {
                    status: 400,
                    message: `Insufficient wallet balance. Required: ₹${amount.toFixed(2)}, Available: ₹${wallet?.availableBalance.toFixed(2) || '0.00'}`,
                };
            }
            // Compute units allocated at current NAV
            const unitsAllocated = Number((amount / fund.nav).toFixed(4));
            const refId = `MF_LUMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            // 1. Debit Wallet
            const balanceBefore = wallet.availableBalance;
            const balanceAfter = balanceBefore - amount;
            const newInvested = wallet.investedBalance + amount;
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    availableBalance: balanceAfter,
                    investedBalance: newInvested,
                },
            });
            // 2. Record Double-Entry Ledger
            await tx.walletLedger.create({
                data: {
                    walletId: wallet.id,
                    transactionType: enums_1.TransactionType.MUTUAL_FUND_INVEST,
                    amount: -amount,
                    balanceBefore,
                    balanceAfter,
                    referenceId: refId,
                    description: `Mutual Fund Lump-Sum: Purchased ${unitsAllocated} units of ${fund.name} @ NAV ₹${fund.nav.toFixed(2)}`,
                },
            });
            // 3. Update or Create Mutual Fund Holding
            const existingHolding = await tx.mutualFundHolding.findUnique({
                where: { userId_fundId: { userId, fundId } },
            });
            let holding;
            if (existingHolding) {
                const newUnits = Number((existingHolding.units + unitsAllocated).toFixed(4));
                const newTotalInvested = existingHolding.totalInvested + amount;
                const newAvgNav = Number((newTotalInvested / newUnits).toFixed(2));
                holding = await tx.mutualFundHolding.update({
                    where: { id: existingHolding.id },
                    data: {
                        units: newUnits,
                        averageNav: newAvgNav,
                        totalInvested: newTotalInvested,
                    },
                });
            }
            else {
                holding = await tx.mutualFundHolding.create({
                    data: {
                        userId,
                        fundId,
                        units: unitsAllocated,
                        averageNav: fund.nav,
                        totalInvested: amount,
                    },
                });
            }
            // 4. Record Mutual Fund Transaction
            const transaction = await tx.mutualFundTransaction.create({
                data: {
                    userId,
                    fundId,
                    transactionType: 'LUMPSUM_INVEST',
                    amount,
                    nav: fund.nav,
                    units: unitsAllocated,
                    referenceId: refId,
                    status: 'SUCCESS',
                },
            });
            // 5. In-App Notification
            await tx.notification.create({
                data: {
                    userId,
                    title: 'Mutual Fund Investment Successful',
                    message: `Allotted ${unitsAllocated} units of ${fund.name} at NAV ₹${fund.nav.toFixed(2)} for ₹${amount.toLocaleString('en-IN')}`,
                    type: enums_1.NotificationType.ORDER_MATCH,
                    referenceId: refId,
                },
            });
            return {
                fund,
                holding,
                transaction,
            };
        });
    }
    /**
     * Redeems mutual fund units and credits wallet with net value
     */
    static async redeem(userId, fundId, units) {
        if (units <= 0) {
            throw { status: 400, message: 'Redemption units must be greater than zero' };
        }
        return await prisma_1.prisma.$transaction(async (tx) => {
            const fund = await tx.mutualFund.findUnique({ where: { id: fundId } });
            if (!fund)
                throw { status: 404, message: 'Mutual Fund not found' };
            const holding = await tx.mutualFundHolding.findUnique({
                where: { userId_fundId: { userId, fundId } },
            });
            if (!holding || holding.units < units) {
                throw {
                    status: 400,
                    message: `Insufficient units. You hold ${holding?.units || 0} units, cannot redeem ${units}`,
                };
            }
            const redemptionValue = Number((units * fund.nav).toFixed(2));
            const refId = `MF_RED_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            // 1. Credit Wallet
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet)
                throw { status: 404, message: 'Wallet not found' };
            const balanceBefore = wallet.availableBalance;
            const balanceAfter = balanceBefore + redemptionValue;
            const newInvested = Math.max(0, wallet.investedBalance - (units * holding.averageNav));
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    availableBalance: balanceAfter,
                    investedBalance: newInvested,
                },
            });
            // 2. Record Double-Entry Ledger
            await tx.walletLedger.create({
                data: {
                    walletId: wallet.id,
                    transactionType: enums_1.TransactionType.MUTUAL_FUND_REDEEM,
                    amount: redemptionValue,
                    balanceBefore,
                    balanceAfter,
                    referenceId: refId,
                    description: `Mutual Fund Redemption: Sold ${units} units of ${fund.name} @ NAV ₹${fund.nav.toFixed(2)}`,
                },
            });
            // 3. Update Holding
            const remainingUnits = Number((holding.units - units).toFixed(4));
            const remainingInvested = remainingUnits > 0 ? Number((remainingUnits * holding.averageNav).toFixed(2)) : 0.0;
            const updatedHolding = await tx.mutualFundHolding.update({
                where: { id: holding.id },
                data: {
                    units: remainingUnits,
                    totalInvested: remainingInvested,
                },
            });
            // 4. Record Transaction
            const transaction = await tx.mutualFundTransaction.create({
                data: {
                    userId,
                    fundId,
                    transactionType: 'REDEMPTION',
                    amount: redemptionValue,
                    nav: fund.nav,
                    units,
                    referenceId: refId,
                    status: 'SUCCESS',
                },
            });
            // 5. In-App Notification
            await tx.notification.create({
                data: {
                    userId,
                    title: 'Mutual Fund Units Redeemed',
                    message: `Redeemed ${units} units of ${fund.name}. ₹${redemptionValue.toLocaleString('en-IN')} credited to your wallet.`,
                    type: enums_1.NotificationType.ORDER_MATCH,
                    referenceId: refId,
                },
            });
            return {
                fund,
                holding: updatedHolding,
                transaction,
                redemptionValue,
            };
        });
    }
    /**
     * Retrieves all mutual fund holdings and calculated current returns for a user
     */
    static async getUserMfHoldings(userId) {
        const holdings = await prisma_1.prisma.mutualFundHolding.findMany({
            where: { userId, units: { gt: 0 } },
            include: { fund: true },
        });
        let totalInvested = 0;
        let currentValuation = 0;
        const detailedHoldings = holdings.map((h) => {
            const curVal = Number((h.units * h.fund.nav).toFixed(2));
            const pnl = Number((curVal - h.totalInvested).toFixed(2));
            const pnlPercent = h.totalInvested > 0 ? Number(((pnl / h.totalInvested) * 100).toFixed(2)) : 0;
            totalInvested += h.totalInvested;
            currentValuation += curVal;
            return {
                id: h.id,
                fundId: h.fundId,
                name: h.fund.name,
                code: h.fund.code,
                category: h.fund.category,
                units: h.units,
                averageNav: h.averageNav,
                currentNav: h.fund.nav,
                totalInvested: Number(h.totalInvested.toFixed(2)),
                currentValuation: curVal,
                pnl,
                pnlPercent,
                cagr3y: h.fund.cagr3y,
                risk: h.fund.risk,
                fund: h.fund,
            };
        });
        const totalPnl = Number((currentValuation - totalInvested).toFixed(2));
        const totalPnlPercent = totalInvested > 0 ? Number(((totalPnl / totalInvested) * 100).toFixed(2)) : 0;
        return {
            summary: {
                totalInvested: Number(totalInvested.toFixed(2)),
                currentValuation: Number(currentValuation.toFixed(2)),
                totalPnl,
                totalPnlPercent,
                fundsCount: detailedHoldings.length,
            },
            holdings: detailedHoldings,
        };
    }
}
exports.MutualFundsService = MutualFundsService;
//# sourceMappingURL=mutual-funds.service.js.map