import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Play,
  Pause,
  XCircle,
  Zap,
  CheckCircle2,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { MutualFundsService } from '../services/mutual-funds.service';
import { SipService } from '../services/sip.service';
import { useAuth } from '../context/AuthContext';
import { MutualFund, MutualFundHolding, Sip, SipFrequency } from '../types';

export const MutualFundsHub: React.FC<{ onNavigateToKyc?: () => void }> = ({ onNavigateToKyc }) => {
  const { user, refreshWallet } = useAuth();
  const [funds, setFunds] = useState<MutualFund[]>([]);
  const [myHoldings, setMyHoldings] = useState<MutualFundHolding[]>([]);
  const [mySips, setMySips] = useState<Sip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [investModalFund, setInvestModalFund] = useState<MutualFund | null>(null);
  const [sipModalFund, setSipModalFund] = useState<MutualFund | null>(null);
  const [redeemModalHolding, setRedeemModalHolding] = useState<MutualFundHolding | null>(null);
  const [investAmount, setInvestAmount] = useState<number>(5000);
  const [sipAmount, setSipAmount] = useState<number>(2000);
  const [redeemUnits, setRedeemUnits] = useState<number>(0);
  const [sipFrequency, setSipFrequency] = useState<SipFrequency>('MONTHLY');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isKycActive = user?.kycStatus === 'ACTIVE';

  const loadData = async () => {
    try {
      setLoading(true);
      const [allFunds, holdingsData, sipsData] = await Promise.all([
        MutualFundsService.getAllFunds(),
        isKycActive ? MutualFundsService.getMyHoldings() : Promise.resolve([]),
        isKycActive ? SipService.getMySips() : Promise.resolve([]),
      ]);
      setFunds(Array.isArray(allFunds) ? allFunds : []);
      setMyHoldings(Array.isArray(holdingsData) ? holdingsData : (holdingsData as any)?.holdings || []);
      setMySips(Array.isArray(sipsData) ? sipsData : []);
    } catch (err) {
      console.error('Failed to load mutual funds data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isKycActive]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLumpSumInvest = async () => {
    if (!investModalFund) return;
    try {
      setActionLoading(true);
      await MutualFundsService.investLumpSum(investModalFund.id, investAmount);
      await refreshWallet();
      await loadData();
      showToast(`Successfully invested ₹${investAmount.toLocaleString('en-IN')} in ${investModalFund.name}!`);
      setInvestModalFund(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Investment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartSip = async () => {
    if (!sipModalFund) return;
    try {
      setActionLoading(true);
      await SipService.createSip(sipModalFund.id, sipAmount, sipFrequency);
      await refreshWallet();
      await loadData();
      showToast(`SIP Mandate of ₹${sipAmount.toLocaleString('en-IN')}/${sipFrequency.toLowerCase()} activated!`);
      setSipModalFund(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'SIP setup failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemModalHolding || redeemUnits <= 0) return;
    try {
      setActionLoading(true);
      await MutualFundsService.redeem(redeemModalHolding.fundId, redeemUnits);
      await refreshWallet();
      await loadData();
      showToast(`Redemption complete! Sold ${redeemUnits.toFixed(3)} units of ${redeemModalHolding.fund.name}. Funds credited.`);
      setRedeemModalHolding(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Redemption failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSipStatus = async (sip: Sip, newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    try {
      setActionLoading(true);
      await SipService.updateSipStatus(sip.id, newStatus);
      await loadData();
      showToast(`SIP marked as ${newStatus}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerSipNow = async (sip: Sip) => {
    try {
      setActionLoading(true);
      const res = await SipService.triggerSingleSipNow(sip.id);
      await refreshWallet();
      await loadData();
      showToast(res.message || `SIP installment executed: debited ₹${sip.amount.toLocaleString('en-IN')}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to trigger SIP installment');
    } finally {
      setActionLoading(false);
    }
  };

  const safeFunds = Array.isArray(funds) ? funds : [];
  const safeHoldings = Array.isArray(myHoldings) ? myHoldings : [];
  const safeSips = Array.isArray(mySips) ? mySips : [];

  const filteredFunds =
    selectedCategory === 'ALL'
      ? safeFunds
      : safeFunds.filter((f) => f.category.toUpperCase() === selectedCategory);

  // Compute total MF valuation
  const totalMfInvested = safeHoldings.reduce((sum, h) => sum + (h.totalInvested || 0), 0);
  const totalMfCurrent = safeHoldings.reduce(
    (sum, h) => {
      const nav = h.fund?.nav || (h as any).currentNav || (h as any).averageNav || 0;
      return sum + (h.currentValuation || (h.units ? h.units * nav : 0));
    },
    0
  );
  const totalMfPnl = totalMfCurrent - totalMfInvested;
  const totalMfReturnPct = totalMfInvested > 0 ? (totalMfPnl / totalMfInvested) * 100 : 0;

  if (loading) {
    return (
      <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading Institutional Mutual Funds Catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1527] to-[#0A0E1A] p-6 rounded-2xl border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Institutional Asset Engine
            </span>
            <span className="text-gray-400 text-xs">• Direct Growth Plans</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Mutual Funds & Systematic Investment Plans (SIP)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Invest lump-sum capital or schedule recurring automated SIP mandates with double-entry ledger settlement.
          </p>
        </div>

        {/* Portfolio Summary Pill */}
        {isKycActive && safeHoldings.length > 0 && (
          <div className="flex items-center gap-4 bg-[#080C14] px-4 py-3 rounded-xl border border-[#1E293B]">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-500">MF Portfolio Value</p>
              <p className="text-sm font-bold text-white mono-num">
                ₹{totalMfCurrent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="border-l border-[#1E293B] pl-4">
              <p className="text-[10px] uppercase font-bold text-gray-500">Total Returns</p>
              <p
                className={`text-sm font-bold mono-num flex items-center gap-1 ${
                  totalMfPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalMfPnl >= 0 ? '+' : ''}
                ₹{totalMfPnl.toFixed(2)} ({totalMfReturnPct.toFixed(2)}%)
              </p>
            </div>
          </div>
        )}
      </div>

      {!isKycActive && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-xs font-bold text-white">KYC Verification Required</p>
              <p className="text-[11px] text-gray-400">
                Lump-sum investing and SIP mandates require an active verified KYC status.
              </p>
            </div>
          </div>
          {onNavigateToKyc && (
            <button
              onClick={onNavigateToKyc}
              className="text-xs px-3 py-1.5 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-400 transition-all"
            >
              Verify KYC
            </button>
          )}
        </div>
      )}

      {/* Active SIP Mandates Section */}
      {isKycActive && safeSips.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">My Active SIP Mandates ({safeSips.length})</h2>
            </div>
            <span className="text-[11px] text-gray-400">Auto-debit powered by Double-Entry Ledger</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeSips.map((sip) => (
              <div
                key={sip.id}
                className="p-4 rounded-xl bg-[#0A0E1A] border border-[#1E293B] space-y-3 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131D31] text-emerald-400 font-semibold">
                      {sip.frequency}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1 line-clamp-1">{sip.fund?.name}</h3>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                      sip.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : sip.status === 'PAUSED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {sip.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-[#1E293B]/60">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Installment</span>
                    <span className="font-bold text-white mono-num">
                      ₹{sip.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Executions</span>
                    <span className="font-bold text-gray-300 mono-num">
                      {sip.successfulInstallments} executed
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-[10px]">Next Debit Due</span>
                    <span className="text-gray-300 font-mono text-[11px]">
                      {new Date(sip.nextExecutionDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {sip.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleToggleSipStatus(sip, 'PAUSED')}
                      disabled={actionLoading}
                      className="flex-1 py-1 text-[11px] font-bold text-amber-400 hover:bg-amber-500/10 rounded-lg border border-amber-500/30 transition-all flex items-center justify-center gap-1"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleSipStatus(sip, 'ACTIVE')}
                      disabled={actionLoading}
                      className="flex-1 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/10 rounded-lg border border-emerald-500/30 transition-all flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Resume
                    </button>
                  )}

                  <button
                    onClick={() => handleTriggerSipNow(sip)}
                    disabled={actionLoading || sip.status !== 'ACTIVE'}
                    title="Simulate instant automated cron execution for demo grading"
                    className="flex-1 py-1 text-[11px] font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                  >
                    <Zap className="w-3 h-3 fill-current" /> Trigger Now
                  </button>

                  <button
                    onClick={() => handleToggleSipStatus(sip, 'CANCELLED')}
                    disabled={actionLoading || sip.status === 'CANCELLED'}
                    className="p-1 text-gray-500 hover:text-rose-400 rounded-lg transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Mutual Fund Holdings */}
      {isKycActive && safeHoldings.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              My Mutual Fund Holdings
            </h2>
            <span className="text-xs text-gray-400">{safeHoldings.length} Funds Invested</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E1A] text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-3">Fund Name</th>
                  <th className="py-2.5 px-3 text-right">Units Held</th>
                  <th className="py-2.5 px-3 text-right">Avg NAV</th>
                  <th className="py-2.5 px-3 text-right">Current NAV</th>
                  <th className="py-2.5 px-3 text-right">Invested Value</th>
                  <th className="py-2.5 px-3 text-right">Current Value</th>
                  <th className="py-2.5 px-3 text-right">P&L</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 font-mono text-[11px]">
                {safeHoldings.map((h) => {
                  const fundName = h.fund?.name || (h as any).name || 'Mutual Fund';
                  const fundCategory = h.fund?.category || (h as any).category || 'INDEX';
                  const fundNav = h.fund?.nav || (h as any).currentNav || (h as any).averageNav || 0;
                  const curVal = h.currentValuation ?? (h.units * fundNav);
                  const pnl = (h as any).pnl ?? (curVal - h.totalInvested);
                  const pnlPct = (h as any).pnlPercent ?? (h.totalInvested > 0 ? (pnl / h.totalInvested) * 100 : 0);
                  return (
                    <tr key={h.id} className="hover:bg-[#131D31]/50 transition-colors">
                      <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                        <span>{fundName}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1E293B] text-gray-300">
                          {fundCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-300">{h.units.toFixed(3)}</td>
                      <td className="py-3 px-3 text-right text-gray-400">₹{h.averageNav.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">₹{fundNav.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-gray-300">
                        ₹{h.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        ₹{curVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => {
                            setRedeemModalHolding({
                              ...h,
                              fund: h.fund || {
                                id: h.fundId,
                                name: fundName,
                                code: (h as any).code || '',
                                category: fundCategory as any,
                                nav: fundNav,
                                cagr3y: (h as any).cagr3y || 0,
                                cagr5y: 0,
                                expenseRatio: 0,
                                risk: (h as any).risk || '',
                                description: '',
                              },
                            });
                            setRedeemUnits(h.units);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg border border-rose-500/30 transition-all"
                        >
                          Redeem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
        {['ALL', 'EQUITY', 'DEBT', 'HYBRID', 'INDEX'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-black shadow-glow-emerald'
                : 'text-gray-400 hover:text-white hover:bg-[#131D31]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Funds Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFunds.map((fund) => (
          <div
            key={fund.id}
            className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-sm space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {fund.category}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  TER: {fund.expenseRatio}%
                </span>
              </div>
              <h3 className="font-bold text-sm text-white leading-tight">{fund.name}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-2">{fund.description}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-[#0A0E1A] p-3 rounded-xl border border-[#1E293B]/60 text-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500 block">NAV</span>
                <span className="text-xs font-bold text-white mono-num">₹{fund.nav.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500 block">3Y CAGR</span>
                <span className="text-xs font-bold text-emerald-400 mono-num">+{fund.cagr3y}%</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-500 block">5Y CAGR</span>
                <span className="text-xs font-bold text-emerald-400 mono-num">+{fund.cagr5y}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setInvestModalFund(fund)}
                disabled={!isKycActive}
                className="flex-1 py-2 text-xs font-bold bg-[#131D31] hover:bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all disabled:opacity-40"
              >
                Lump-Sum
              </button>
              <button
                onClick={() => setSipModalFund(fund)}
                disabled={!isKycActive}
                className="flex-1 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all shadow-glow-emerald disabled:opacity-40 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" /> Start SIP
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lump-Sum Invest Modal */}
      {investModalFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 space-y-5">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Lump-Sum Allotment
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{investModalFund.name}</h3>
              <p className="text-xs text-gray-400">Current NAV: ₹{investModalFund.nav.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Investment Amount (₹)</label>
              <input
                type="number"
                min="1000"
                step="500"
                value={investAmount}
                onChange={(e) => setInvestAmount(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 outline-none"
              />
              <div className="flex gap-2 pt-1">
                {[1000, 5000, 10000, 25000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setInvestAmount(amt)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#131D31] text-gray-300 hover:text-white font-mono"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Units */}
            <div className="p-3 rounded-xl bg-[#080C14] border border-[#1E293B] flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400 font-sans">Estimated Units Allotted:</span>
              <span className="font-bold text-emerald-400">
                {(investAmount / investModalFund.nav).toFixed(4)} Units
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setInvestModalFund(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-400 hover:text-white bg-[#131D31] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLumpSumInvest}
                disabled={actionLoading || investAmount < 1000}
                className="flex-1 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-glow-emerald disabled:opacity-40"
              >
                {actionLoading ? 'Processing...' : `Confirm ₹${investAmount.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start SIP Modal */}
      {sipModalFund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 space-y-5">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Recurring SIP Mandate
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{sipModalFund.name}</h3>
              <p className="text-xs text-gray-400">Automated recurring debit with double-entry ledger</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as SipFrequency[]).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSipFrequency(freq)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      sipFrequency === freq
                        ? 'bg-emerald-500 text-black shadow-glow-emerald'
                        : 'bg-[#080C14] text-gray-400 border border-[#1E293B]'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Installment Amount (₹)</label>
              <input
                type="number"
                min="500"
                step="500"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 outline-none"
              />
              <div className="flex gap-2 pt-1">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSipAmount(amt)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#131D31] text-gray-300 hover:text-white font-mono"
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080C14] border border-[#1E293B] text-[11px] text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>First Installment:</span>
                <span className="font-bold text-white">Executed Immediately</span>
              </div>
              <div className="flex justify-between">
                <span>Subsequent Debits:</span>
                <span className="font-bold text-emerald-400">Every {sipFrequency.toLowerCase()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSipModalFund(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-400 hover:text-white bg-[#131D31] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSip}
                disabled={actionLoading || sipAmount < 500}
                className="flex-1 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-glow-emerald disabled:opacity-40"
              >
                {actionLoading ? 'Activating...' : `Activate Mandate`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redemption Modal */}
      {redeemModalHolding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 space-y-5">
            <div>
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">
                Redeem Mutual Fund Units
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {redeemModalHolding.fund?.name || (redeemModalHolding as any).name || 'Mutual Fund'}
              </h3>
              <p className="text-xs text-gray-400">
                Holding: {redeemModalHolding.units.toFixed(3)} Units • Current NAV: ₹
                {(redeemModalHolding.fund?.nav || (redeemModalHolding as any).currentNav || redeemModalHolding.averageNav || 0).toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Units to Redeem</label>
              <input
                type="number"
                min="0.001"
                max={redeemModalHolding.units}
                step="0.001"
                value={redeemUnits}
                onChange={(e) => setRedeemUnits(Number(e.target.value))}
                className="w-full bg-[#080C14] border border-[#1E293B] rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-rose-500 outline-none"
              />
              <div className="flex gap-2 pt-1">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRedeemUnits(Number((redeemModalHolding.units * pct).toFixed(3)))}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-[#131D31] text-gray-300 hover:text-white font-mono"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Preview */}
            <div className="p-3.5 rounded-xl bg-[#080C14] border border-[#1E293B] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400 font-sans">Estimated Payout:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{(redeemUnits * (redeemModalHolding.fund?.nav || (redeemModalHolding as any).currentNav || redeemModalHolding.averageNav || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500 font-sans">Destination:</span>
                <span className="text-gray-300">Available Wallet Balance (Instant)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRedeemModalHolding(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-400 hover:text-white bg-[#131D31] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={actionLoading || redeemUnits <= 0 || redeemUnits > redeemModalHolding.units}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white rounded-xl shadow-lg disabled:opacity-40"
              >
                {actionLoading ? 'Processing...' : `Confirm Redeem`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
