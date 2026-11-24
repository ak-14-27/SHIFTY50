import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calculator,
  PieChart,
  Printer,
} from 'lucide-react';
import { ReportsService } from '../services/reports.service';
import { portfolioApi } from '../services/portfolio.service';
import { ContractNote, TaxPnlReport, HoldingsStatement, Trade } from '../types';

export const ReportsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contract' | 'tax' | 'holdings'>('contract');

  // Contract notes state
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [contractNote, setContractNote] = useState<ContractNote | null>(null);
  const [loadingNote, setLoadingNote] = useState(false);

  // Tax P&L state
  const [taxReport, setTaxReport] = useState<TaxPnlReport | null>(null);
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [loadingTax, setLoadingTax] = useState(false);

  // Consolidated holdings state
  const [holdingsStatement, setHoldingsStatement] = useState<HoldingsStatement | null>(null);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

  // Load trades list for contract notes
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await portfolioApi.getMyTrades();
        if (res.success && res.data) {
          setTrades(res.data);
          if (res.data.length > 0 && !selectedTradeId) {
            setSelectedTradeId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load trade list for contract notes', err);
      }
    };
    fetchTrades();
  }, []);

  // Fetch contract note whenever selectedTradeId changes
  useEffect(() => {
    if (!selectedTradeId) return;
    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const note = await ReportsService.getContractNote(selectedTradeId);
        setContractNote(note);
      } catch (err) {
        console.error('Failed to load contract note', err);
      } finally {
        setLoadingNote(false);
      }
    };
    fetchNote();
  }, [selectedTradeId]);

  // Fetch Tax P&L statement
  useEffect(() => {
    if (activeTab === 'tax') {
      const fetchTax = async () => {
        setLoadingTax(true);
        try {
          const report = await ReportsService.getTaxPnlStatement(financialYear);
          setTaxReport(report);
        } catch (err) {
          console.error('Failed to load tax statement', err);
        } finally {
          setLoadingTax(false);
        }
      };
      fetchTax();
    }
  }, [activeTab, financialYear]);

  // Fetch Consolidated Holdings statement
  useEffect(() => {
    if (activeTab === 'holdings') {
      const fetchHoldings = async () => {
        setLoadingHoldings(true);
        try {
          const stmt = await ReportsService.getHoldingsStatement();
          setHoldingsStatement(stmt);
        } catch (err) {
          console.error('Failed to load holdings statement', err);
        } finally {
          setLoadingHoldings(false);
        }
      };
      fetchHoldings();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0D1527] to-[#0A0E1A] p-6 rounded-2xl border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Regulatory Audit & Statements
            </span>
            <span className="text-gray-400 text-xs">• SEBI & NSE Compliance Standard</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Institutional Contract Notes & Tax Statements
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Auditable Electronic Contract Notes (ECN), STCG/LTCG capital gains computation, and unified portfolio asset allocation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#080C14] p-1.5 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('contract')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'contract'
                ? 'bg-emerald-500 text-black shadow-glow-emerald'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Contract Notes
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tax'
                ? 'bg-emerald-500 text-black shadow-glow-emerald'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Tax P&L
          </button>
          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'holdings'
                ? 'bg-emerald-500 text-black shadow-glow-emerald'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" /> Consolidated Holdings
          </button>
        </div>
      </div>

      {/* Tab 1: Contract Notes */}
      {activeTab === 'contract' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Trade Selection List */}
          <div className="lg:col-span-4 p-4 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Executed Trades ({trades.length})
            </h2>

            {trades.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                No executed trades found. Place and execute orders in the Trading Terminal to generate contract notes.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {trades.map((t) => {
                  const isSelected = selectedTradeId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTradeId(t.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-[#0A0E1A] border-[#1E293B] text-gray-300 hover:bg-[#131D31]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{t.symbol}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            t.side === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.side}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] mono-num text-gray-400">
                        <span>{t.quantity} Qty @ ₹{t.price.toFixed(2)}</span>
                        <span className="font-bold text-gray-200">
                          ₹{t.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        {new Date(t.executedAt).toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contract Note Viewer */}
          <div className="lg:col-span-8">
            {loadingNote ? (
              <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Generating Electronic Contract Note...</span>
              </div>
            ) : contractNote ? (
              <div className="p-6 rounded-2xl bg-[#0B0F1C] border border-[#1E293B] space-y-6 shadow-2xl print:bg-white print:text-black">
                {/* Note Header */}
                <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">
                        Electronic Contract Note
                      </h2>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                        ORIGINAL FOR RECIPIENT
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {contractNote.exchange} • Settlement No: {contractNote.settlementNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131D31] hover:bg-[#1E293B] text-gray-300 text-xs font-bold rounded-xl border border-[#1E293B] transition-all print:hidden"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" /> Print
                  </button>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#080C14] p-3.5 rounded-xl border border-[#1E293B]/60 text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Note Number</span>
                    <span className="font-mono font-bold text-white text-[10px]">
                      {contractNote.contractNoteNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Trade Date</span>
                    <span className="font-mono text-gray-300">
                      {new Date(contractNote.tradeDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Settlement Date</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {new Date(contractNote.settlementDate).toLocaleDateString('en-IN')} (T+1)
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 block">Client ID / Tax</span>
                    <span className="text-gray-300">{contractNote.clientInfo.taxStatus}</span>
                  </div>
                </div>

                {/* Security & Order Execution Details */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Trade Execution Breakdown
                  </h3>
                  <table className="w-full text-left text-xs border border-[#1E293B] rounded-xl overflow-hidden">
                    <thead className="bg-[#131D31] text-gray-400 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="py-2 px-3">Security ISIN / Name</th>
                        <th className="py-2 px-3 text-center">Side</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Gross Price</th>
                        <th className="py-2 px-3 text-right">Gross Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-3 font-sans font-bold text-white">
                          <div>{contractNote.security.name}</div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {contractNote.security.isin}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              contractNote.security.side === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {contractNote.security.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-300">
                          {contractNote.security.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-300">
                          ₹{contractNote.security.grossRate.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          ₹{contractNote.security.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Statutory Levies & Taxes */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Statutory Levies, Taxes & Exchange Fees
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]/60 flex justify-between">
                      <span className="text-gray-400 font-sans text-[11px]">Brokerage (0.05%):</span>
                      <span className="text-white font-bold">₹{contractNote.charges.brokerage.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]/60 flex justify-between">
                      <span className="text-gray-400 font-sans text-[11px]">STT (0.1%):</span>
                      <span className="text-white font-bold">₹{contractNote.charges.stt.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]/60 flex justify-between">
                      <span className="text-gray-400 font-sans text-[11px]">Exchange Turnover:</span>
                      <span className="text-white font-bold">₹{contractNote.charges.exchangeTurnoverCharge.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]/60 flex justify-between">
                      <span className="text-gray-400 font-sans text-[11px]">SEBI Turnover Charges:</span>
                      <span className="text-white font-bold">₹{contractNote.charges.sebiCharges.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]/60 flex justify-between">
                      <span className="text-gray-400 font-sans text-[11px]">GST (18% on fees):</span>
                      <span className="text-white font-bold">₹{contractNote.charges.gst.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#080C14] border border-[#1E293B]/60 flex justify-between">
                      <span className="text-gray-400 font-sans text-[11px]">Stamp Duty:</span>
                      <span className="text-white font-bold">₹{contractNote.charges.stampDuty.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Settlement Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#0F1E1A] to-[#0A1412] border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      Net Settlement Direction
                    </span>
                    <p className="text-xs font-bold text-white">
                      {contractNote.netPayableReceivable.direction}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Net Amount
                    </span>
                    <span className="text-lg font-black text-emerald-400 mono-num">
                      ₹{contractNote.netPayableReceivable.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Regulatory Disclaimer */}
                <p className="text-[10px] text-gray-500 border-t border-[#1E293B] pt-3 italic">
                  {contractNote.disclaimer}
                </p>
              </div>
            ) : (
              <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-gray-500">
                Select a trade on the left to inspect its computer-generated contract note.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Tax P&L Statement */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          {/* Year selector & summary */}
          <div className="flex items-center justify-between bg-[#0F172A] p-4 rounded-2xl border border-[#1E293B]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">Financial Year Assessment:</span>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="bg-[#080C14] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400 outline-none"
              >
                <option value="2026-2027">FY 2026-2027 (Assessment Year 2027-28)</option>
                <option value="2025-2026">FY 2025-2026 (Assessment Year 2026-27)</option>
              </select>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Finance Act 2024 Revised Rates: STCG @ 20%
            </span>
          </div>

          {loadingTax ? (
            <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Calculating Financial Year Tax Capital Gains...</span>
            </div>
          ) : taxReport ? (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Gross Equity Turnover</span>
                  <span className="text-base font-bold text-white mono-num">
                    ₹{taxReport.summary.equityTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Realized Gains</span>
                  <span
                    className={`text-base font-bold mono-num ${
                      taxReport.summary.totalRealizedGains >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {taxReport.summary.totalRealizedGains >= 0 ? '+' : ''}
                    ₹{taxReport.summary.totalRealizedGains.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#0F172A] border border-[#1E293B]">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Applicable Tax Rate</span>
                  <span className="text-base font-bold text-gray-300 mono-num">
                    {taxReport.summary.stcgTaxRate}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#0F172A] border border-emerald-500/30 bg-emerald-500/5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Estimated Tax Liability</span>
                  <span className="text-base font-black text-emerald-400 mono-num">
                    ₹{taxReport.summary.estimatedTaxLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Itemized Trades Table */}
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Realized Capital Gains Itemization
                </h3>

                {taxReport.equityTrades.length === 0 ? (
                  <p className="text-xs text-gray-500 py-6 text-center">
                    No realized trades found in this financial year. Realized gains are computed upon sell executions.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0A0E1A] text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-[#1E293B]">
                        <tr>
                          <th className="py-2.5 px-3">Symbol</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3 text-right">Quantity</th>
                          <th className="py-2.5 px-3 text-right">Exit Price</th>
                          <th className="py-2.5 px-3 text-right">Gross Turnover</th>
                          <th className="py-2.5 px-3 text-right">Realized P&L</th>
                          <th className="py-2.5 px-3 text-right">Tax Classification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/60 font-mono text-[11px]">
                        {taxReport.equityTrades.map((t) => (
                          <tr key={t.tradeId} className="hover:bg-[#131D31]/40">
                            <td className="py-2.5 px-3 font-bold text-white font-sans">{t.symbol}</td>
                            <td className="py-2.5 px-3 text-gray-400">
                              {new Date(t.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-300">{t.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-gray-300">₹{t.salePrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right text-gray-300">
                              ₹{t.totalTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-bold ${
                                t.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {t.realizedPnL >= 0 ? '+' : ''}₹{t.realizedPnL.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[10px] font-sans text-gray-400">
                              {t.gainType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 3: Consolidated Holdings Statement */}
      {activeTab === 'holdings' && (
        <div className="space-y-6">
          {loadingHoldings ? (
            <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span>Consolidating Multi-Asset Holdings...</span>
            </div>
          ) : holdingsStatement ? (
            <div className="space-y-6">
              {/* Asset Allocation Percentage Bar */}
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Portfolio Asset Allocation</span>
                  <span className="mono-num text-emerald-400">
                    Net Worth: ₹{holdingsStatement.totalPortfolioValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-full h-3 bg-[#080C14] rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${holdingsStatement.assetAllocation.stocksPct}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Stocks: ${holdingsStatement.assetAllocation.stocksPct}%`}
                  />
                  <div
                    style={{ width: `${holdingsStatement.assetAllocation.mutualFundsPct}%` }}
                    className="bg-cyan-500 h-full transition-all"
                    title={`Mutual Funds: ${holdingsStatement.assetAllocation.mutualFundsPct}%`}
                  />
                  <div
                    style={{ width: `${holdingsStatement.assetAllocation.liquidCashPct}%` }}
                    className="bg-gray-600 h-full transition-all"
                    title={`Liquid Cash: ${holdingsStatement.assetAllocation.liquidCashPct}%`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Equities ({holdingsStatement.assetAllocation.stocksPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>Mutual Funds ({holdingsStatement.assetAllocation.mutualFundsPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    <span>Liquid Cash ({holdingsStatement.assetAllocation.liquidCashPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Equities Table */}
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Equity Stock Holdings ({holdingsStatement.stocks.length})
                </h3>
                {holdingsStatement.stocks.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No equity holdings active.</p>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-[#1E293B]">
                      <tr>
                        <th className="py-2 px-3 font-sans">Stock</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Avg Cost</th>
                        <th className="py-2 px-3 text-right">LTP</th>
                        <th className="py-2 px-3 text-right">Cur Value</th>
                        <th className="py-2 px-3 text-right">Unrealized P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 text-[11px]">
                      {holdingsStatement.stocks.map((s) => (
                        <tr key={s.symbol}>
                          <td className="py-2 px-3 font-sans font-bold text-white">{s.symbol}</td>
                          <td className="py-2 px-3 text-right text-gray-300">{s.quantity}</td>
                          <td className="py-2 px-3 text-right text-gray-400">₹{s.averagePrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-white font-bold">₹{s.currentPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-gray-200">
                            ₹{s.currentValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-bold ${
                              s.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {s.pnl >= 0 ? '+' : ''}₹{s.pnl.toFixed(2)} ({s.pnlPct.toFixed(2)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mutual Funds Table */}
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mutual Fund Holdings ({holdingsStatement.mutualFunds.length})
                </h3>
                {holdingsStatement.mutualFunds.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">No mutual fund holdings active.</p>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="text-[10px] uppercase font-bold text-gray-500 border-b border-[#1E293B]">
                      <tr>
                        <th className="py-2 px-3 font-sans">Fund Name</th>
                        <th className="py-2 px-3 text-right">Units</th>
                        <th className="py-2 px-3 text-right">Avg NAV</th>
                        <th className="py-2 px-3 text-right">Cur NAV</th>
                        <th className="py-2 px-3 text-right">Cur Value</th>
                        <th className="py-2 px-3 text-right">Unrealized P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 text-[11px]">
                      {holdingsStatement.mutualFunds.map((mf) => (
                        <tr key={mf.symbol}>
                          <td className="py-2 px-3 font-sans font-bold text-white">{mf.name}</td>
                          <td className="py-2 px-3 text-right text-gray-300">{mf.quantity.toFixed(3)}</td>
                          <td className="py-2 px-3 text-right text-gray-400">₹{mf.averagePrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-white font-bold">₹{mf.currentPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right text-gray-200">
                            ₹{mf.currentValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-bold ${
                              mf.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {mf.pnl >= 0 ? '+' : ''}₹{mf.pnl.toFixed(2)} ({mf.pnlPct.toFixed(2)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-center text-xs text-gray-500">
              No holdings data available.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
