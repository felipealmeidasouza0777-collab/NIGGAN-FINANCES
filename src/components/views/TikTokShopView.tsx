import React, { useState, useMemo } from 'react';
import {
  Video,
  Rocket,
  TrendingUp,
  ShoppingBag,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Flame,
  Award,
  Sliders,
  DollarSign,
  Package,
  Wrench,
  Check,
} from 'lucide-react';
import {
  TikTokEntry,
  TikTokReinvestmentExpense,
  FinancialSettings,
} from '../../types/finance';
import {
  formatCurrency,
  formatDateBR,
  computeTikTokMetrics,
  calculateTikTokAllocation,
} from '../../lib/finance';
import { db } from '../../services/database/storage';

interface TikTokShopViewProps {
  entries: TikTokEntry[];
  reinvestExpenses: TikTokReinvestmentExpense[];
  settings: FinancialSettings;
  onSuccessToast: (msg: string) => void;
}

export const TikTokShopView: React.FC<TikTokShopViewProps> = ({
  entries,
  reinvestExpenses,
  settings,
  onSuccessToast,
}) => {
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showAddReinvestExpenseModal, setShowAddReinvestExpenseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // New Commission Form state
  const [commissionAmount, setCommissionAmount] = useState('');
  const [salesCount, setSalesCount] = useState(1);
  const [videosCount, setVideosCount] = useState(5);
  const [productName, setProductName] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryNotes, setEntryNotes] = useState('');

  // Reinvestment Expense Form state
  const [reinvestExpenseDesc, setReinvestExpenseDesc] = useState('');
  const [reinvestExpenseAmount, setReinvestExpenseAmount] = useState('');
  const [reinvestExpenseCategory, setReinvestExpenseCategory] = useState<
    'ferramentas' | 'amostras' | 'trafego' | 'equipamentos' | 'outros'
  >('ferramentas');

  // Allocation Percentages state
  const [invPct, setInvPct] = useState(settings.tiktokConfig.investmentPercentage || 50);
  const [reinvPct, setReinvPct] = useState(settings.tiktokConfig.reinvestmentPercentage || 20);
  const [personalPct, setPersonalPct] = useState(settings.tiktokConfig.personalPercentage || 30);

  // Interactive Live Calculator
  const [calcInput, setCalcInput] = useState<string>('1500');

  const metrics = useMemo(
    () => computeTikTokMetrics(entries, reinvestExpenses, '2026-08'),
    [entries, reinvestExpenses]
  );

  const calculatedAllocation = useMemo(() => {
    const valCents = Math.round(parseFloat(calcInput || '0') * 100);
    return calculateTikTokAllocation(valCents, {
      investmentPercentage: invPct,
      reinvestmentPercentage: reinvPct,
      personalPercentage: personalPct,
    });
  }, [calcInput, invPct, reinvPct, personalPct]);

  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    const commCents = Math.round(parseFloat(commissionAmount.replace(',', '.')) * 100);
    if (commCents <= 0) {
      alert('Informe o valor da comissão.');
      return;
    }

    const alloc = calculateTikTokAllocation(commCents, {
      investmentPercentage: invPct,
      reinvestmentPercentage: reinvPct,
      personalPercentage: personalPct,
    });

    db.addTikTokEntry({
      date: entryDate,
      grossRevenueInCents: commCents * 5, // ~20% avg commission
      commissionInCents: commCents,
      salesCount: salesCount || 1,
      videosPosted: videosCount || 0,
      productName: productName.trim() || undefined,
      investmentAmountInCents: alloc.investInCents,
      reinvestmentAmountInCents: alloc.reinvestInCents,
      personalAmountInCents: alloc.personalInCents,
      notes: entryNotes.trim() || undefined,
    });

    setShowAddEntryModal(false);
    setCommissionAmount('');
    setProductName('');
    onSuccessToast(`Comissão de ${formatCurrency(commCents)} registrada no TikTok Shop!`);
  };

  const handleSaveReinvestExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expCents = Math.round(parseFloat(reinvestExpenseAmount.replace(',', '.')) * 100);
    if (expCents <= 0 || !reinvestExpenseDesc.trim()) {
      alert('Preencha os dados do gasto de reinvestimento.');
      return;
    }

    if (expCents > metrics.reinvestBoxBalanceInCents) {
      alert(`Saldo insuficiente na Caixa de Reinvestimento (${formatCurrency(metrics.reinvestBoxBalanceInCents)}).`);
      return;
    }

    db.addTikTokReinvestmentExpense({
      date: new Date().toISOString().split('T')[0],
      description: reinvestExpenseDesc.trim(),
      amountInCents: expCents,
      category: reinvestExpenseCategory,
    });

    setShowAddReinvestExpenseModal(false);
    setReinvestExpenseDesc('');
    setReinvestExpenseAmount('');
    onSuccessToast(`Gasto de ${formatCurrency(expCents)} debitado da Caixa de Reinvestimento TikTok!`);
  };

  const handleSaveAllocationConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (invPct + reinvPct + personalPct !== 100) {
      alert('A soma das porcentagens deve ser exatamente 100%!');
      return;
    }

    db.updateSettings({
      tiktokConfig: {
        ...settings.tiktokConfig,
        investmentPercentage: invPct,
        reinvestmentPercentage: reinvPct,
        personalPercentage: personalPct,
      },
    });

    setShowSettingsModal(false);
    onSuccessToast('Regras de divisão de comissão atualizadas!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                TikTok Shop — Central de Afiliado
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                Divisão 50/20/30
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Acompanhamento de vendas, escala de comissões e gestão da Caixa de Reinvestimento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configurar %</span>
          </button>
          <button
            onClick={() => setShowAddEntryModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Comissão</span>
          </button>
        </div>
      </div>

      {/* 8 Primary TikTok Metric Cards (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Comissão do Mês */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Comissão do Mês
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-purple-700 tracking-tight">
            {formatCurrency(metrics.totalCommissionInCents)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Mês atual (Agosto/26)</span>
        </div>

        {/* 2. Comissão Acumulada */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Comissão Acumulada
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-slate-900 tracking-tight">
            {formatCurrency(metrics.allTimeCommissionInCents)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Histórico total</span>
        </div>

        {/* 3. Vendas Realizadas */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Quantidade de Vendas
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-slate-900 tracking-tight">
            {metrics.totalSalesCount}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Pedidos de afiliados</span>
        </div>

        {/* 4. Média Diária */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Média Diária
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-emerald-600 tracking-tight">
            {formatCurrency(metrics.averageDailyCommissionInCents)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Por dia com vendas</span>
        </div>

        {/* 5. Média Semanal */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Média Semanal
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-slate-900 tracking-tight">
            {formatCurrency(metrics.averageWeeklyCommissionInCents)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Projeção a cada 7 dias</span>
        </div>

        {/* 6. Melhor Dia */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Melhor Dia
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-amber-600 tracking-tight">
            {metrics.bestDay ? formatCurrency(metrics.bestDay.amountInCents) : '—'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {metrics.bestDay ? formatDateBR(metrics.bestDay.date, 'dayMonth') : 'Sem registros'}
          </span>
        </div>

        {/* 7. Meta Mensal */}
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-5 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Meta Mensal
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-blue-600 tracking-tight">
            {formatCurrency(settings.tiktokConfig.monthlyRevenueTargetInCents)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Alvo de faturamento</span>
        </div>

        {/* 8. Caixa de Reinvestimento */}
        <div className="bg-slate-900/90 text-white backdrop-blur-xl rounded-[28px] p-5 border border-white/10 shadow-lg relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.15em] block mb-1">
            Caixa Reinvestimento
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono-num text-emerald-400 tracking-tight">
            {formatCurrency(metrics.reinvestBoxBalanceInCents)}
          </div>
          <span className="text-[11px] text-purple-200/80 font-medium mt-1 block">Disponível para crescer</span>
        </div>
      </div>

      {/* Caixa de Reinvestimento Detail Card */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-700 flex items-center justify-center border border-purple-500/20 shadow-2xs">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Caixa de Reinvestimento TikTok (Regra 20%)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                O saldo acumula mês a mês para ferramentas (ex: CapCut Pro), amostras e anúncios
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddReinvestExpenseModal(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 border border-slate-700/60 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>- Registrar Gasto da Caixa</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Total Destinado (20%)</span>
            <span className="text-lg sm:text-xl font-black font-mono-num text-slate-900">
              {formatCurrency(metrics.totalReinvestAllocatedInCents)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">Total Gasto com Operação</span>
            <span className="text-lg sm:text-xl font-black font-mono-num text-rose-600">
              {formatCurrency(metrics.totalReinvestSpentInCents)}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20">
            <span className="text-[10px] text-emerald-800 uppercase font-black tracking-wider block mb-1">Saldo Atual em Caixa</span>
            <span className="text-lg sm:text-xl font-black font-mono-num text-emerald-700">
              {formatCurrency(metrics.reinvestBoxBalanceInCents)}
            </span>
          </div>
        </div>

        {/* Expenses from Reinvestment Box */}
        {reinvestExpenses.length > 0 && (
          <div className="pt-2 space-y-2.5">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Gastos com Ferramentas / Amostras Registrados:
            </h4>
            <div className="space-y-2">
              {reinvestExpenses.map((exp) => (
                <div key={exp.id} className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white flex items-center justify-between text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-slate-800">{exp.description}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                      {exp.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono-num">
                    <span className="text-slate-400 text-[11px]">{formatDateBR(exp.date)}</span>
                    <span className="font-black text-rose-600">-{formatCurrency(exp.amountInCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Commission Split Calculator (Section 10) */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              Calculadora de Distribuição da Comissão
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Veja a divisão automática em tempo real: {invPct}% Investimentos / {reinvPct}% Reinvestimento / {personalPct}% Pessoal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 max-w-sm bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider pl-2">Comissão R$</span>
          <input
            type="number"
            value={calcInput}
            onChange={(e) => setCalcInput(e.target.value)}
            className="w-32 p-2 bg-white rounded-xl text-sm font-black font-mono-num text-slate-900 border border-slate-200/60 focus:outline-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-blue-500/10 backdrop-blur-md border border-blue-500/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 block">
              Investimentos ({invPct}%)
            </span>
            <div className="text-xl font-black font-mono-num text-blue-700 mt-1">
              {formatCurrency(calculatedAllocation.investInCents)}
            </div>
            <p className="text-[11px] text-blue-600/90 font-medium mt-1">Vai direto p/ Caixa de Investimentos</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/10 backdrop-blur-md border border-purple-500/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 block">
              Reinvestimento TikTok ({reinvPct}%)
            </span>
            <div className="text-xl font-black font-mono-num text-purple-700 mt-1">
              {formatCurrency(calculatedAllocation.reinvestInCents)}
            </div>
            <p className="text-[11px] text-purple-600/90 font-medium mt-1">Fica guardado no Caixa TikTok</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              Uso Pessoal ({personalPct}%)
            </span>
            <div className="text-xl font-black font-mono-num text-emerald-700 mt-1">
              {formatCurrency(calculatedAllocation.personalInCents)}
            </div>
            <p className="text-[11px] text-emerald-600/90 font-medium mt-1">Saldo livre para gastar</p>
          </div>
        </div>
      </div>

      {/* Sales History Log */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900">Histórico de Comissões TikTok</h3>
          <span className="text-xs font-bold text-slate-500">{entries.length} lançamentos</span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Nenhuma comissão cadastrada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {entry.productName || 'Comissão TikTok'} ({entry.salesCount} vendas)
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatDateBR(entry.date)}</span>
                      <span>•</span>
                      <span>{entry.videosPosted || 0} vídeos postados</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono-num text-sm text-purple-700 block">
                    +{formatCurrency(entry.commissionInCents)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Inv: {formatCurrency(entry.investmentAmountInCents)} | Reinv: {formatCurrency(entry.reinvestmentAmountInCents)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New TikTok Commission */}
      {showAddEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-3">Registrar Comissão TikTok</h3>
            <form onSubmit={handleSaveCommission} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valor da Comissão (R$)</label>
                <input
                  type="text"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono-num font-bold text-purple-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Qtd. de Vendas</label>
                  <input
                    type="number"
                    min="1"
                    value={salesCount}
                    onChange={(e) => setSalesCount(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vídeos Postados</label>
                  <input
                    type="number"
                    min="0"
                    value={videosCount}
                    onChange={(e) => setVideosCount(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Produto Campeão (Opcional)</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Mini Seladora, Fone Sem Fio..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Data</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-purple-600 text-white rounded-xl"
                >
                  Salvar Comissão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Spend from Reinvestment Box */}
      {showAddReinvestExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Gasto da Caixa de Reinvestimento</h3>
            <p className="text-xs text-slate-500 mb-3">
              Saldo disponível: <strong>{formatCurrency(metrics.reinvestBoxBalanceInCents)}</strong>
            </p>
            <form onSubmit={handleSaveReinvestExpense} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição</label>
                <input
                  type="text"
                  value={reinvestExpenseDesc}
                  onChange={(e) => setReinvestExpenseDesc(e.target.value)}
                  placeholder="Ex: CapCut Pro, Amostra 3x Seladora..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    value={reinvestExpenseAmount}
                    onChange={(e) => setReinvestExpenseAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    aria-label="Selecionar categoria de reinvestimento"
                    value={reinvestExpenseCategory}
                    onChange={(e: any) => setReinvestExpenseCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="ferramentas">Ferramentas / Apps</option>
                    <option value="amostras">Amostras de Produtos</option>
                    <option value="trafego">Tráfego / Ads</option>
                    <option value="equipamentos">Equipamentos / Iluminação</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddReinvestExpenseModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl"
                >
                  Debitar da Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Percentage Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Configurar Divisão de Comissão</h3>
            <p className="text-xs text-slate-500 mb-3">A soma deve ser exatamente 100%</p>
            <form onSubmit={handleSaveAllocationConfig} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  % Investimentos (Construção de Patrimônio)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invPct}
                  onChange={(e) => setInvPct(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  % Reinvestimento no TikTok (Caixa de Reinvestimento)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reinvPct}
                  onChange={(e) => setReinvPct(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  % Uso Pessoal (Gasto Livre)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={personalPct}
                  onChange={(e) => setPersonalPct(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="text-xs font-bold text-right pt-1">
                Soma: <span className={invPct + reinvPct + personalPct === 100 ? 'text-emerald-600' : 'text-rose-600'}>
                  {invPct + reinvPct + personalPct}%
                </span>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-purple-600 text-white rounded-xl"
                >
                  Salvar Porcentagens
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
