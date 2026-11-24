import React from 'react';
import {
  LayoutDashboard,
  CandlestickChart,
  Briefcase,
  TrendingUp,
  FileText,
  Trophy,
  Wallet,
  ShieldCheck,
  History,
  Sliders,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  kycStatus?: string;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  kycStatus,
  userRole,
}) => {
  const isKycActive = kycStatus === 'ACTIVE';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Market Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'terminal',
      label: 'Trading Terminal',
      icon: CandlestickChart,
      badge: isKycActive ? 'Live' : 'Locked',
    },
    {
      id: 'portfolio',
      label: 'Holdings & P&L',
      icon: Briefcase,
      badge: isKycActive ? null : 'Locked',
    },
    {
      id: 'funds',
      label: 'Mutual Funds & SIP',
      icon: TrendingUp,
      badge: 'Auto-SIP',
    },
    {
      id: 'reports',
      label: 'Reports & Tax P&L',
      icon: FileText,
      badge: 'Contract',
    },
    {
      id: 'leaderboard',
      label: 'Trader Leaderboard',
      icon: Trophy,
      badge: 'Rankings',
    },
    {
      id: 'wallet',
      label: 'Wallet & Ledger Hub',
      icon: Wallet,
      badge: isKycActive ? null : 'Locked',
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      icon: ShieldCheck,
      badge: isKycActive ? 'Active' : 'Action Required',
    },
    {
      id: 'admin',
      label: 'Admin Console',
      icon: Sliders,
      badge: userRole === 'ADMIN' ? 'Super' : 'Oversight',
    },
    {
      id: 'audit',
      label: 'Security & Audit Logs',
      icon: History,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-[#1E293B] bg-[#0A0E1A] min-h-[calc(100vh-6.25rem)] p-4 flex flex-col justify-between select-none">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-[#131D31]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        item.badge === 'Live' || item.badge === 'Active' || item.badge === 'Auto-SIP'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.badge === 'Locked'
                          ? 'bg-gray-800 text-gray-500'
                          : item.badge === 'Action Required'
                          ? 'bg-rose-500/20 text-rose-300 animate-pulse'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Production-grade System Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-white">System Engine</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">ONLINE</span>
        </div>
        <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1 border-t border-[#1E293B]/60">
          <span>Order Matching</span>
          <span className="text-gray-300 font-mono font-medium">Sub-millisecond</span>
        </div>
        <div className="text-[11px] text-gray-400 flex items-center justify-between">
          <span>Settlement</span>
          <span className="text-gray-300 font-mono font-medium">Atomic ACID</span>
        </div>
      </div>
    </aside>
  );
};
