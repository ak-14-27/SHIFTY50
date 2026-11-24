import { prisma } from '../../shared/db/prisma';
import { TransactionType, NotificationType, SipFrequency, SipStatus } from '../../shared/types/enums';

export class SipService {
  /**
   * Calculates next execution date based on frequency
   */
  static getNextDate(fromDate: Date, frequency: string): Date {
    const next = new Date(fromDate);
    switch (frequency) {
      case SipFrequency.DAILY:
        next.setDate(next.getDate() + 1);
        break;
      case SipFrequency.WEEKLY:
        next.setDate(next.getDate() + 7);
        break;
      case SipFrequency.MONTHLY:
      default:
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }

  /**
   * Sets up a new recurring SIP and executes the 1st installment immediately
   */
  static async createSip(
    userId: string,
    fundId: string,
    amount: number,
    frequency: string = SipFrequency.MONTHLY
  ) {
    if (amount < 500) {
      throw { status: 400, message: 'Minimum SIP installment amount is ₹500' };
    }

    return await prisma.$transaction(async (tx) => {
      const fund = await tx.mutualFund.findUnique({ where: { id: fundId } });
      if (!fund) throw { status: 404, message: 'Mutual Fund not found' };

      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.availableBalance < amount) {
        throw {
          status: 400,
          message: `Insufficient wallet balance for first SIP installment. Required: ₹${amount.toFixed(2)}, Available: ₹${wallet?.availableBalance.toFixed(2) || '0.00'}`,
        };
      }

      // Calculate next installment date
      const nextExecutionDate = this.getNextDate(new Date(), frequency);

      // 1. Create SIP record
      const sip = await tx.sip.create({
        data: {
          userId,
          fundId,
          amount,
          frequency,
          status: SipStatus.ACTIVE,
          startDate: new Date(),
          nextExecutionDate,
          totalInstallments: 1,
          successfulInstallments: 1,
        },
      });

      // 2. Execute 1st installment: Debit Wallet
      const unitsAllocated = Number((amount / fund.nav).toFixed(4));
      const refId = `SIP_INST_${sip.id.slice(0, 8)}_${Date.now()}`;

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

      // 3. Record Double-Entry Ledger
      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType: TransactionType.SIP_DEDUCTION,
          amount: -amount,
          balanceBefore,
          balanceAfter,
          referenceId: refId,
          description: `SIP Installment #1: ${fund.name} (${frequency}) - ${unitsAllocated} units @ NAV ₹${fund.nav.toFixed(2)}`,
        },
      });

      // 4. Update or Create Mutual Fund Holding
      const existingHolding = await tx.mutualFundHolding.findUnique({
        where: { userId_fundId: { userId, fundId } },
      });

      if (existingHolding) {
        const newUnits = Number((existingHolding.units + unitsAllocated).toFixed(4));
        const newTotalInvested = existingHolding.totalInvested + amount;
        const newAvgNav = Number((newTotalInvested / newUnits).toFixed(2));

        await tx.mutualFundHolding.update({
          where: { id: existingHolding.id },
          data: {
            units: newUnits,
            averageNav: newAvgNav,
            totalInvested: newTotalInvested,
          },
        });
      } else {
        await tx.mutualFundHolding.create({
          data: {
            userId,
            fundId,
            units: unitsAllocated,
            averageNav: fund.nav,
            totalInvested: amount,
          },
        });
      }

      // 5. Record MF Transaction
      await tx.mutualFundTransaction.create({
        data: {
          userId,
          fundId,
          sipId: sip.id,
          transactionType: 'SIP_INSTALLMENT',
          amount,
          nav: fund.nav,
          units: unitsAllocated,
          referenceId: refId,
          status: 'SUCCESS',
        },
      });

      // 6. Notification
      await tx.notification.create({
        data: {
          userId,
          title: 'SIP Mandate Activated',
          message: `SIP of ₹${amount.toLocaleString('en-IN')}/${frequency.toLowerCase()} started for ${fund.name}. Installment #1 executed successfully.`,
          type: NotificationType.SIP_EXECUTION,
          referenceId: sip.id,
        },
      });

