import React, { useState, useEffect } from 'react';
import {
  Users,
  Activity,
  Sliders,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { AdminService } from '../services/admin.service';
import { SystemAnalytics } from '../types';

export const AdminConsole: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Capital Adjustment Form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adjAmount, setAdjAmount] = useState(10000);
  const [adjType, setAdjType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjReason, setAdjReason] = useState('Competition Award Allotment');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsData, usersData, tradesData] = await Promise.all([
        AdminService.getSystemAnalytics(),
        AdminService.getAllUsers(),
        AdminService.getGlobalTradeFeed(20),
      ]);
      setAnalytics(analyticsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTrades(Array.isArray(tradesData) ? tradesData : []);
      if (Array.isArray(usersData) && usersData.length > 0 && !selectedUserId) {
        setSelectedUserId(usersData[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleKycReview = async (targetUserId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      await AdminService.reviewKyc(targetUserId, newStatus);
      await loadAdminData();
      showToast(`User KYC updated to ${newStatus}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'KYC review failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || adjAmount <= 0 || !adjReason) return;

    try {
      setActionLoading(true);
      await AdminService.adjustCapital(selectedUserId, adjAmount, adjType, adjReason);
      await loadAdminData();
      showToast(`Successfully applied ${adjType} of ₹${adjAmount.toLocaleString('en-IN')}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Capital adjustment failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading Exchange Administration Telemetry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#170E28] to-[#0A0E1A] p-6 rounded-2xl border border-purple-900/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Super Admin Oversight
            </span>
            <span className="text-gray-400 text-xs">• ACID Engine Controls</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Exchange Administration & Risk Console
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time platform telemetry, user KYC review approvals, manual double-entry capital adjustments, and global trade feed.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131D31] hover:bg-[#1E293B] text-gray-300 text-xs font-bold rounded-xl border border-[#1E293B] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Refresh Telemetry
        </button>
      </div>

      {/* Telemetry Metrics Grid */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Users</span>
            <span className="text-lg font-bold text-white mono-num">
              {analytics.totalUsers}{' '}
              <span className="text-xs text-emerald-400 font-normal">
                ({analytics.activeKycUsers} KYC Active)
              </span>
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Platform Turnover</span>
            <span className="text-lg font-bold text-emerald-400 mono-num">
              ₹{analytics.totalTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Trades Executed</span>
            <span className="text-lg font-bold text-white mono-num">
              {analytics.totalTrades} ({analytics.totalOrders} Orders)
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Engine ACID Status</span>
            <span className="text-xs font-extrabold text-emerald-400 mono-num block mt-1">
              {analytics.engineState}
            </span>
          </div>
        </div>
      )}

      {/* Main Admin Working Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User KYC Management */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> User Registry & KYC Status
            </h2>
            <span className="text-xs text-gray-500">{users.length} Registered Accounts</span>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E1A] text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-[#1E293B]">
                <tr>
                  <th className="py-2.5 px-3">Trader</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">KYC Status</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 font-mono text-[11px]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#131D31]/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-bold text-white">{u.fullName}</div>
                      <span className="text-[10px] text-gray-500 font-mono">{u.email}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          u.kycStatus === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : u.kycStatus === 'VERIFICATION_PENDING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-300">
                      ₹{u.wallet?.availableBalance ? u.wallet.availableBalance.toLocaleString('en-IN') : '0.00'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      {u.kycStatus !== 'ACTIVE' ? (
                        <button
                          onClick={() => handleKycReview(u.id, 'ACTIVE')}
                          disabled={actionLoading}
                          className="px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-[10px] font-bold border border-emerald-500/30"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleKycReview(u.id, 'VERIFICATION_PENDING')}
                          disabled={actionLoading}
                          className="px-2 py-1 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded text-[10px] font-bold"
                        >
                          Recheck
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Capital Adjustment Form */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Double-Entry Capital Adjustment Tool
            </h2>
          </div>
          <p className="text-[11px] text-gray-400">
            Credit prize capital or debit penalties with permanent audit logging.
          </p>

          <form onSubmit={handleAdjustCapital} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Select Target User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email}) - Avail: ₹{u.wallet?.availableBalance?.toLocaleString('en-IN') || 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-1 bg-[#080C14] p-1 rounded-xl border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => setAdjType('CREDIT')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      adjType === 'CREDIT'
                        ? 'bg-emerald-500 text-black shadow-glow-emerald'
                        : 'text-gray-400'
                    }`}
                  >
                    CREDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('DEBIT')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      adjType === 'DEBIT'
                        ? 'bg-rose-500 text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    DEBIT
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full bg-[#080C14] border border-[#1E293B] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">Audit Justification / Reason</label>
              <input
                type="text"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="e.g. Trading Alpha Competition Reward"
                className="w-full bg-[#080C14] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || adjAmount <= 0}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-glow-emerald transition-all disabled:opacity-40"
            >
              {actionLoading
                ? 'Applying Ledger Invariant...'
                : `Execute ${adjType} of ₹${adjAmount.toLocaleString('en-IN')}`}
            </button>
          </form>
        </div>
      </div>

      {/* Global Trade Feed */}
      <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Global Real-Time Exchange Trades Feed
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0E1A] text-gray-500 text-[10px] uppercase font-bold border-b border-[#1E293B]">
              <tr>
                <th className="py-2 px-3 font-sans">Trade ID</th>
                <th className="py-2 px-3 font-sans">Timestamp</th>
                <th className="py-2 px-3 font-sans">Symbol</th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Price</th>
                <th className="py-2 px-3 text-right">Trade Value</th>
                <th className="py-2 px-3 text-right">Fees (Exchange)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-[11px]">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-[#131D31]/40">
                  <td className="py-2 px-3 text-gray-400 font-mono text-[10px]">
                    {t.id.slice(0, 8)}...
                  </td>
                  <td className="py-2 px-3 text-gray-400">
                    {new Date(t.executedAt).toLocaleTimeString('en-IN')}
                  </td>
                  <td className="py-2 px-3 font-bold text-white font-sans">{t.symbol}</td>
                  <td className="py-2 px-3 text-right text-gray-300">{t.quantity}</td>
                  <td className="py-2 px-3 text-right text-gray-300">₹{t.executionPrice.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-bold text-white">
                    ₹{t.tradeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right text-emerald-400">
                    ₹{(t.buyerFee + t.sellerFee).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
