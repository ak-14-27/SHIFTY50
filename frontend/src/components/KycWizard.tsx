import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, ArrowRight, Sparkles, AlertCircle, FileText } from 'lucide-react';

export const KycWizard: React.FC = () => {
  const { user, submitKyc } = useAuth();
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFillMockData = () => {
    setPanNumber('ABCDE1234F');
    setAadhaarNumber('987654321098');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await submitKyc({ panNumber, aadhaarNumber });
      setSuccessMsg('KYC successfully verified! ₹1,00,000 virtual capital has been credited to your wallet.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit KYC. Please verify format.');
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = user?.kycStatus === 'ACTIVE';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* State Machine Stepper */}
      <div className="p-6 rounded-2xl bg-[#151A23] border border-[#232B3B]">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          KYC Compliance & Verification Lifecycle
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          FinTech state machine progression: mimicking real regulatory identity verification before granting trading ledger access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-3 rounded-xl bg-[#1C2331] border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-white">Registered</p>
            <p className="text-[11px] text-gray-400">Account created with JWT credentials</p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3 rounded-xl border ${
              isCompleted || user?.kycStatus === 'VERIFICATION_PENDING'
                ? 'bg-[#1C2331] border-emerald-500/30'
                : 'bg-[#151A23] border-[#232B3B]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 2</span>
              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
            <p className="text-xs font-semibold text-white">KYC Submission</p>
            <p className="text-[11px] text-gray-400">PAN & Aadhaar mock verification</p>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3 rounded-xl border ${
              isCompleted
                ? 'bg-[#1C2331] border-emerald-500/30'
                : 'bg-[#151A23] border-[#232B3B]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 3</span>
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs font-semibold text-white">Verified</p>
            <p className="text-[11px] text-gray-400">Compliant trader profile active</p>
          </div>

          {/* Step 4 */}
          <div
            className={`p-3 rounded-xl border ${
              isCompleted
                ? 'bg-emerald-500/10 border-emerald-500/50'
                : 'bg-[#151A23] border-[#232B3B]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 4</span>
              {isCompleted && <Sparkles className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs font-semibold text-white">₹1,00,000 Capital</p>
            <p className="text-[11px] text-gray-400">Wallet ledger initialized</p>
          </div>
        </div>
      </div>

      {/* Form or Completed State */}
      {isCompleted ? (
        <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">KYC Verification Completed</h3>
          <p className="text-sm text-gray-300 max-w-md mx-auto">
            Your simulated trading account is in <strong className="text-emerald-400">ACTIVE</strong> status. Your double-entry ledger is provisioned with <strong className="text-emerald-400">₹1,00,000</strong> virtual capital.
          </p>
          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-gray-400">
            <span>Mock PAN: <strong className="text-white font-mono">{user?.panMock || 'ABCDE1234F'}</strong></span>
            <span>Mock Aadhaar: <strong className="text-white font-mono">XXXX-XXXX-{user?.aadhaarMock?.slice(-4) || '1098'}</strong></span>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#151A23] border border-[#232B3B]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Submit Identity Credentials</h3>
              <p className="text-xs text-gray-400">
                Enter simulated PAN and Aadhaar details to activate your wallet. No real credentials needed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillMockData}
              className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              ⚡ Autofill Test Credentials
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Mock PAN Card Number (10 Characters: 5 Letters + 4 Digits + 1 Letter)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0E121A] border border-[#232B3B] focus:border-emerald-500 rounded-lg text-sm text-white font-mono uppercase focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Mock Aadhaar Number (12 Numeric Digits)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="e.g. 987654321098"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0E121A] border border-[#232B3B] focus:border-emerald-500 rounded-lg text-sm text-white font-mono focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <span>Verifying and Initializing Wallet...</span>
                ) : (
                  <>
                    <span>Submit KYC & Claim ₹1,00,000 Capital</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
