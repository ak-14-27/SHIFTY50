import React, { useState } from 'react';
import { paymentApi } from '../services/payment.service';
import { X, CreditCard, Smartphone, Building, Sparkles, CheckCircle2, Copy, Check } from 'lucide-react';

interface VirtualCapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VirtualCapitalModal: React.FC<VirtualCapitalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(50000);
  const [method, setMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING'>('UPI');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [10000, 25000, 50000, 100000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    try {
      const idempotencyKey = `IDEM_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const res = await paymentApi.processDeposit({
        amount,
        paymentMethod: method,
        idempotencyKey,
      });

      if (res.success && res.data) {
        setReceipt(res.data);
        onSuccess();
      }
    } catch (err) {
      console.error('Payment failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReceipt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-5">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* E-Receipt View */
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-glow-emerald">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Payment Success
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 mono-num">
                ₹{receipt.transaction?.amount?.toLocaleString('en-IN') || amount}
              </h3>
              <p className="text-xs text-gray-400">Credited to Available Trading Balance</p>
            </div>

            <div className="bg-[#080C14] p-3.5 rounded-2xl border border-[#1E293B] text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="text-gray-300 font-bold">{receipt.transaction?.receiptId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mode:</span>
                <span className="text-white font-bold">{receipt.transaction?.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Idempotency Key:</span>
                <span className="text-gray-400 truncate max-w-[150px]">
                  {receipt.transaction?.idempotencyKey}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-emerald-400 font-bold">SUCCESS (Settled)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopyReceipt(receipt.transaction?.receiptId || '')}
                className="flex-1 py-2.5 bg-[#1E293B] hover:bg-[#334155] text-xs font-semibold text-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Receipt ID' : 'Copy Receipt ID'}</span>
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition-all shadow-glow-emerald"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add Simulated Capital</h3>
                <p className="text-xs text-gray-400">Idempotent simulated payment gateway</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase text-[11px] tracking-wider">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    max={10000000}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#080C14] border border-[#1E293B] focus:border-emerald-500 rounded-xl text-white font-mono text-base focus:outline-none"
                  />
                </div>
                {/* Quick amount chips */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-1.5 text-xs rounded-lg font-mono font-semibold transition-colors ${
                        amount === amt
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-[#080C14] text-gray-400 hover:text-white border border-[#1E293B]'
                      }`}
                    >
                      +₹{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase text-[11px] tracking-wider">
                  Payment Mode (Simulated)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('UPI')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      method === 'UPI'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-glow-emerald'
                        : 'bg-[#080C14] border-[#1E293B] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[11px] font-bold">UPI Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('CARD')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      method === 'CARD'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-glow-emerald'
                        : 'bg-[#080C14] border-[#1E293B] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Credit/Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('NET_BANKING')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      method === 'NET_BANKING'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-glow-emerald'
                        : 'bg-[#080C14] border-[#1E293B] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="text-[11px] font-bold">Net Banking</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold py-3 rounded-xl text-xs transition-all shadow-glow-emerald"
                >
                  {loading ? 'Authorizing Payment...' : `Deposit ₹${amount.toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
