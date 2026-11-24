import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { TickerTape } from './TickerTape';
import { NotificationService } from '../services/notification.service';
import { NotificationItem } from '../types';

export const Navbar: React.FC<{ onOpenDepositModal: () => void }> = ({ onOpenDepositModal }) => {
  const { user, wallet, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications', err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationService.markRead(id);
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllRead();
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getKycBadge = () => {
    switch (user?.kycStatus) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>KYC Active</span>
          </span>
        );
      case 'VERIFICATION_PENDING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Review Pending</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>KYC Required</span>
          </span>
        );
    }
  };

  return (
    <div className="sticky top-0 z-40">
      {/* Live Market Ticker Tape */}
      <TickerTape />

      {/* Main App Navbar */}
      <header className="h-16 border-b border-[#1E293B] bg-[#0A0E1A]/95 backdrop-blur-md flex items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center shadow-glow-emerald">
            <TrendingUp className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">$hifty50</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO FINTECH
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Electronic Trading & Settlement Simulation</p>
          </div>
        </div>

        {/* Right Action Bar */}
        {user && (
          <div className="flex items-center gap-4">
            {/* Quick Live Wallet Balance */}
            {user.kycStatus === 'ACTIVE' && wallet && (
              <div className="hidden sm:flex items-center gap-3 bg-[#0F172A] border border-[#1E293B] rounded-xl px-3.5 py-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Cash:</span>
                  <span className="mono-num text-sm font-bold text-white">
                    ₹{wallet.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={onOpenDepositModal}
                  className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-2.5 py-1 rounded-lg transition-all shadow-glow-emerald"
                >
                  + Add Funds
                </button>
              </div>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-[#131D31] rounded-xl transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-black font-black text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-2xl p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">In-App Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {safeNotifications.length === 0 ? (
                      <p className="text-xs text-gray-500 py-6 text-center">No notifications yet.</p>
                    ) : (
                      safeNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead
                              ? 'bg-[#0A0E1A] border-[#1E293B]/60 text-gray-400'
                              : 'bg-emerald-500/5 border-emerald-500/30 text-white shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-white text-[11px]">{n.title}</span>
                            <span className="text-[9px] text-gray-500">
                              {new Date(n.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* KYC Status Pill */}
            {getKycBadge()}

            {/* Profile & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#1E293B]">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-white">{user.fullName}</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
