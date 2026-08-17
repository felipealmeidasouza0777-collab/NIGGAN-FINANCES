import React from 'react';
import {
  Wallet,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Video,
} from 'lucide-react';
import { formatCurrency } from '../lib/finance';
import { FinancialSummary } from '../types/finance';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAdd: (type?: 'expense' | 'income' | 'investment' | 'transfer') => void;
  summary: FinancialSummary;
  selectedMonthYear: string;
  onMonthChange: (monthYear: string) => void;
  onOpenAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
  summary,
  selectedMonthYear,
  onMonthChange,
  onOpenAI,
}) => {
  const monthOptions = [
    { value: '2026-08', label: 'Agosto / 2026' },
    { value: '2026-09', label: 'Setembro / 2026' },
    { value: '2026-10', label: 'Outubro / 2026' },
    { value: '2026-11', label: 'Novembro / 2026' },
    { value: '2026-12', label: 'Dezembro / 2026' },
    { value: '2027-01', label: 'Janeiro / 2027' },
    { value: '2027-05', label: 'Maio / 2027 (Meta 30k)' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/60 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
              title="Ir para o Início"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 border border-slate-700/50 group-hover:bg-emerald-600 transition-all duration-200">
                <span className="font-black text-lg tracking-wider text-emerald-400">N</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  NIGGAN <span className="text-emerald-600">FINANCES</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Controle Pessoal & TikTok Shop
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs with Frosted Glass Pill Container */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-xs text-xs font-semibold">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('transactions')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Extrato
            </button>
            <button
              onClick={() => onTabChange('income')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => onTabChange('expenses')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'expenses'
                  ? 'bg-white text-rose-600 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => onTabChange('boxes')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'boxes'
                  ? 'bg-white text-slate-900 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Caixas
            </button>
            <button
              onClick={() => onTabChange('tiktok')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentTab === 'tiktok'
                  ? 'bg-purple-600 text-white shadow-xs font-bold border border-purple-500'
                  : 'text-purple-700 hover:bg-purple-50/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>TikTok Shop</span>
            </button>
            <button
              onClick={() => onTabChange('patrimony')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'patrimony'
                  ? 'bg-white text-slate-900 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Meta R$ 30k
            </button>
            <button
              onClick={() => onTabChange('ai_advisor')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                currentTab === 'ai_advisor'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold border border-indigo-500'
                  : 'text-indigo-600 hover:bg-indigo-50/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>IA</span>
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                currentTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs font-bold border border-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Config
            </button>
          </nav>

          {/* Right Actions: Month Picker + Quick Entry Button + User Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Month Selector in Glass Container */}
            <div className="relative flex items-center bg-white/70 backdrop-blur-md hover:bg-white/90 border border-white shadow-2xs rounded-2xl px-3 py-1.5 transition-all">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                aria-label="Selecionar mês de referência"
                value={selectedMonthYear}
                onChange={(e) => onMonthChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer pr-1"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Add Button with Frosted Glow */}
            <button
              onClick={() => onOpenQuickAdd()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white shadow-md shadow-slate-900/15 border border-slate-700/60 transition-all cursor-pointer"
              title="Adicionar movimentação em segundos"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-emerald-400" />
              <span className="hidden sm:inline">Lançar</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
