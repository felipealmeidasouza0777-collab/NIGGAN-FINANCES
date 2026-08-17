import React from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Target,
  Rocket,
  Layers,
  Sparkles,
  ChevronRight,
  Plus,
  ArrowRight,
  CheckCircle2,
  Video,
  ShieldCheck,
  CreditCard,
  Building,
} from 'lucide-react';
import {
  FinancialSummary,
  Account,
  MoneyBox,
  Transaction,
  MonthlyPatrimonyGoal,
  FinancialSettings,
} from '../../types/finance';
import { formatCurrency, formatDateBR } from '../../lib/finance';
import { AlertsBanner } from '../AlertsBanner';

interface DashboardViewProps {
  summary: FinancialSummary;
  accounts: Account[];
  boxes: MoneyBox[];
  recentTransactions: Transaction[];
  currentGoal?: MonthlyPatrimonyGoal;
  settings: FinancialSettings;
  onNavigateTab: (tab: string) => void;
  onOpenQuickAdd: (type?: 'expense' | 'income' | 'investment' | 'transfer') => void;
  onOpenTransfer: (fromBoxId?: string) => void;
  onToggleRecurringPaid: (id: string, isPaid: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  accounts,
  boxes,
  recentTransactions,
  currentGoal,
  settings,
  onNavigateTab,
  onOpenQuickAdd,
  onOpenTransfer,
}) => {
  const goalTargetCents = settings.globalPatrimonyGoal.targetInCents || 3000000;
  const goalProgress = Math.min(100, Math.round((summary.totalPatrimonyInCents / goalTargetCents) * 100));
  const goalRemaining = Math.max(0, goalTargetCents - summary.totalPatrimonyInCents);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Smart Alerts Banner */}
      <AlertsBanner
        summary={summary}
        currentGoal={currentGoal}
        onNavigateTab={onNavigateTab}
      />

      {/* Top 5 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Saldo Disponível */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Saldo Atual
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl sm:text-3xl text-slate-900 font-mono-num tracking-tight">
            {formatCurrency(summary.currentAvailableInCents)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Disponível em contas</span>
            <button
              onClick={() => onOpenQuickAdd('expense')}
              className="text-emerald-600 font-black text-xs hover:underline cursor-pointer"
            >
              + Gasto
            </button>
          </div>
        </div>

        {/* Card 2: Receitas do Mês */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Receitas do Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl sm:text-3xl text-emerald-600 font-mono-num tracking-tight">
            {formatCurrency(summary.totalIncomeInCents)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Salário + Contratos + TT</span>
            <button
              onClick={() => onNavigateTab('income')}
              className="text-emerald-600 font-black text-xs hover:underline cursor-pointer"
            >
              Fontes
            </button>
          </div>
        </div>

        {/* Card 3: Despesas do Mês */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Despesas do Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20 shadow-2xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl sm:text-3xl text-rose-600 font-mono-num tracking-tight">
            {formatCurrency(summary.totalExpensesInCents)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Fixas + Variáveis</span>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-rose-600 font-black text-xs hover:underline cursor-pointer"
            >
              Ver contas
            </button>
          </div>
        </div>

        {/* Card 4: Investimentos */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Investimentos Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl sm:text-3xl text-blue-600 font-mono-num tracking-tight">
            {formatCurrency(summary.totalInvestedInCents)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Aportes C6 / XP / CDB</span>
            <button
              onClick={() => onOpenQuickAdd('investment')}
              className="text-blue-600 font-black text-xs hover:underline cursor-pointer"
            >
              + Aporte
            </button>
          </div>
        </div>

        {/* Card 5: Patrimônio Total (Dark Glass) */}
        <div className="bg-slate-900/90 text-white backdrop-blur-xl rounded-[28px] p-5 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Patrimônio Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-black text-2xl sm:text-3xl text-emerald-400 font-mono-num tracking-tight">
            {formatCurrency(summary.totalPatrimonyInCents)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Acumulado em contas</span>
            <span className="text-emerald-400 font-black text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {goalProgress}% Meta
            </span>
          </div>
        </div>
      </div>

      {/* Global Goal Hero Card: R$ 30.000 até Maio/2027 */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs border border-amber-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                  Meta: R$ 30.000 até Maio/2027
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20">
                  {goalProgress}% Concluído
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Plano de crescimento acelerado via aportes do Salário FGL + Comissões do TikTok Shop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('patrimony')}
              className="px-4 py-2.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-md shadow-slate-900/10 border border-slate-700/60 transition-all cursor-pointer"
            >
              <span>Ver Tabela Completa (Ago-Mai)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar with Frosted styling */}
        <div className="space-y-3 relative z-10">
          <div className="h-4 bg-slate-100/90 rounded-full overflow-hidden p-0.5 border border-white/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white">
              <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-0.5">Patrimônio Atual</span>
              <span className="font-black text-slate-900 font-mono-num text-sm sm:text-base">
                {formatCurrency(summary.totalPatrimonyInCents)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white">
              <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-0.5">Meta Final</span>
              <span className="font-black text-slate-900 font-mono-num text-sm sm:text-base">
                {formatCurrency(goalTargetCents)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white">
              <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-0.5">Quanto Falta</span>
              <span className="font-black text-amber-700 font-mono-num text-sm sm:text-base">
                {formatCurrency(goalRemaining)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white">
              <span className="text-slate-400 block text-[10px] font-black uppercase tracking-wider mb-0.5">Meta deste Mês (Ago/26)</span>
              <span className="font-black text-emerald-700 font-mono-num text-sm sm:text-base flex items-center gap-1">
                R$ 3.000,00 <span className="text-[10px] text-emerald-600 font-bold">(Superada!)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: TikTok Shop Highlight + Money Boxes (Caixas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TikTok Shop Highlight Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/95 text-white rounded-[32px] p-6 sm:p-8 shadow-lg border border-white/10 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight">TikTok Shop</h3>
                  <p className="text-xs text-purple-300 font-medium">Motor de Comissões e Escala</p>
                </div>
              </div>
              <span className="bg-emerald-500 text-[10px] px-2.5 py-1 rounded-lg font-black uppercase text-slate-900 tracking-wider">
                Performance
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block mb-1">Comissões no Mês</span>
                <span className="text-xl sm:text-2xl font-black font-mono-num text-white">
                  {formatCurrency(summary.tiktokMonthCommissionInCents)}
                </span>
              </div>
              <div className="bg-purple-500/15 border border-purple-400/30 backdrop-blur-md rounded-2xl p-3.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block mb-1">Caixa Reinvestimento</span>
                <span className="text-xl sm:text-2xl font-black font-mono-num text-emerald-400">
                  {formatCurrency(summary.tiktokReinvestBoxBalanceInCents)}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-white/5 rounded-2xl text-xs space-y-1.5 border border-white/10 text-purple-100 backdrop-blur-md">
              <div className="flex justify-between font-medium">
                <span className="text-purple-300">Regra de Divisão:</span>
                <span className="font-bold text-white">50% Inv / 20% Reinv / 30% Pessoal</span>
              </div>
              <p className="text-[11px] text-purple-300/90 leading-tight">
                O saldo da Caixa de Reinvestimento acumula mensalmente para compras de ferramentas e amostras sem impactar seus gastos normais.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => onOpenQuickAdd('income')}
              className="text-xs font-bold text-purple-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              + Nova Comissão
            </button>
            <button
              onClick={() => onNavigateTab('tiktok')}
              className="text-xs font-black text-white bg-purple-600 hover:bg-purple-500 px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Ver Painel TikTok
            </button>
          </div>
        </div>

        {/* Money Boxes (Caixas) Summary (7 cols) */}
        <div className="lg:col-span-7 bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 tracking-tight">Sistema de Caixas</h3>
                <p className="text-xs text-slate-500 font-medium">Organização clara do seu capital</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenTransfer()}
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-white shadow-2xs transition-all cursor-pointer"
              >
                Mover Dinheiro
              </button>
              <button
                onClick={() => onNavigateTab('boxes')}
                className="text-xs font-black text-emerald-600 hover:underline cursor-pointer"
              >
                Ver Todas
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {boxes.map((box) => (
              <div
                key={box.id}
                className="p-3.5 rounded-2xl border border-white bg-white/60 hover:bg-white hover:shadow-xs backdrop-blur-md transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-800 truncate">{box.name}</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
                    style={{ backgroundColor: box.color }}
                  />
                </div>
                <div className="text-sm sm:text-base font-black font-mono-num text-slate-900">
                  {formatCurrency(box.balanceInCents)}
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                  {box.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Contas Cadastradas & Extrato Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contas Cadastradas (4 cols) */}
        <div className="lg:col-span-4 bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-[0.15em]">
              Contas & Saldos
            </h3>
            <button
              onClick={() => onNavigateTab('settings')}
              className="text-xs font-black text-emerald-600 hover:underline cursor-pointer"
            >
              Ajustar
            </button>
          </div>

          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/60 hover:bg-white border border-white backdrop-blur-md transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{acc.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{acc.institution || 'Conta'}</span>
                  </div>
                </div>
                <span className="font-black font-mono-num text-xs sm:text-sm text-slate-900">
                  {formatCurrency(acc.currentBalanceInCents)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Extrato Recente (8 cols) */}
        <div className="lg:col-span-8 bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">Últimas Movimentações</h3>
              <p className="text-xs text-slate-400 font-medium">Histórico de lançamentos recentes</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200/80 rounded-2xl">
              <p className="text-xs text-slate-500 mb-2">Nenhuma movimentação registrada hoje.</p>
              <button
                onClick={() => onOpenQuickAdd()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                + Registrar agora
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 hover:bg-white border border-white backdrop-blur-md transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : t.type === 'expense'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : t.type === 'investment'
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                      }`}
                    >
                      {t.type === 'income' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : t.type === 'expense' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : t.type === 'investment' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <Layers className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{t.description}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                        <span>{formatDateBR(t.date, 'dayMonth')}</span>
                        <span>•</span>
                        <span>{t.incomeSource || 'Geral'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-black font-mono-num text-xs sm:text-sm ${
                        t.type === 'income'
                          ? 'text-emerald-600'
                          : t.type === 'expense'
                          ? 'text-rose-600'
                          : t.type === 'investment'
                          ? 'text-blue-600'
                          : 'text-purple-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                      {formatCurrency(t.amountInCents)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
