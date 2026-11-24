import React, { useEffect, useState } from 'react';
import { marketApi } from '../services/market.service';
import { Stock } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockChartProps {
  stock: Stock;
}

export const StockChart: React.FC<StockChartProps> = ({ stock }) => {
  const [history, setHistory] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1D');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await marketApi.getStockHistory(stock.symbol, timeframe);
        if (res.success && isMounted) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error('Failed to load chart history', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [stock.symbol, timeframe]);

  const isPositive = stock.changePercent >= 0;
  const strokeColor = isPositive ? '#00D09C' : '#EF4444';

  // Build SVG path
  const points = history?.dataPoints || [];
  let pathD = '';
  let areaD = '';

  if (points.length > 1) {
    const prices = points.map((p: any) => p.price);
    const minP = Math.min(...prices) * 0.998;
    const maxP = Math.max(...prices) * 1.002;
    const range = maxP - minP || 1;

    const width = 600;
    const height = 220;

    const coords = points.map((p: any, idx: number) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p.price - minP) / range) * (height - 30) - 15;
      return { x, y };
    });

    pathD = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map((c: any) => `L ${c.x} ${c.y}`).join(' ');
    areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  }

  return (
    <div className="fintech-card p-5 space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">{stock.symbol}</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1E293B] text-gray-300 font-medium">
              {stock.sector}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{stock.name}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="mono-num text-2xl font-bold text-white">
              ₹{stock.currentPrice.toFixed(2)}
            </div>
            <div
              className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isPositive ? '+' : ''}
                {(stock.currentPrice - stock.previousClose).toFixed(2)} ({isPositive ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-[#080C14] border border-[#1E293B] rounded-lg p-1">
            {(['1D', '1W', '1M'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  timeframe === tf
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-60 w-full flex items-center justify-center">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Streaming price ticks...</span>
          </div>
        ) : points.length > 1 ? (
          <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#chartGradient)" />
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <p className="text-xs text-gray-500">Insufficient price history data</p>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1E293B] text-xs">
        <div className="bg-[#080C14] p-2.5 rounded-xl border border-[#1E293B]">
          <span className="text-gray-400 block text-[11px]">24h High</span>
          <span className="mono-num font-semibold text-white">₹{stock.highPrice.toFixed(2)}</span>
        </div>
        <div className="bg-[#080C14] p-2.5 rounded-xl border border-[#1E293B]">
          <span className="text-gray-400 block text-[11px]">24h Low</span>
          <span className="mono-num font-semibold text-white">₹{stock.lowPrice.toFixed(2)}</span>
        </div>
        <div className="bg-[#080C14] p-2.5 rounded-xl border border-[#1E293B]">
          <span className="text-gray-400 block text-[11px]">Prev Close</span>
          <span className="mono-num font-semibold text-white">₹{stock.previousClose.toFixed(2)}</span>
        </div>
        <div className="bg-[#080C14] p-2.5 rounded-xl border border-[#1E293B]">
          <span className="text-gray-400 block text-[11px]">Volume</span>
          <span className="mono-num font-semibold text-white">{stock.volume.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};
