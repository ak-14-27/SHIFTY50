import React from 'react';
import { useAuth } from '../context/AuthContext';
import { WalletCards } from '../components/WalletCards';
import { LedgerTable } from '../components/LedgerTable';
import { ShieldAlert, ArrowRight, TrendingUp, CandlestickChart, Briefcase, Zap, Sparkles } from 'lucide-react';
import { WalletLedgerEntry } from '../types';

interface DashboardProps {
  onNavigateToKyc: () => void;
  onNavigateToTerminal: () => void;
  onNavigateToPortfolio: () => void;
  onNavigateToWallet: () => void;
  onOpenDepositModal: () => void;
  onClaimMonthly: () => void;
  onTestReserve: () => void;
  onTestRelease: () => void;
  loadingAction: boolean;
  ledgerEntries: WalletLedgerEntry[];
  totalLedgerEntries: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToKyc,
  onNavigateToTerminal,
  onNavigateToPortfolio,
  onNavigateToWallet,
  onOpenDepositModal,
  onClaimMonthly,
  onTestReserve,
  onTestRelease,
  loadingAction,
  ledgerEntries,
  totalLedgerEntries,
}) => {
  const { user, wallet } = useAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KYC Alert if not active */}
      {user?.kycStatus !== 'ACTIVE' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-emerald">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">KYC Verification Incomplete</h3>
              <p className="text-xs text-gray-300">
                Complete mock identity verification (PAN & Aadhaar) to unlock trading order books and claim your <strong className="text-amber-400">₹1,00,000 monthly virtual capital</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToKyc}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex-shrink-0"
          >
            <span>Complete KYC Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Market Dashboard • {user?.fullName} 👋
          </h1>
          <p className="text-xs text-gray-400">
            $hifty50 Modular Monolith Engine • Price-Time Priority Matching Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToTerminal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald transition-all"
          >
            <CandlestickChart className="w-4 h-4 stroke-[2.5]" />
            <span>Open Trading Terminal</span>
          </button>

          <button
            onClick={onNavigateToPortfolio}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-white transition-colors"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>View Holdings</span>
          </button>
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <WalletCards
        wallet={wallet}
        onOpenDepositModal={onOpenDepositModal}
        onClaimMonthly={onClaimMonthly}
        onTestReserve={onTestReserve}
        onTestRelease={onTestRelease}
        loadingAction={loadingAction}
      />

      {/* System Design Highlights for Mid-Term Lab Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="fintech-card p-4 space-y-2 border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>Price-Time Priority Engine</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Resting maker orders match with price-time priority. Partial fills and full fills are settled atomically in a single ACID transaction.
          </p>
        </div>

        <div className="fintech-card p-4 space-y-2 border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>Weighted Average P&L Engine</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Holdings automatically compute weighted average buy prices across multiple fills and calculate real-time floating & realized P&L.
          </p>
        </div>

        <div className="fintech-card p-4 space-y-2 border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Zero-Race Concurrency</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Row-level isolation locks on order book and wallet balances guarantee zero double fills and zero overdrafts under concurrent order placement.
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Ledger Transactions</h2>
          <button
            onClick={onNavigateToWallet}
            className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View Full Ledger Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <LedgerTable
          entries={(Array.isArray(ledgerEntries) ? ledgerEntries : []).slice(0, 5)}
          totalEntries={totalLedgerEntries}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          selectedType=""
          onTypeChange={() => {}}
          loading={false}
        />
      </div>
    </div>
  );
};
