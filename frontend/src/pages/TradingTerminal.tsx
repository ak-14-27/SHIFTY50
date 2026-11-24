import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketApi } from '../services/market.service';
import { orderApi } from '../services/order.service';
import { Stock, Order } from '../types';
import { StockChart } from '../components/StockChart';
import { OrderBookWidget } from '../components/OrderBookWidget';
import { OrderEntryForm } from '../components/OrderEntryForm';
import { Search, Clock, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

export const TradingTerminal: React.FC<{ onNavigateToKyc: () => void }> = ({ onNavigateToKyc }) => {
  const { user, wallet, refreshWallet } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedPriceForOrder, setSelectedPriceForOrder] = useState<number | null>(null);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchStocks = async () => {
    try {
      const res = await marketApi.getStocks(search, selectedSector);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStocks(res.data);
        if (!selectedStock) {
          setSelectedStock(res.data[0]);
        } else {
          // Update selected stock price live
          const updated = res.data.find((s) => s.symbol === selectedStock.symbol);
          if (updated) setSelectedStock(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load stocks', err);
    }
  };

  const fetchMyOrders = async () => {
    if (!user || user.kycStatus !== 'ACTIVE') return;
    setLoadingOrders(true);
    try {
      const res = await orderApi.getMyOrders();
      if (res.success) {
        setMyOrders(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 4000);
    return () => clearInterval(interval);
  }, [search, selectedSector]);

  useEffect(() => {
    fetchMyOrders();
  }, [selectedStock]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderApi.cancelOrder(orderId);
      await fetchMyOrders();
      await refreshWallet();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (user?.kycStatus !== 'ACTIVE') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 fintech-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Trading Terminal Restricted</h2>
        <p className="text-xs text-gray-300">
          Identity verification (KYC) is required to place market orders, access the matching engine, and trade live order books.
        </p>
        <button
          onClick={onNavigateToKyc}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-glow-emerald"
        >
          <span>Complete KYC & Unlock Trading</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const sectors = ['ALL', 'Information Technology', 'Banking & Financials', 'Energy & Petrochemicals', 'Automobile'];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Sector filter tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {sectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
              selectedSector === sec
                ? 'bg-emerald-500 text-black font-bold shadow-glow-emerald'
                : 'bg-[#0F172A] text-gray-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            {sec === 'ALL' ? 'All Equities' : sec}
          </button>
        ))}
      </div>

      {/* Main Terminal Grid: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Stock Watchlist & Search (3 Cols) */}
        <div className="lg:col-span-3 fintech-card p-4 space-y-3 h-[780px] flex flex-col">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#080C14] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {stocks.map((stk) => {
              const isSelected = selectedStock?.symbol === stk.symbol;
              const isPos = stk.changePercent >= 0;
              return (
                <div
                  key={stk.symbol}
                  onClick={() => {
                    setSelectedStock(stk);
                    setSelectedPriceForOrder(stk.currentPrice);
                  }}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-[#080C14]/60 border-[#1E293B] hover:border-[#334155] hover:bg-[#131D31]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-white">{stk.symbol}</span>
                      <p className="text-[10px] text-gray-400 truncate max-w-[130px]">{stk.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="mono-num text-xs font-bold text-white">
                        ₹{stk.currentPrice.toFixed(2)}
                      </div>
                      <span
                        className={`text-[10px] font-bold flex items-center justify-end ${
                          isPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stk.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Chart & Active Orders (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedStock && <StockChart stock={selectedStock} />}

          {/* User's Open Orders */}
          <div className="fintech-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Active Resting Orders ({myOrders.filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED').length})</h3>
              </div>
              <button
                onClick={fetchMyOrders}
                className="text-gray-400 hover:text-white p-1"
                title="Refresh Orders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-gray-400 uppercase border-b border-[#1E293B]/50 font-sans">
                  <tr>
                    <th className="py-1.5 px-2">Symbol</th>
                    <th className="py-1.5 px-2">Side</th>
                    <th className="py-1.5 px-2 text-right">Price</th>
                    <th className="py-1.5 px-2 text-right">Qty</th>
                    <th className="py-1.5 px-2 text-center">Status</th>
                    <th className="py-1.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/40">
                  {myOrders.filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500 font-sans text-xs">
                        No resting open orders in the book.
                      </td>
                    </tr>
                  ) : (
                    myOrders
                      .filter(o => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED')
                      .map((ord) => {
                        const isBuy = ord.side === 'BUY';
                        return (
                          <tr key={ord.id} className="hover:bg-[#131D31]/40">
                            <td className="py-2 px-2 font-bold text-white font-sans">{ord.symbol}</td>
                            <td className="py-2 px-2">
                              <span className={`text-[10px] font-bold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {ord.side} ({ord.orderType})
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right text-gray-200">₹{ord.price.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right text-gray-200">
                              {ord.filledQuantity}/{ord.quantity}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans font-bold">
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => handleCancelOrder(ord.id)}
                                className="text-rose-400 hover:text-rose-300 p-1 text-[11px] font-sans font-semibold hover:bg-rose-500/10 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Order Book & Order Entry Form (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedStock && (
            <>
              <OrderBookWidget
                symbol={selectedStock.symbol}
                onSelectPrice={(p) => setSelectedPriceForOrder(p)}
              />
              <OrderEntryForm
                stock={selectedStock}
                wallet={wallet}
                selectedPrice={selectedPriceForOrder}
                onOrderSuccess={() => {
                  fetchMyOrders();
                  refreshWallet();
                  fetchStocks();
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
