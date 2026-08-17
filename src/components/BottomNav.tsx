import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  MoreHorizontal,
  Video,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Settings,
  X,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAdd: (type?: 'expense' | 'income' | 'investment' | 'transfer') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleSelectTab = (tab: string) => {
    onTabChange(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* "Mais" Menu Backdrop & Frosted Modal */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="flex-1"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="bg-white/95 backdrop-blur-2xl rounded-t-[36px] p-6 pb-10 shadow-2xl border-t border-white animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base">Menu Completo</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                  Niggan Finances
                </span>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSelectTab('tiktok')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                  currentTab === 'tiktok'
                    ? 'bg-purple-50/90 border-purple-200 text-purple-700 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md border-white text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">TikTok Shop</span>
                <span className="text-[10px] text-purple-600 font-medium mt-0.5">Comissões</span>
              </button>

              <button
                onClick={() => handleSelectTab('boxes')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                  currentTab === 'boxes'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md border-white text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Caixas</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">5 Divisões</span>
              </button>

              <button
                onClick={() => handleSelectTab('ai_advisor')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                  currentTab === 'ai_advisor'
                    ? 'bg-indigo-50/90 border-indigo-200 text-indigo-700 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md border-white text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">IA Financeira</span>
                <span className="text-[10px] text-indigo-600 font-medium mt-0.5">Diagnóstico</span>
              </button>

              <button
                onClick={() => handleSelectTab('income')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                  currentTab === 'income'
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md border-white text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Receitas</span>
              </button>

              <button
                onClick={() => handleSelectTab('expenses')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                  currentTab === 'expenses'
                    ? 'bg-rose-50/90 border-rose-200 text-rose-700 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md border-white text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-1.5">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Despesas</span>
              </button>

              <button
                onClick={() => handleSelectTab('settings')}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center ${
                  currentTab === 'settings'
                    ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md border-white text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center mb-1.5">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Ajustes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Frosted Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-t border-white/60 px-4 py-2 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-between max-w-md mx-auto relative">
          {/* Tab 1: Início */}
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'text-emerald-600 font-black'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : 'opacity-80'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Início</span>
          </button>

          {/* Tab 2: Movimentações */}
          <button
            onClick={() => handleSelectTab('transactions')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'transactions'
                ? 'text-emerald-600 font-black'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ArrowLeftRight className={`w-5 h-5 ${currentTab === 'transactions' ? 'stroke-[2.5]' : 'opacity-80'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Extrato</span>
          </button>

          {/* Tab 3: Central Highlighted Circular Button */}
          <div className="flex items-center justify-center -mt-6">
            <button
              onClick={() => onOpenQuickAdd()}
              className="w-14 h-14 bg-slate-900 active:bg-slate-800 text-white rounded-full border-4 border-[#F1F3F6] flex items-center justify-center shadow-xl shadow-slate-400/30 active:scale-95 transition-transform cursor-pointer"
              title="Nova Movimentação"
            >
              <Plus className="w-6 h-6 stroke-[3] text-emerald-400" />
            </button>
          </div>

          {/* Tab 4: Patrimônio 30k */}
          <button
            onClick={() => handleSelectTab('patrimony')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              currentTab === 'patrimony'
                ? 'text-emerald-600 font-black'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${currentTab === 'patrimony' ? 'stroke-[2.5]' : 'opacity-80'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Meta 30k</span>
          </button>

          {/* Tab 5: Mais */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
              showMoreMenu || ['tiktok', 'boxes', 'ai_advisor', 'income', 'expenses', 'settings'].includes(currentTab)
                ? 'text-purple-600 font-black'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 opacity-80" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
