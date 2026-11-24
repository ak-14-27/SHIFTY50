import React from 'react';
import { Wallet } from '../types';
import { Wallet as WalletIcon, Lock, PieChart, Sparkles, Plus, RefreshCw } from 'lucide-react';

interface WalletCardsProps {
  wallet: Wallet | null;
  onOpenDepositModal: () => void;
  onClaimMonthly: () => void;
  onTestReserve: () => void;
  onTestRelease: () => void;
  loadingAction: boolean;
}

export const WalletCards: React.FC<WalletCardsProps> = ({
  wallet,
  onOpenDepositModal,
  onClaimMonthly,
  onTestReserve,
  onTestRelease,
  loadingAction,
}) => {
  const available = wallet?.availableBalance || 0;
  const reserved = wallet?.reservedBalance || 0;
  const invested = wallet?.investedBalance || 0;
  const total = available + reserved + invested;

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Net Worth */}
        <div className="fintech-card p-5 border-emerald-500/30 relative overflow-hidden shadow-glow-emerald">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400">Total Capital Valuation</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ACID Verified
            </span>
          </div>
          <div className="mono-num text-2xl lg:text-3xl font-extrabold text-white mb-1">
            ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400">Available + Reserved + Invested</p>
        </div>

        {/* Available Trading Balance */}
        <div className="fintech-card p-5 border-emerald-500/20 relative shadow-card hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400">Available for Trading</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mono-num text-2xl font-bold text-white mb-1">
            ₹{available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400">Immediately spendable cash</p>
        </div>

        {/* Reserved in Orders */}
        <div className="fintech-card p-5 border-amber-500/20 relative shadow-card hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-400">Reserved (Open Orders)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mono-num text-2xl font-bold text-white mb-1">
            ₹{reserved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400">Locked against pending limit orders</p>
        </div>

        {/* Invested Capital */}
        <div className="fintech-card p-5 border-blue-500/20 relative shadow-card hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-400">Invested in Equities</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mono-num text-2xl font-bold text-white mb-1">
            ₹{invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-gray-400">Settled stock holdings value</p>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="fintech-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">Interactive Wallet & Capital Controls:</span>
          <span className="text-gray-400 hidden sm:inline">Simulate atomic double-entry ledger triggers</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onClaimMonthly}
            disabled={loadingAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
            +₹1,00,000 Monthly Capital
          </button>

          <button
            onClick={onOpenDepositModal}
            disabled={loadingAction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-glow-emerald disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add Funds (UPI/Card)
          </button>

          <button
            onClick={onTestReserve}
            disabled={loadingAction || available < 10000}
            title="Simulate locking ₹10,000 for a limit order"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-all disabled:opacity-50"
          >
            <Lock className="w-3.5 h-3.5" />
            Test Hold ₹10k
          </button>

          <button
            onClick={onTestRelease}
            disabled={loadingAction || reserved <= 0}
            title="Simulate releasing ₹10,000 from cancelled order"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Test Release ₹10k
          </button>
        </div>
      </div>
    </div>
  );
};
