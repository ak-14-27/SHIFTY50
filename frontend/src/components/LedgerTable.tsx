import React, { useState } from 'react';
import { WalletLedgerEntry, TransactionType } from '../types';
import { ArrowDownLeft, ArrowUpRight, Lock, Unlock, Calendar, Copy, Check, Filter } from 'lucide-react';

interface LedgerTableProps {
  entries: WalletLedgerEntry[];
  totalEntries: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedType: TransactionType | '';
  onTypeChange: (type: TransactionType | '') => void;
  loading: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  entries,
  totalEntries,
  currentPage,
  totalPages,
  onPageChange,
  selectedType,
  onTypeChange,
  loading,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTransactionBadge = (type: TransactionType) => {
    switch (type) {
      case 'MONTHLY_CREDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3 h-3" /> Monthly Credit
          </span>
        );
      case 'FUNDS_ADDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <ArrowDownLeft className="w-3 h-3" /> Deposit
          </span>
        );
      case 'ORDER_HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="w-3 h-3" /> Order Lock
          </span>
        );
      case 'ORDER_RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Unlock className="w-3 h-3" /> Order Release
          </span>
        );
      case 'TRADE_DEBIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="w-3 h-3" /> Trade Executed
          </span>
        );
      case 'TRADE_CREDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3 h-3" /> Sale Settlement
          </span>
        );
      case 'SIP_DEDUCTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Calendar className="w-3 h-3" /> SIP Auto-Debit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-700 text-gray-300">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#151A23] border border-[#232B3B] space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Immutable Double-Entry Ledger Book
            <span className="text-xs font-normal text-gray-400">({totalEntries} records)</span>
          </h3>
          <p className="text-xs text-gray-400">
            Every balance alteration is recorded with before & after state to enforce complete auditability.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as TransactionType | '')}
            className="bg-[#0E121A] border border-[#232B3B] text-xs text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Transactions</option>
            <option value="MONTHLY_CREDIT">Monthly Credit</option>
            <option value="FUNDS_ADDED">Deposits</option>
            <option value="ORDER_HOLD">Order Holds</option>
            <option value="ORDER_RELEASE">Order Releases</option>
            <option value="TRADE_DEBIT">Trade Executions</option>
            <option value="SIP_DEDUCTION">SIP Auto-Debits</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0E121A] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#232B3B]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Description / Reference</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Balance Change</th>
              <th className="py-3 px-4 text-center">Ref ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232B3B]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading ledger entries...</span>
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No ledger records found for this filter.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isPositive = entry.amount > 0;
                return (
                  <tr key={entry.id} className="hover:bg-[#1C2331]/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getTransactionBadge(entry.transactionType)}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-white max-w-xs truncate">{entry.description}</p>
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-4 text-right mono-num font-semibold whitespace-nowrap ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}₹
                      {Math.abs(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Balance Before -> After */}
                    <td className="py-3 px-4 text-right mono-num text-gray-300 whitespace-nowrap">
                      <span className="text-gray-500">₹{entry.balanceBefore.toFixed(0)}</span>
                      <span className="mx-1 text-gray-500">→</span>
                      <span className="font-bold text-white">₹{entry.balanceAfter.toFixed(0)}</span>
                    </td>

                    {/* Reference ID copy */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {entry.referenceId ? (
                        <button
                          onClick={() => handleCopy(entry.referenceId!)}
                          title="Copy Reference ID"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0E121A] hover:bg-[#232B3B] text-gray-400 hover:text-white transition-colors text-[10px] font-mono"
                        >
                          {copiedId === entry.referenceId ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{entry.referenceId.slice(0, 10)}...</span>
                        </button>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-[#232B3B]">
          <span className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-[#0E121A] text-xs text-gray-300 rounded border border-[#232B3B] disabled:opacity-40 hover:bg-[#1C2331]"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-[#0E121A] text-xs text-gray-300 rounded border border-[#232B3B] disabled:opacity-40 hover:bg-[#1C2331]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
