import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioApi, PortfolioData } from '../services/portfolio.service';
import { Trade } from '../types';
import { HoldingsTable } from '../components/HoldingsTable';
import { TradeBookTable } from '../components/TradeBookTable';
import { TrendingUp, TrendingDown, Briefcase, RefreshCw, ShieldAlert, ArrowRight, PieChart, DollarSign } from 'lucide-react';

export const HoldingsPortfolio: React.FC<{ onNavigateToKyc: () => void }> = ({ onNavigateToKyc }) => {
  const { user, refreshWallet } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'holdings' | 'trades'>('holdings');
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    if (!user || user.kycStatus !== 'ACTIVE') return;
    setLoading(true);
    try {
      const [portRes, tradeRes] = await Promise.all([
        portfolioApi.getMyPortfolio(),
        portfolioApi.getMyTrades(),
      ]);

      if (portRes.success) setPortfolioData(portRes.data);
      if (tradeRes.success) setTrades(tradeRes.data);
    } catch (err) {
      console.error('Failed to load portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 5000);
    return () => clearInterval(interval);
  }, [user?.kycStatus]);

  if (user?.kycStatus !== 'ACTIVE') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 fintech-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Portfolio Access Restricted</h2>
        <p className="text-xs text-gray-300">
          Complete KYC to hold virtual shares, calculate realized/unrealized P&L, and track asset returns.
        </p>
        <button
          onClick={onNavigateToKyc}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-glow-emerald"
        >
          <span>Complete KYC Verification</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const s = portfolioData?.summary;
  const isPos = (s?.totalUnrealizedPnL || 0) >= 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            Portfolio Analytics & Holdings
          </h1>
          <p className="text-xs text-gray-400">
            Real-time equity valuation, weighted average acquisition cost, and realized P&L.
          </p>
        </div>

        <button
          onClick={fetchPortfolio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#0F172A] hover:bg-[#1E293B] border border-[#1E293B] text-gray-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Portfolio</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Valuation */}
        <div className="fintech-card p-5 space-y-2 border-emerald-500/30">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Current Stock Valuation</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              LIVE CMP
            </span>
          </div>
          <div className="mono-num text-2xl lg:text-3xl font-bold text-white">
            ₹{s?.currentPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <p className="text-[11px] text-gray-400">Market value of held shares</p>
        </div>

        {/* Total Invested Capital */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Total Invested Capital</span>
            <PieChart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mono-num text-2xl lg:text-3xl font-bold text-white">
            ₹{s?.totalInvestedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <p className="text-[11px] text-gray-400">Weighted acquisition cost</p>
        </div>

        {/* Unrealized Floating P&L */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Unrealized P&L (Floating)</span>
            {isPos ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
          </div>
          <div className={`mono-num text-2xl lg:text-3xl font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPos ? '+' : ''}₹{s?.totalUnrealizedPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <p className={`text-[11px] font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPos ? '+' : ''}{s?.overallReturnPercent.toFixed(2) || '0.00'}% Overall Return
          </p>
        </div>

        {/* Realized Cumulative Profit */}
        <div className="fintech-card p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Realized P&L (Exits)</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mono-num text-2xl lg:text-3xl font-bold text-purple-300">
            ₹{s?.totalRealizedPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <p className="text-[11px] text-gray-400">Locked net profit on sold positions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1E293B] pb-1">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'holdings'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Active Stock Positions ({portfolioData?.holdings.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'trades'
              ? 'border-emerald-500 text-emerald-400 bg-[#0F172A]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Executed Trades Book ({trades.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'holdings' ? (
        <HoldingsTable
          holdings={portfolioData?.holdings || []}
          onHoldingUpdated={() => {
            fetchPortfolio();
            refreshWallet();
          }}
        />
      ) : (
        <TradeBookTable trades={trades} />
      )}
    </div>
  );
};
