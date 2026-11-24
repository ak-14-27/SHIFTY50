import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/order.service';
import { OrderBookDepth } from '../types';
import { Layers, RefreshCw } from 'lucide-react';

interface OrderBookWidgetProps {
  symbol: string;
  onSelectPrice: (price: number) => void;
}

export const OrderBookWidget: React.FC<OrderBookWidgetProps> = ({ symbol, onSelectPrice }) => {
  const [depth, setDepth] = useState<OrderBookDepth | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDepth = async () => {
    try {
      const res = await orderApi.getOrderBookDepth(symbol);
      if (res.success && res.data) {
        setDepth(res.data);
      }
    } catch (err) {
      console.error('Failed to load depth', err);
    }
  };

  useEffect(() => {
    fetchDepth();
    const interval = setInterval(fetchDepth, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  const maxQty = Math.max(
    ...(depth?.bids.map((b) => b.quantity) || [1]),
    ...(depth?.asks.map((a) => a.quantity) || [1]),
    1
  );

  const totalDepth = (depth?.totalBidQty || 0) + (depth?.totalAskQty || 0);
  const bidRatio = totalDepth > 0 ? ((depth?.totalBidQty || 0) / totalDepth) * 100 : 50;
  const askRatio = totalDepth > 0 ? ((depth?.totalAskQty || 0) / totalDepth) * 100 : 50;

  return (
    <div className="fintech-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Live Order Book Depth</h3>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchDepth().finally(() => setLoading(false));
          }}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          title="Refresh Depth"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Depth Ratio Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-emerald-400 font-semibold">{bidRatio.toFixed(0)}% Bids ({depth?.totalBidQty || 0})</span>
          <span className="text-rose-400 font-semibold">{askRatio.toFixed(0)}% Asks ({depth?.totalAskQty || 0})</span>
        </div>
        <div className="h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden flex">
          <div style={{ width: `${bidRatio}%` }} className="bg-emerald-500 h-full transition-all duration-300" />
          <div style={{ width: `${askRatio}%` }} className="bg-rose-500 h-full transition-all duration-300" />
        </div>
      </div>

      {/* Order Book Table (Bids & Asks) */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        {/* BIDS Column */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400 font-sans uppercase font-bold px-1.5 pb-1 border-b border-[#1E293B]/50">
            <span>Bid Price</span>
            <span>Qty</span>
          </div>
          {depth?.bids && depth.bids.length > 0 ? (
            depth.bids.map((bid, i) => {
              const widthPct = (bid.quantity / maxQty) * 100;
              return (
                <div
                  key={`bid-${i}`}
                  onClick={() => onSelectPrice(bid.price)}
                  className="relative flex justify-between px-1.5 py-1 rounded cursor-pointer hover:bg-emerald-500/10 transition-colors overflow-hidden group"
                >
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="absolute inset-y-0 right-0 depth-bar-bid rounded"
                  />
                  <span className="relative font-bold text-emerald-400">₹{bid.price.toFixed(2)}</span>
                  <span className="relative text-gray-300">{bid.quantity}</span>
                </div>
              );
            })
          ) : (
            <p className="text-[11px] text-gray-500 py-3 text-center">No open bids</p>
          )}
        </div>

        {/* ASKS Column */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400 font-sans uppercase font-bold px-1.5 pb-1 border-b border-[#1E293B]/50">
            <span>Ask Price</span>
            <span>Qty</span>
          </div>
          {depth?.asks && depth.asks.length > 0 ? (
            depth.asks.map((ask, i) => {
              const widthPct = (ask.quantity / maxQty) * 100;
              return (
                <div
                  key={`ask-${i}`}
                  onClick={() => onSelectPrice(ask.price)}
                  className="relative flex justify-between px-1.5 py-1 rounded cursor-pointer hover:bg-rose-500/10 transition-colors overflow-hidden group"
                >
                  <div
                    style={{ width: `${widthPct}%` }}
                    className="absolute inset-y-0 left-0 depth-bar-ask rounded"
                  />
                  <span className="relative font-bold text-rose-400">₹{ask.price.toFixed(2)}</span>
                  <span className="relative text-gray-300">{ask.quantity}</span>
                </div>
              );
            })
          ) : (
            <p className="text-[11px] text-gray-500 py-3 text-center">No open asks</p>
          )}
        </div>
      </div>

      {/* Spread footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-gray-400">
        <span>Spread: <strong className="text-white font-mono">₹{depth?.spread.toFixed(2) || '0.00'}</strong></span>
        <span className="text-[10px] text-gray-500">Click any price level to auto-fill</span>
      </div>
    </div>
  );
};
