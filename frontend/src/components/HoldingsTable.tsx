import React, { useState } from 'react';
import { Holding } from '../types';
import { TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { orderApi } from '../services/order.service';

interface HoldingsTableProps {
  holdings: Holding[];
  onHoldingUpdated: () => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onHoldingUpdated }) => {
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleOpenSellModal = (holding: Holding) => {
    setSelectedHolding(holding);
    setSellQuantity(holding.quantity);
    setMsg(null);
  };

  const handleExecuteSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHolding) return;
    setLoading(true);
    setMsg(null);

    try {
      const res = await orderApi.placeOrder({
        symbol: selectedHolding.symbol,
        side: 'SELL',
        orderType: 'MARKET',
        quantity: sellQuantity,
      });

      if (res.success) {
        setMsg({ text: `Sold ${sellQuantity}x ${selectedHolding.symbol} successfully!`, isError: false });
        setTimeout(() => {
          setSelectedHolding(null);
          onHoldingUpdated();
        }, 1200);
      }
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Failed to sell shares', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fintech-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Stock Portfolio Holdings</h3>
          <p className="text-xs text-gray-400">
            Real-time equity positions, weighted average acquisition prices, and floating P&L.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#1E293B] text-gray-300 font-mono">
          {holdings.length} Positions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080C14] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#1E293B]">
            <tr>
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Avg. Price</th>
              <th className="py-3 px-4 text-right">LTP (CMP)</th>
              <th className="py-3 px-4 text-right">Cur. Value</th>
              <th className="py-3 px-4 text-right">P&L (Returns)</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {holdings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No open stock holdings. Use the Trading Terminal to buy stocks with your ₹1,00,000 virtual capital!
                </td>
              </tr>
            ) : (
              holdings.map((h) => {
                const isPos = h.unrealizedPnL >= 0;
                return (
                  <tr key={h.id} className="hover:bg-[#131D31]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{h.symbol}</div>
                      <div className="text-[11px] text-gray-400">{h.name}</div>
                    </td>
                    <td className="py-3 px-4 text-right mono-num font-semibold text-gray-200">
                      {h.quantity}
                    </td>
                    <td className="py-3 px-4 text-right mono-num text-gray-400">
                      ₹{h.averageBuyPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right mono-num font-bold text-white">
                      ₹{h.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right mono-num font-semibold text-white">
                      ₹{h.currentValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className={`mono-num font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}₹{Math.abs(h.unrealizedPnL).toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-semibold flex items-center justify-end ${
                          isPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                        {isPos ? '+' : ''}
                        {h.unrealizedPnLPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenSellModal(h)}
                        className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
                      >
                        <span>Sell</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Sell Modal */}
      {selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedHolding(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">
              Exit Position: {selectedHolding.symbol}
            </h3>
            <p className="text-xs text-gray-400">
              Selling at current market price (CMP: ₹{selectedHolding.currentPrice.toFixed(2)}). Total owned: {selectedHolding.quantity} shares.
            </p>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  msg.isError
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {msg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleExecuteSell} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Quantity to Sell (Max {selectedHolding.quantity})
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedHolding.quantity}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(Math.min(selectedHolding.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 bg-[#080C14] border border-[#1E293B] focus:border-rose-500 rounded-xl text-white font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B] text-xs space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Est. Credit to Available Cash:</span>
                  <span className="mono-num text-emerald-400 font-bold">
                    ₹{(sellQuantity * selectedHolding.currentPrice * 0.9995).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-glow-red"
              >
                {loading ? 'Executing Trade...' : `Confirm Market Sell (${sellQuantity} Shares)`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
