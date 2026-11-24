import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TradingTerminal } from './pages/TradingTerminal';
import { HoldingsPortfolio } from './pages/HoldingsPortfolio';
import { MutualFundsHub } from './pages/MutualFundsHub';
import { ReportsHub } from './pages/ReportsHub';
import { Leaderboard } from './pages/Leaderboard';
import { AdminConsole } from './pages/AdminConsole';
import { WalletHub } from './pages/WalletHub';
import { KycWizard } from './components/KycWizard';
import { AuditLogs } from './pages/AuditLogs';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VirtualCapitalModal } from './components/VirtualCapitalModal';
import { walletApi } from './services/wallet.service';
import { WalletLedgerEntry, TransactionType } from './types';

const MainLayout: React.FC = () => {
  const { user, refreshWallet, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<WalletLedgerEntry[]>([]);
  const [totalLedgerEntries, setTotalLedgerEntries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState<TransactionType | ''>('');

  const fetchLedger = async () => {
    if (user?.kycStatus !== 'ACTIVE') return;
    setLoadingLedger(true);
    try {
      const res = await walletApi.getLedgerHistory({
        page: currentPage,
        limit: 15,
        type: selectedType || undefined,
      });
      if (res.success && res.data) {
        setLedgerEntries(Array.isArray(res.data.entries) ? res.data.entries : []);
        setTotalLedgerEntries(res.data.pagination?.totalEntries || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load ledger', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    if (user?.kycStatus === 'ACTIVE') {
      fetchLedger();
    }
  }, [user?.kycStatus, currentPage, selectedType]);

  const handleClaimMonthly = async () => {
    setLoadingAction(true);
    try {
      await walletApi.claimMonthlyCapital();
      await refreshWallet();
      await fetchLedger();
    } catch (err) {
      console.error('Failed to claim monthly allotment', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleTestReserve = async () => {
    setLoadingAction(true);
    try {
      await walletApi.reserveFunds({
        amount: 10000,
        referenceId: `ORD_LIMIT_MOCK_${Date.now()}`,
        description: 'Simulated Limit Order Hold: 5x TATASTEEL @ ₹2,000',
      });
      await refreshWallet();
      await fetchLedger();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to hold funds');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleTestRelease = async () => {
    setLoadingAction(true);
    try {
      await walletApi.releaseFunds({
        amount: 10000,
        referenceId: `ORD_CANCEL_MOCK_${Date.now()}`,
        description: 'Simulated Limit Order Cancel: Released ₹10,000 to Available',
      });
      await refreshWallet();
      await fetchLedger();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to release funds');
    } finally {
      setLoadingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Booting $hifty50 Trading Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col font-sans">
      <Navbar onOpenDepositModal={() => setIsDepositModalOpen(true)} />
      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          kycStatus={user?.kycStatus}
          userRole={user?.role}
        />
        <main className="flex-1 p-5 md:p-7 bg-[#080C14] overflow-y-auto max-h-[calc(100vh-6.25rem)]">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateToKyc={() => setCurrentTab('kyc')}
              onNavigateToTerminal={() => setCurrentTab('terminal')}
              onNavigateToPortfolio={() => setCurrentTab('portfolio')}
              onNavigateToWallet={() => setCurrentTab('wallet')}
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
              onClaimMonthly={handleClaimMonthly}
              onTestReserve={handleTestReserve}
              onTestRelease={handleTestRelease}
              loadingAction={loadingAction}
              ledgerEntries={ledgerEntries}
              totalLedgerEntries={totalLedgerEntries}
            />
          )}

          {currentTab === 'terminal' && (
            <TradingTerminal onNavigateToKyc={() => setCurrentTab('kyc')} />
          )}

          {currentTab === 'portfolio' && (
            <HoldingsPortfolio onNavigateToKyc={() => setCurrentTab('kyc')} />
          )}

          {currentTab === 'funds' && (
            <MutualFundsHub onNavigateToKyc={() => setCurrentTab('kyc')} />
          )}

          {currentTab === 'reports' && <ReportsHub />}

          {currentTab === 'leaderboard' && <Leaderboard />}

          {currentTab === 'admin' && <AdminConsole />}

          {currentTab === 'wallet' && (
            <WalletHub
              onNavigateToKyc={() => setCurrentTab('kyc')}
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
              onClaimMonthly={handleClaimMonthly}
              onTestReserve={handleTestReserve}
              onTestRelease={handleTestRelease}
              loadingAction={loadingAction}
              ledgerEntries={ledgerEntries}
              totalLedgerEntries={totalLedgerEntries}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              selectedType={selectedType}
              onTypeChange={(type) => {
                setSelectedType(type);
                setCurrentPage(1);
              }}
              loadingLedger={loadingLedger}
            />
          )}

          {currentTab === 'kyc' && <KycWizard />}

          {currentTab === 'audit' && <AuditLogs />}
        </main>
      </div>

      <VirtualCapitalModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={async () => {
          await refreshWallet();
          await fetchLedger();
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  return (
    <AuthProvider>
      <AppContent authView={authView} setAuthView={setAuthView} />
    </AuthProvider>
  );
};

const AppContent: React.FC<{
  authView: 'login' | 'register';
  setAuthView: (view: 'login' | 'register') => void;
}> = ({ authView, setAuthView }) => {
  const { user } = useAuth();

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return <MainLayout />;
};

export default App;
