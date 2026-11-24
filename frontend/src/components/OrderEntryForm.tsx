import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/order.service';
import { Stock, Wallet } from '../types';
import { ArrowUpRight, ArrowDownLeft, Zap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderEntryFormProps {
  stock: Stock;
  wallet: Wallet | null;
  selectedPrice?: number | null;
  onOrderSuccess: () => void;
}

export const OrderEntryForm: React.FC<OrderEntryFormProps> = ({
  stock,
  wallet,
  selectedPrice,
  onOrderSuccess,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(stock.currentPrice);
  const [loading, setLoading] = useState(false);
  const [simLoading, setSimLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (selectedPrice) {
      setPrice(selectedPrice);
      setOrderType('LIMIT');
    } else {
      setPrice(stock.currentPrice);
    }
  }, [selectedPrice, stock.symbol]);

  const effectivePrice = orderType === 'MARKET' ? stock.currentPrice : price;
  const estimatedTotal = Number((quantity * effectivePrice).toFixed(2));
  const brokerageFee = Number((estimatedTotal * 0.0005).toFixed(2));
  const totalRequired = estimatedTotal;

  const availableCash = wallet?.availableBalance || 0;
  const hasSufficientCash = side === 'SELL' || availableCash >= totalRequired;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await orderApi.placeOrder({
        symbol: stock.symbol,
        side,
        orderType,
        quantity,
        price: orderType === 'LIMIT' ? price : undefined,
      });

      if (res.success) {
        setMessage({ text: res.message || 'Order placed successfully!', type: 'success' });
        onOrderSuccess();
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Failed to place order',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCounterparty = async () => {
    setSimLoading(true);
    setMessage(null);
    try {
      // Create opposite order from market maker
      const oppSide = side === 'BUY' ? 'SELL' : 'BUY';
      const targetPrice = effectivePrice;
      const res = await orderApi.simulateCounterparty({
        symbol: stock.symbol,
        side: oppSide,
        quantity,
        price: targetPrice,
      });

      if (res.success) {
        setMessage({
          text: `⚡ Matching Engine Triggered! Counterparty ${oppSide} matched against resting order book.`,
          type: 'success',
        });
        onOrderSuccess();
      }
    } catch (err: any) {
      setMessage({
        text: err.response?.data?.message || 'Failed to simulate counterparty',
        type: 'error',
      });
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="fintech-card p-5 space-y-4">
      {/* Side Toggle Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#080C14] p-1 rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setSide('BUY')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            side === 'BUY'
              ? 'bg-emerald-500 text-black shadow-glow-emerald'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          BUY {stock.symbol}
        </button>

        <button
          type="button"
          onClick={() => setSide('SELL')}
          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            side === 'SELL'
              ? 'bg-rose-500 text-white shadow-glow-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          SELL {stock.symbol}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        {/* Order Type Toggle */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Order Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['LIMIT', 'MARKET'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  orderType === type
                    ? 'bg-[#1E293B] text-white border-emerald-500/50'
                    : 'bg-[#080C14] text-gray-400 border-[#1E293B] hover:text-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <label className="font-semibold text-gray-400 uppercase text-[11px] tracking-wider">
              Quantity (Shares)
            </label>
            <span className="mono-num text-gray-300">{quantity} units</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-[#080C14] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none"
            />
            {/* Quick buttons */}
            <div className="flex gap-1">
              {[5, 10, 25, 50].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`px-2 py-2 bg-[#080C14] border text-xs font-mono rounded-lg transition-colors ${
                    quantity === q ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-[#1E293B] text-gray-400 hover:text-white'
                  }`}
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <label className="font-semibold text-gray-400 uppercase text-[11px] tracking-wider">
              Price (₹)
            </label>
            {orderType === 'MARKET' && (
              <span className="text-[11px] text-emerald-400">At best market price</span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500 font-bold text-xs">₹</span>
            <input
              type="number"
              step="0.05"
              min="0.05"
              disabled={orderType === 'MARKET'}
              value={orderType === 'MARKET' ? stock.currentPrice : price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="w-full pl-7 pr-4 py-2 bg-[#080C14] border border-[#1E293B] focus:border-emerald-500 disabled:opacity-50 disabled:bg-[#0E131F] rounded-xl text-white font-mono text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Margin Summary Calculation */}
        <div className="bg-[#080C14] p-3 rounded-xl border border-[#1E293B] space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Order Value:</span>
            <span className="mono-num text-white font-semibold">₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Est. Brokerage (0.05%):</span>
            <span className="mono-num text-gray-300">₹{brokerageFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-[#1E293B]/60 font-semibold">
            <span className="text-gray-300">Total Margin Required:</span>
            <span className="mono-num text-emerald-400">₹{totalRequired.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {side === 'BUY' && (
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-gray-500">Available Wallet Cash:</span>
              <span className={`mono-num ${hasSufficientCash ? 'text-gray-400' : 'text-rose-400 font-bold'}`}>
                ₹{availableCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !hasSufficientCash}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
            side === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-glow-emerald disabled:opacity-40'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-glow-red disabled:opacity-40'
          }`}
        >
          {loading ? (
            'Processing Order...'
          ) : !hasSufficientCash ? (
            'Insufficient Wallet Balance'
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>
                Place {side} {orderType} Order (₹{totalRequired.toLocaleString('en-IN')})
              </span>
            </>
          )}
        </button>
      </form>

      {/* Lab Presentation Fast-Match Bot Tool */}
      <div className="pt-2 border-t border-[#1E293B]">
        <button
          type="button"
          onClick={handleSimulateCounterparty}
          disabled={simLoading}
          className="w-full py-2 px-3 bg-[#131D31] hover:bg-[#1C2842] border border-[#2A3B5A] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{simLoading ? 'Simulating Trade Execution...' : '🤖 Simulate Counterparty Trade Match'}</span>
        </button>
        <p className="text-[10px] text-gray-500 text-center mt-1">
          Demo Tool: Generates matching counter-order to demonstrate instant price-time settlement.
        </p>
      </div>
    </div>
  );
};
