import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (!err.response) {
        setError(
          'Cannot connect to backend server. Please verify the backend is running on http://localhost:5000 (run `run_backend.bat` or `npm run dev` in the backend folder).'
        );
      } else {
        setError('Invalid email or password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center mx-auto shadow-glow-emerald">
            <TrendingUp className="w-8 h-8 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">$hifty50</h1>
          <p className="text-xs text-gray-400">Virtual Electronic Trading & Matching Engine Platform</p>
        </div>

        {/* Login Box */}
        <div className="fintech-card p-8 shadow-2xl space-y-5 border-[#1E293B]">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
            <h2 className="text-base font-bold text-white">Sign In to Workstation</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              Live Terminal
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#080C14] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#080C14] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-sm text-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold py-3 px-4 rounded-xl transition-all shadow-glow-emerald text-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-2 border-t border-[#1E293B] space-y-2">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              1-Click Demo Personas (Pass: Password123!)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('trader@shifty50.com')}
                className="p-2 rounded-xl bg-[#080C14] hover:bg-[#131D31] border border-[#1E293B] text-left text-gray-300 transition-colors"
              >
                <div className="font-bold text-white text-[11px]">Active Trader</div>
                <div className="text-[9px] text-emerald-400">Stocks + SIP Holdings</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@shifty50.com')}
                className="p-2 rounded-xl bg-[#080C14] hover:bg-[#131D31] border border-[#1E293B] text-left text-gray-300 transition-colors"
              >
                <div className="font-bold text-white text-[11px]">Admin Console</div>
                <div className="text-[9px] text-purple-400">System Telemetry & KYC</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-emerald-400 hover:underline font-bold"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
