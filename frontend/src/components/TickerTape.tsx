import React, { useEffect, useState } from 'react';
import { marketApi } from '../services/market.service';
import { Stock } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await marketApi.getStocks();
        if (res.success && isMounted && Array.isArray(res.data)) {
          setStocks(res.data);
        }
      } catch (err) {
        // Silent catch for ticker
      }
    };
    load();
    const interval = setInterval(load, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const indexItems = [
    { symbol: 'NIFTY 50', price: 24860.45, change: +0.42 },
    { symbol: 'SENSEX', price: 81380.20, change: +0.38 },
    { symbol: 'BANK NIFTY', price: 51240.10, change: -0.15 },
  ];

  return (
    <div className="h-9 bg-[#06090F] border-b border-[#1E293B]/80 overflow-hidden flex items-center text-xs font-mono select-none">
      <div className="flex items-center gap-1.5 px-3 bg-[#0D1322] border-r border-[#1E293B] z-10 h-full text-[11px] font-semibold text-emerald-400 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="tracking-wider">LIVE NSE</span>
      </div>

      <div className="flex whitespace-nowrap overflow-x-auto no-scrollbar scroll-smooth gap-6 px-4">
        {/* Indices */}
        {indexItems.map((idx) => {
          const isPos = idx.change >= 0;
          return (
            <div key={idx.symbol} className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">{idx.symbol}</span>
              <span className="text-white">₹{idx.price.toLocaleString('en-IN')}</span>
              <span
                className={`flex items-center text-[11px] font-semibold ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? '+' : ''}
                {idx.change}%
              </span>
            </div>
          );
        })}

        {/* Top Stocks */}
        {(Array.isArray(stocks) ? stocks : []).map((stock) => {
          const isPos = stock.changePercent >= 0;
          return (
            <div key={stock.symbol} className="flex items-center gap-2">
              <span className="font-bold text-gray-200">{stock.symbol}</span>
              <span className="text-white">₹{stock.currentPrice.toFixed(2)}</span>
              <span
                className={`flex items-center text-[11px] font-bold ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {isPos ? '+' : ''}
                {stock.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
