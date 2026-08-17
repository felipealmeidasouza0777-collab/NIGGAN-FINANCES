import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  ArrowLeftRight,
  Check,
  Zap,
  Sparkles,
  Calendar,
  Wallet,
  Tag,
  Video,
} from 'lucide-react';
import { TransactionType, Category, Account } from '../types/finance';
import { db } from '../services/database/storage';
import { formatCurrency, parseCurrencyToCents } from '../lib/finance';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  categories: Category[];
  accounts: Account[];
  onSuccessToast: (msg: string) => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  categories,
  accounts,
  onSuccessToast,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [rawAmount, setRawAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incomeSource, setIncomeSource] = useState<string>('Salário FGL Brasil');
  const [tiktokSalesCount, setTiktokSalesCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setRawAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);

      // Set sensible defaults
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
        if (accounts.length > 1) {
          setToAccountId(accounts[1].id);
        }
      }

      // Default category
      const availableCategories = categories.filter(c => c.type === defaultType || (defaultType === 'transfer'));
      if (availableCategories.length > 0) {
        setCategoryId(availableCategories[0].id);
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultType, categories, accounts]);

  // Update default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const available = categories.filter(c => c.type === newType);
    if (available.length > 0) {
      setCategoryId(available[0].id);
    }
    if (newType === 'income') {
      setIncomeSource('Salário FGL Brasil');
    }
  };

  // Quick amount buttons helper
  const handleQuickAddValue = (valueReais: number) => {
    const currentCents = parseCurrencyToCents(rawAmount);
    const newCents = currentCents + valueReais * 100;
    setRawAmount((newCents / 100).toFixed(2).replace('.', ','));
  };

  const handleSetExactValue = (valueReais: number) => {
    setRawAmount(valueReais.toFixed(2).replace('.', ','));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = parseCurrencyToCents(rawAmount);

    if (amountInCents <= 0) {
      alert('Por favor, informe um valor maior que zero.');
      return;
    }

    if (!accountId) {
      alert('Selecione uma conta.');
      return;
    }

    setIsSubmitting(true);

    const isTikTok = type === 'income' && incomeSource === 'TikTok Shop';
    const finalDesc = description.trim() || (isTikTok ? 'Comissão TikTok Shop' : type === 'expense' ? 'Despesa rápida' : 'Entrada rápida');

    db.addTransaction({
      amountInCents,
      type,
      categoryId: categoryId || categories[0]?.id || 'cat_imprevistos',
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      description: finalDesc,
      date,
      incomeSource: type === 'income' ? incomeSource : undefined,
      isTikTokCommission: isTikTok,
      tiktokSalesCount: isTikTok ? tiktokSalesCount : undefined,
    });

    const typeLabel =
      type === 'expense' ? 'Despesa' : type === 'income' ? 'Receita' : type === 'investment' ? 'Investimento' : 'Transferência';
    onSuccessToast(`${typeLabel} de ${formatCurrency(amountInCents)} registrada!`);

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => {
    if (type === 'transfer') return false;
    return c.type === type;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200/50 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Registro Rápido</h2>
              <p className="text-xs text-slate-400 font-medium">Salve movimentações em poucos segundos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector (4 Types) */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100/70 backdrop-blur-md rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Receita</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('investment')}
              className={`py-2 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'investment'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Investir</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('transfer')}
              className={`py-2 px-2 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'transfer'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transf.</span>
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="bg-white/60 backdrop-blur-md border border-white rounded-[24px] p-5 text-center shadow-2xs focus-within:border-emerald-500/80 focus-within:bg-white/90 transition-all">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
              Valor da movimentação
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl font-black text-slate-400">R$</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                placeholder="0,00"
                className="w-48 text-center text-3xl sm:text-4xl font-black font-mono-num text-slate-900 placeholder:text-slate-300 focus:outline-hidden bg-transparent tracking-tight"
                required
              />
            </div>

            {/* Fast Value Chips (1 click presets) */}
            <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSetExactValue(10)}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                R$ 10
              </button>
              <button
                type="button"
                onClick={() => handleSetExactValue(20)}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                R$ 20
              </button>
              <button
                type="button"
                onClick={() => handleSetExactValue(50)}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                R$ 50
              </button>
              <button
                type="button"
                onClick={() => handleSetExactValue(100)}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                R$ 100
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddValue(50)}
                className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                +50
              </button>
            </div>
          </div>

          {/* Income Source Selector (if Income) */}
          {type === 'income' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Fonte da Receita</span>
                {incomeSource === 'TikTok Shop' && (
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-md font-semibold">
                    Divisão Automática 50/20/30
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Salário FGL Brasil', 'Contratos / Instalações', 'TikTok Shop', 'Outras receitas'].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setIncomeSource(src);
                      const matchingCat = categories.find(c => c.name.toLowerCase().includes(src.toLowerCase().split(' ')[0]));
                      if (matchingCat) setCategoryId(matchingCat.id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all ${
                      incomeSource === src
                        ? src === 'TikTok Shop'
                          ? 'bg-purple-50 border-purple-300 text-purple-800'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>

              {incomeSource === 'TikTok Shop' && (
                <div className="flex items-center gap-2 pt-1">
                  <label className="text-xs text-slate-600 font-medium whitespace-nowrap">
                    Qtd. Vendas:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tiktokSalesCount}
                    onChange={(e) => setTiktokSalesCount(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                  />
                  <span className="text-[11px] text-purple-600 font-medium">
                    +20% irá p/ Caixa Reinvestimento
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Category & Account Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {type !== 'transfer' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Categoria
                </label>
                <select
                  aria-label="Selecionar categoria"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  required
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {type === 'transfer' ? 'Conta de Origem' : 'Conta'}
              </label>
              <select
                aria-label={type === 'transfer' ? 'Selecionar conta de origem' : 'Selecionar conta'}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                required
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatCurrency(a.currentBalanceInCents)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Conta de Destino
                </label>
                <select
                  aria-label="Selecionar conta de destino"
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                  required
                >
                  {accounts.filter(a => a.id !== accountId).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.currentBalanceInCents)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Description & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Descrição (Opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Almoço, Uber, Posto..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
            <span>Salvar Movimentação</span>
          </button>
        </form>
      </div>
    </div>
  );
};