      return sip;
    });
  }

  /**
   * Retrieves all SIPs configured by the user
   */
  static async getUserSips(userId: string) {
    return await prisma.sip.findMany({
      where: { userId },
      include: {
        fund: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates SIP status (Pause, Resume, Cancel)
   */
  static async updateSipStatus(userId: string, sipId: string, status: string) {
    const validStatuses = [SipStatus.ACTIVE, SipStatus.PAUSED, SipStatus.CANCELLED];
    if (!validStatuses.includes(status as SipStatus)) {
      throw { status: 400, message: 'Invalid SIP status' };
    }

    const sip = await prisma.sip.findUnique({
      where: { id: sipId },
      include: { fund: true },
    });

    if (!sip || sip.userId !== userId) {
      throw { status: 404, message: 'SIP not found' };
    }

    const updated = await prisma.sip.update({
      where: { id: sipId },
      data: { status },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: `SIP ${status === 'ACTIVE' ? 'Resumed' : status === 'PAUSED' ? 'Paused' : 'Cancelled'}`,
        message: `Your SIP of ₹${sip.amount.toLocaleString('en-IN')} in ${sip.fund.name} has been ${status.toLowerCase()}.`,
        type: NotificationType.SIP_EXECUTION,
        referenceId: sip.id,
      },
    });

    return updated;
  }

  /**
   * Executes scheduled / due SIP installments (Can be triggered via cron or evaluation demo endpoint)
   */
  static async executeDueSips() {
    const now = new Date();
    const dueSips = await prisma.sip.findMany({
      where: {
        status: SipStatus.ACTIVE,
        nextExecutionDate: { lte: now },
      },
      include: { fund: true },
    });

    const executionResults = [];

    for (const sip of dueSips) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          const wallet = await tx.wallet.findUnique({ where: { userId: sip.userId } });

          // Check if wallet has sufficient balance
          if (!wallet || wallet.availableBalance < sip.amount) {
            // Insufficient balance: record skipped notification, advance next date
            const nextDate = this.getNextDate(sip.nextExecutionDate, sip.frequency);
            await tx.sip.update({
              where: { id: sip.id },
              data: {
                totalInstallments: sip.totalInstallments + 1,
                nextExecutionDate: nextDate,
              },
            });

            await tx.notification.create({
              data: {
                userId: sip.userId,
                title: 'SIP Auto-Debit Skipped',
                message: `Insufficient funds for SIP installment of ₹${sip.amount.toLocaleString('en-IN')} in ${sip.fund.name}. Next attempt on ${nextDate.toLocaleDateString('en-IN')}.`,
                type: NotificationType.SIP_EXECUTION,
                referenceId: sip.id,
              },
            });

            return { sipId: sip.id, status: 'SKIPPED_INSUFFICIENT_FUNDS' };
          }

          // Sufficient balance: Execute installment
          const unitsAllocated = Number((sip.amount / sip.fund.nav).toFixed(4));
          const refId = `SIP_AUTO_${sip.id.slice(0, 8)}_${Date.now()}`;

          // Debit wallet
          const balanceBefore = wallet.availableBalance;
          const balanceAfter = balanceBefore - sip.amount;
          const newInvested = wallet.investedBalance + sip.amount;

          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              availableBalance: balanceAfter,
              investedBalance: newInvested,
            },
          });

          // Write ledger
          await tx.walletLedger.create({
            data: {
              walletId: wallet.id,
              transactionType: TransactionType.SIP_DEDUCTION,
              amount: -sip.amount,
              balanceBefore,
              balanceAfter,
              referenceId: refId,
              description: `SIP Recurring Debit #${sip.successfulInstallments + 1}: ${sip.fund.name} (${sip.frequency}) - ${unitsAllocated} units @ NAV ₹${sip.fund.nav.toFixed(2)}`,
            },
          });

          // Update holding
          const holding = await tx.mutualFundHolding.findUnique({
            where: { userId_fundId: { userId: sip.userId, fundId: sip.fundId } },
          });

          if (holding) {
            const newUnits = Number((holding.units + unitsAllocated).toFixed(4));
            const newTotalInvested = holding.totalInvested + sip.amount;
            const newAvgNav = Number((newTotalInvested / newUnits).toFixed(2));

            await tx.mutualFundHolding.update({
              where: { id: holding.id },
              data: {
                units: newUnits,
                averageNav: newAvgNav,
                totalInvested: newTotalInvested,
              },
            });
          }

          // Record MF transaction
          await tx.mutualFundTransaction.create({
            data: {
              userId: sip.userId,
              fundId: sip.fundId,
              sipId: sip.id,
              transactionType: 'SIP_INSTALLMENT',
              amount: sip.amount,
              nav: sip.fund.nav,
              units: unitsAllocated,
              referenceId: refId,
              status: 'SUCCESS',
            },
          });

          // Advance next date
          const nextDate = this.getNextDate(sip.nextExecutionDate, sip.frequency);
          await tx.sip.update({
            where: { id: sip.id },
            data: {
              totalInstallments: sip.totalInstallments + 1,
              successfulInstallments: sip.successfulInstallments + 1,
              nextExecutionDate: nextDate,
            },
          });

          // Notification
          await tx.notification.create({
            data: {
              userId: sip.userId,
              title: 'SIP Auto-Debit Executed',
              message: `Recurring SIP installment of ₹${sip.amount.toLocaleString('en-IN')} debited for ${sip.fund.name}. Allotted ${unitsAllocated} units.`,
              type: NotificationType.SIP_EXECUTION,
              referenceId: sip.id,
            },
          });

          return { sipId: sip.id, status: 'EXECUTED_SUCCESS' };
        });

        executionResults.push(result);
      } catch (err: any) {
        executionResults.push({ sipId: sip.id, status: 'ERROR', error: err.message });
      }
    }

    return {
      totalProcessed: dueSips.length,
      results: executionResults,
    };
  }

  /**
   * Immediately triggers single SIP installment (for live teacher evaluation demonstration)
   */
  static async triggerSingleSipNow(userId: string, sipId: string) {
    const sip = await prisma.sip.findUnique({
      where: { id: sipId },
      include: { fund: true },
    });

    if (!sip || sip.userId !== userId) {
      throw { status: 404, message: 'SIP not found' };
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.availableBalance < sip.amount) {
        throw {
          status: 400,
          message: `Insufficient wallet balance. Required: ₹${sip.amount.toFixed(2)}, Available: ₹${wallet?.availableBalance.toFixed(2) || '0.00'}`,
        };
      }

      const unitsAllocated = Number((sip.amount / sip.fund.nav).toFixed(4));
      const refId = `SIP_DEMO_${sip.id.slice(0, 8)}_${Date.now()}`;

      // Debit wallet
      const balanceBefore = wallet.availableBalance;
      const balanceAfter = balanceBefore - sip.amount;
      const newInvested = wallet.investedBalance + sip.amount;

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: balanceAfter,
          investedBalance: newInvested,
        },
      });

      // Write ledger
      await tx.walletLedger.create({
        data: {
          walletId: wallet.id,
          transactionType: TransactionType.SIP_DEDUCTION,
          amount: -sip.amount,
          balanceBefore,
          balanceAfter,
          referenceId: refId,
          description: `SIP Manual Trigger #${sip.successfulInstallments + 1}: ${sip.fund.name} - ${unitsAllocated} units @ NAV ₹${sip.fund.nav.toFixed(2)}`,
        },
      });

      // Update holding
      const holding = await tx.mutualFundHolding.findUnique({
        where: { userId_fundId: { userId, fundId: sip.fundId } },
      });

      if (holding) {
        const newUnits = Number((holding.units + unitsAllocated).toFixed(4));
        const newTotalInvested = holding.totalInvested + sip.amount;
        const newAvgNav = Number((newTotalInvested / newUnits).toFixed(2));

        await tx.mutualFundHolding.update({
          where: { id: holding.id },
          data: {
            units: newUnits,
            averageNav: newAvgNav,
            totalInvested: newTotalInvested,
          },
        });
      } else {
        await tx.mutualFundHolding.create({
          data: {
            userId,
            fundId: sip.fundId,
            units: unitsAllocated,
            averageNav: sip.fund.nav,
            totalInvested: sip.amount,
          },
        });
      }

      // Record MF transaction
      await tx.mutualFundTransaction.create({
        data: {
          userId,
          fundId: sip.fundId,
          sipId: sip.id,
          transactionType: 'SIP_INSTALLMENT',
          amount: sip.amount,
          nav: sip.fund.nav,
          units: unitsAllocated,
          referenceId: refId,
          status: 'SUCCESS',
        },
      });

      const nextDate = this.getNextDate(new Date(), sip.frequency);
      const updatedSip = await tx.sip.update({
        where: { id: sip.id },
        data: {
          totalInstallments: sip.totalInstallments + 1,
          successfulInstallments: sip.successfulInstallments + 1,
          nextExecutionDate: nextDate,
        },
        include: { fund: true },
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'SIP Installment Executed',
          message: `Manual demo trigger: Debited ₹${sip.amount.toLocaleString('en-IN')} for ${sip.fund.name}. Allotted ${unitsAllocated} units.`,
          type: NotificationType.SIP_EXECUTION,
          referenceId: sip.id,
        },
      });

      return updatedSip;
    });
  }
}
