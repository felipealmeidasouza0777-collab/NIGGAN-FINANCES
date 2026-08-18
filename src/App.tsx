import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { db } from './services/database/storage';
import { computeFinancialSummary } from './lib/finance';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { TransferModal } from './components/TransferModal';
import { Login } from './components/Login';
import { isSupabaseConfigured } from './services/supabase/client';
import { authService } from './services/supabase/authService';
import { pullRemoteState, scheduleRemotePush } from './services/supabase/syncService';
import { CloudCheck, CloudOff, Loader2 } from 'lucide-react';

// Views
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { IncomeView } from './components/views/IncomeView';
import { ExpensesView } from './components/views/ExpensesView';
import { BoxesView } from './components/views/BoxesView';
import { PatrimonyView } from './components/views/PatrimonyView';
import { TikTokShopView } from './components/views/TikTokShopView';
import { AiAdvisorView } from './components/views/AiAdvisorView';
import { SettingsView } from './components/views/SettingsView';

import { TransactionType } from './types/finance';
import { CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => db.getState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<TransactionType>('expense');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferDefaultFromBox, setTransferDefaultFromBox] = useState<string | undefined>();

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Supabase auth & cloud sync (fully optional: without env vars the app
  // behaves exactly like before, offline-only via localStorage) ---
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured);
  const [hydratedFromCloud, setHydratedFromCloud] = useState(!isSupabaseConfigured);
  const skipNextPush = useRef(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let unsubscribeAuth: () => void = () => {};

    authService.getSession().then(async (initialSession) => {
      setSession(initialSession);
      setAuthChecked(true);

      if (initialSession) {
        const remote = await pullRemoteState(initialSession.user.id);
        if (remote) {
          skipNextPush.current = true;
          db.importDataJSON(JSON.stringify(remote));
        }
      }
      setHydratedFromCloud(true);
    });

    unsubscribeAuth = authService.onAuthStateChange(async (nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        const remote = await pullRemoteState(nextSession.user.id);
        if (remote) {
          skipNextPush.current = true;
          db.importDataJSON(JSON.stringify(remote));
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = db.subscribe((nextState) => {
      setData(nextState);

      if (isSupabaseConfigured && session) {
        if (skipNextPush.current) {
          // This update came FROM the cloud (just hydrated) — don't echo it back.
          skipNextPush.current = false;
          return;
        }
        scheduleRemotePush(session.user.id, nextState);
      }
    });
    return () => unsubscribe();
  }, [session]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleOpenQuickAdd = (type: TransactionType = 'expense') => {
    setQuickAddInitialType(type);
    setIsQuickAddOpen(true);
  };

  const handleOpenTransfer = (fromBoxId?: string) => {
    setTransferDefaultFromBox(fromBoxId);
    setIsTransferOpen(true);
  };

  const summary = computeFinancialSummary(
    data.accounts,
    data.transactions,
    data.recurringExpenses,
    data.moneyBoxes,
    data.tiktokEntries,
    data.tiktokReinvestExpenses,
    data.settings,
    data.selectedMonthYear || '2026-08'
  );

  const currentGoal = data.monthlyGoals.find((g) => g.monthYear === '2026-08');

  // Filter variable transactions (non-recurring)
  const variableTransactions = data.transactions.filter((t) => t.type === 'expense');
  const boxTransactions = data.transactions.filter((t) => t.type === 'transfer');

  if (!authChecked || !hydratedFromCloud) {
    return (
      <div className="min-h-screen bg-slate-100/60 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (isSupabaseConfigured && !session) {
    return <Login onSuccess={() => {}} />;
  }

  const syncBadge = isSupabaseConfigured ? (
    <div
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-2xs text-[10px] font-bold text-emerald-700"
      title={`Sincronizado como ${session?.user.email ?? ''}`}
    >
      <CloudCheck className="w-3.5 h-3.5" />
      <span>Nuvem</span>
    </div>
  ) : (
    <div
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-2xs text-[10px] font-bold text-slate-400"
      title="Configure o Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) para sincronizar na nuvem"
    >
      <CloudOff className="w-3.5 h-3.5" />
      <span>Modo local</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 antialiased pb-24 md:pb-12 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        currentTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        summary={summary}
        selectedMonthYear={data.selectedMonthYear || '2026-08'}
        onMonthChange={(monthYear) => db.setSelectedMonthYear(monthYear)}
        onOpenAI={() => setActiveTab('ai_advisor')}
        syncStatus={syncBadge}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            accounts={data.accounts}
            boxes={data.moneyBoxes}
            recentTransactions={data.transactions}
            currentGoal={currentGoal}
            settings={data.settings}
            onNavigateTab={setActiveTab}
            onOpenQuickAdd={handleOpenQuickAdd}
            onOpenTransfer={handleOpenTransfer}
            onToggleRecurringPaid={(id, isPaid) => db.toggleRecurringExpensePaid(id, isPaid)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={data.transactions}
            categories={data.categories}
            accounts={data.accounts}
            onOpenQuickAdd={handleOpenQuickAdd}
            onSuccessToast={showToast}
          />
        )}

        {activeTab === 'income' && (
          <IncomeView
            transactions={data.transactions}
            settings={data.settings}
            onOpenQuickAdd={handleOpenQuickAdd}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            recurringExpenses={data.recurringExpenses}
            variableTransactions={variableTransactions}
            totalIncomeInCents={summary.totalIncomeInCents}
            settings={data.settings}
            categories={data.categories}
            accounts={data.accounts}
            onOpenQuickAdd={handleOpenQuickAdd}
            onSuccessToast={showToast}
          />
        )}

        {activeTab === 'boxes' && (
          <BoxesView
            boxes={data.moneyBoxes}
            boxTransactions={boxTransactions}
            onOpenTransfer={handleOpenTransfer}
          />
        )}

        {activeTab === 'patrimony' && (
          <PatrimonyView
            goals={data.monthlyGoals}
            accounts={data.accounts}
            summary={summary}
            settings={data.settings}
            onSuccessToast={showToast}
          />
        )}

        {activeTab === 'tiktok' && (
          <TikTokShopView
            entries={data.tiktokEntries}
            reinvestExpenses={data.tiktokReinvestExpenses}
            settings={data.settings}
            onSuccessToast={showToast}
          />
        )}

        {activeTab === 'ai_advisor' && (
          <AiAdvisorView
            summary={summary}
            transactions={data.transactions}
            tiktokEntries={data.tiktokEntries}
            settings={data.settings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={data.settings}
            accounts={data.accounts}
            categories={data.categories}
            boxes={data.moneyBoxes}
            transactions={data.transactions}
            goals={data.monthlyGoals}
            onSuccessToast={showToast}
          />
        )}
      </main>

      {/* Floating Action Button for Desktop/Mobile Quick Entry */}
      <button
        onClick={() => handleOpenQuickAdd('expense')}
        className="fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Lançamento Rápido (3 Segundos)"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
      />

      {/* Modals */}
      <QuickTransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddInitialType}
        categories={data.categories}
        accounts={data.accounts}
        boxes={data.moneyBoxes}
        settings={data.settings}
        onSuccessToast={showToast}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        boxes={data.moneyBoxes}
        defaultFromBoxId={transferDefaultFromBox}
        onSuccessToast={showToast}
      />
    </div>
  );
}
