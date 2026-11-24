import React from 'react';
import { useAuth } from '../context/AuthContext';
import { WalletCards } from '../components/WalletCards';
import { LedgerTable } from '../components/LedgerTable';
import { WalletLedgerEntry, TransactionType } from '../types';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface WalletHubProps {
  onNavigateToKyc: () => void;
  onOpenDepositModal: () => void;
  onClaimMonthly: () => void;
  onTestReserve: () => void;
  onTestRelease: () => void;
  loadingAction: boolean;
  ledgerEntries: WalletLedgerEntry[];
  totalLedgerEntries: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedType: TransactionType | '';
  onTypeChange: (type: TransactionType | '') => void;
  loadingLedger: boolean;
}

export const WalletHub: React.FC<WalletHubProps> = ({
  onNavigateToKyc,
  onOpenDepositModal,
  onClaimMonthly,
  onTestReserve,
  onTestRelease,
  loadingAction,
  ledgerEntries,
  totalLedgerEntries,
  currentPage,
  totalPages,
  onPageChange,
  selectedType,
  onTypeChange,
  loadingLedger,
}) => {
  const { user, wallet } = useAuth();

  if (user?.kycStatus !== 'ACTIVE') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-[#151A23] border border-[#232B3B] text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Wallet Locked (KYC Incomplete)</h2>
        <p className="text-xs text-gray-300">
          In compliance with financial simulation requirements, wallet transactions and trading ledgers are restricted until identity verification is completed.
        </p>
        <button
          onClick={onNavigateToKyc}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>Complete KYC & Unlock ₹1,00,000</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Wallet & Double-Entry Ledger Hub</h1>
        <p className="text-xs text-gray-400">
          Real-time balance accounting, fund reservation escrow, and immutable transaction audit book.
        </p>
      </div>

      {/* Metric Cards */}
      <WalletCards
        wallet={wallet}
        onOpenDepositModal={onOpenDepositModal}
        onClaimMonthly={onClaimMonthly}
        onTestReserve={onTestReserve}
        onTestRelease={onTestRelease}
        loadingAction={loadingAction}
      />

      {/* Full Paginated Ledger Table */}
      <LedgerTable
        entries={ledgerEntries}
        totalEntries={totalLedgerEntries}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        loading={loadingLedger}
      />
    </div>
  );
};
