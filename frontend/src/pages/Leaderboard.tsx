import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { AdminService } from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { LeaderboardEntry } from '../types';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await AdminService.getLeaderboard();
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

  const filteredLeaderboard = safeLeaderboard.filter(
    (entry) =>
      (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = safeLeaderboard.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1527] to-[#0A0E1A] p-6 rounded-2xl border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Normalized Performance
            </span>
            <span className="text-gray-400 text-xs">• Baseline ₹1,00,000 Capital</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Exchange Alpha Trader Leaderboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Fair rankings normalized by percentage return across stocks, mutual funds, and trading alpha.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#080C14] border border-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Calculating Real-Time Leaderboard Standings...</span>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((trader, idx) => {
                const podiumColors = [
                  'from-amber-500/20 to-amber-950/20 border-amber-500/40 text-amber-300',
                  'from-slate-400/20 to-slate-900/20 border-slate-400/40 text-slate-300',
                  'from-amber-700/20 to-amber-950/20 border-amber-700/40 text-amber-500',
                ];
                const podiumIcons = ['👑 Rank #1', '🥈 Rank #2', '🥉 Rank #3'];

                return (
                  <div
                    key={trader.userId}
                    className={`p-5 rounded-2xl bg-gradient-to-b ${podiumColors[idx]} border flex flex-col justify-between space-y-4 shadow-xl`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider">
                          {podiumIcons[idx]}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-white">
                          {trader.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white mt-2">{trader.name}</h3>
                      <p className="text-[11px] text-gray-400">{trader.email}</p>
                    </div>

                    <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Net Worth:</span>
                        <span className="font-bold text-white mono-num">
                          ₹{trader.totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Return:</span>
                        <span
                          className={`font-black mono-num ${
                            trader.returnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {trader.returnPercent >= 0 ? '+' : ''}
                          {trader.returnPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Standings Table */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                All Ranked Traders ({filteredLeaderboard.length})
              </h2>
              <span className="text-xs text-gray-500 font-mono">
                Formula: ((Net Worth - 1,00,000) / 1,00,000) × 100
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0E1A] text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-[#1E293B]">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Trader</th>
                    <th className="py-2.5 px-3">Badge</th>
                    <th className="py-2.5 px-3 text-right">Net Worth</th>
                    <th className="py-2.5 px-3 text-right">Net Profit</th>
                    <th className="py-2.5 px-3 text-right">Return %</th>
                    <th className="py-2.5 px-3 text-right">Trades Executed</th>
                    <th className="py-2.5 px-3 text-right">Active Holdings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]/60 font-mono text-[11px]">
                  {filteredLeaderboard.map((t) => {
                    const isMe = user?.id === t.userId;
                    return (
                      <tr
                        key={t.userId}
                        className={`hover:bg-[#131D31]/50 transition-colors ${
                          isMe ? 'bg-emerald-500/10 border-l-2 border-emerald-400 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                              t.rank === 1
                                ? 'bg-amber-500 text-black'
                                : t.rank === 2
                                ? 'bg-slate-300 text-black'
                                : t.rank === 3
                                ? 'bg-amber-700 text-white'
                                : 'text-gray-400 bg-[#131D31]'
                            }`}
                          >
                            {t.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{t.name}</span>
                            {isMe && (
                              <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.2 rounded font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">{t.email}</span>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#131D31] text-gray-300 font-semibold border border-[#1E293B]">
                            {t.badge}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          ₹{t.totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-bold ${
                            t.normalizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {t.normalizedProfit >= 0 ? '+' : ''}
                          ₹{t.normalizedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-black ${
                            t.returnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {t.returnPercent >= 0 ? '+' : ''}
                          {t.returnPercent.toFixed(2)}%
                        </td>
                        <td className="py-3 px-3 text-right text-gray-300">{t.tradesCount}</td>
                        <td className="py-3 px-3 text-right text-gray-300">{t.activeHoldingsCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
