import React from 'react';
import { Trade } from '../types';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface TradeBookTableProps {
  trades: Trade[];
}

export const TradeBookTable: React.FC<TradeBookTableProps> = ({ trades }) => {
  return (
    <div className="fintech-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Trade Execution Log (Trade Book)</h3>
          <p className="text-xs text-gray-400">
            Chronological log of cleared and settled trades with counterparties.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1E293B] text-gray-300 font-mono">
          {trades.length} Trades Executed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080C14] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#1E293B]">
            <tr>
              <th className="py-3 px-4">Execution Time</th>
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4">Side</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Exec. Price</th>
              <th className="py-3 px-4 text-right">Turnover</th>
              <th className="py-3 px-4 text-right">Brokerage</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No trades executed yet. Place an order to see settled trades here!
                </td>
              </tr>
            ) : (
              trades.map((t) => {
                const isBuy = t.side === 'BUY';
                return (
                  <tr key={t.id} className="hover:bg-[#131D31]/60 transition-colors">
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap font-mono">
                      {new Date(t.executedAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{t.symbol}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isBuy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isBuy ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {t.side}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right mono-num font-semibold text-gray-200">
                      {t.quantity}
                    </td>
                    <td className="py-3 px-4 text-right mono-num font-bold text-white">
                      ₹{t.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right mono-num font-semibold text-gray-200">
                      ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right mono-num text-gray-400">
                      ₹{t.fee.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Settled
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
