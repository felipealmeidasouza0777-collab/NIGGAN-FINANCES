import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Sparkles,
  Calendar,
  CreditCard,
  Wifi,
  Fuel,
  Scissors,
  HeartHandshake,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { RecurringExpense, Transaction, Category, Account, FinancialSettings } from '../../types/finance';
import { formatCurrency, formatDateBR, calculateTitheDue } from '../../lib/finance';
import { db } from '../../services/database/storage';

interface ExpensesViewProps {
  recurringExpenses: RecurringExpense[];
  variableTransactions: Transaction[];
  totalIncomeInCents: number;
  settings: FinancialSettings;
  categories: Category[];
  accounts: Account[];
  onOpenQuickAdd: (type?: 'expense') => void;
  onSuccessToast: (msg: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  recurringExpenses,
  variableTransactions,
  totalIncomeInCents,
  settings,
  categories,
  accounts,
  onOpenQuickAdd,
  onSuccessToast,
}) => {
  const [showAddFixedModal, setShowAddFixedModal] = useState(false);
  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [newFixedDueDay, setNewFixedDueDay] = useState(15);
  const [newFixedCategoryId, setNewFixedCategoryId] = useState('');
  const [newFixedAccountId, setNewFixedAccountId] = useState('');

  // Total calculations
  const totalFixedInCents = recurringExpenses.reduce((sum, r) => sum + r.amountInCents, 0);
  const paidFixedInCents = recurringExpenses.filter((r) => r.isPaid).reduce((sum, r) => sum + r.amountInCents, 0);
  const pendingFixedInCents = totalFixedInCents - paidFixedInCents;
  const fixedProgress = totalFixedInCents > 0 ? Math.round((paidFixedInCents / totalFixedInCents) * 100) : 0;

  const totalVariableInCents = variableTransactions.reduce((sum, t) => sum + t.amountInCents, 0);
  const totalAllExpensesInCents = paidFixedInCents + totalVariableInCents;

  const handleTogglePaid = (expense: RecurringExpense) => {
    const newPaidState = !expense.isPaid;
    db.toggleRecurringExpensePaid(expense.id, newPaidState);
    if (newPaidState) {
      onSuccessToast(`"${expense.name}" marcada como PAGA e lançada no extrato!`);
    } else {
      onSuccessToast(`"${expense.name}" desmarcada.`);
    }
  };

  const handleAddFixedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = Math.round(parseFloat(newFixedAmount.replace(',', '.')) * 100);
    if (amountInCents <= 0 || !newFixedName.trim()) {
      alert('Preencha os campos corretamente.');
      return;
    }

    db.addRecurringExpense({
      name: newFixedName.trim(),
      amountInCents,
      dueDay: newFixedDueDay,
      categoryId: newFixedCategoryId || categories.find((c) => c.type === 'expense')?.id || 'cat_imprevistos',
      accountId: newFixedAccountId || accounts[0]?.id || 'acc_cash',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: false,
    });

    setShowAddFixedModal(false);
    setNewFixedName('');
    setNewFixedAmount('');
    onSuccessToast('Despesa fixa cadastrada com sucesso!');
  };

  const handleDeleteFixed = (id: string, name: string) => {
    if (confirm(`Remover a despesa fixa "${name}"?`)) {
      db.deleteRecurringExpense(id);
      onSuccessToast('Despesa fixa removida.');
    }
  };

  // Get icon for expense
  const getExpenseIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('dízimo') || n.includes('dizimo')) return <HeartHandshake className="w-4 h-4 text-amber-600" />;
    if (n.includes('vivo') || n.includes('internet')) return <Wifi className="w-4 h-4 text-indigo-600" />;
    if (n.includes('combustível') || n.includes('combustivel')) return <Fuel className="w-4 h-4 text-rose-600" />;
    if (n.includes('cartão') || n.includes('cartao')) return <CreditCard className="w-4 h-4 text-pink-600" />;
    if (n.includes('cabelo') || n.includes('barba')) return <Scissors className="w-4 h-4 text-purple-600" />;
    return <ArrowUpRight className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão de Despesas & Contas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Controle de despesas fixas recorrentes e gastos variáveis do dia a dia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFixedModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            + Nova Despesa Fixa
          </button>
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
          >
            + Novo Gasto Variável
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Total Despesas Fixas
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-slate-900 tracking-tight">
            {formatCurrency(totalFixedInCents)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold pt-3 border-t border-slate-100/80">
            <span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{formatCurrency(paidFixedInCents)} pagas</span>
            <span className="text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-lg">{formatCurrency(pendingFixedInCents)} pendentes</span>
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Despesas Variáveis (Mês)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-rose-600 tracking-tight">
            {formatCurrency(totalVariableInCents)}
          </div>
          <p className="mt-3 text-xs text-slate-400 font-medium pt-3 border-t border-slate-100/80">Lazer, presentes, imprevistos, alimentação</p>
        </div>

        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Progresso de Pagamento
            </span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{fixedProgress}%</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-emerald-600 tracking-tight">
            {formatCurrency(paidFixedInCents)}
          </div>
          <div className="w-full bg-slate-100/80 h-2.5 rounded-full mt-3 overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${fixedProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Despesas Fixas (Section 8) */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              Despesas Fixas & Recorrentes
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
              {recurringExpenses.length} contas
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Clique no status para marcar como pago e gerar o lançamento
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recurringExpenses.map((expense) => {
            return (
              <div
                key={expense.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-2xs ${
                  expense.isPaid
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-white/60 backdrop-blur-md border-white hover:bg-white/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
                    {getExpenseIcon(expense.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {expense.name}
                      </h4>
                      {expense.isTithe && (
                        <span className="text-[10px] bg-amber-500/15 text-amber-800 border border-amber-500/20 px-1.5 py-0.2 rounded-md font-black">
                          10% Entradas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                      <span>Vencimento dia {expense.dueDay}</span>
                      <span>•</span>
                      <span>{expense.incomeSource}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black font-mono-num text-xs sm:text-sm text-slate-900">
                      {formatCurrency(expense.amountInCents)}
                    </div>
                  </div>

                  {/* Toggle Paid Button */}
                  <button
                    onClick={() => handleTogglePaid(expense)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      expense.isPaid
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/30'
                    }`}
                  >
                    {expense.isPaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pago</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pendente</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteFixed(expense.id, expense.name)}
                    className="text-slate-300 hover:text-rose-600 p-1"
                    title="Excluir despesa fixa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Despesas Variáveis Lançadas */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Gastos Variáveis do Mês</h3>
            <p className="text-xs text-slate-500">
              Lazer, restaurantes, compras e imprevistos lançados no extrato
            </p>
          </div>
          <span className="text-xs font-bold font-mono-num text-rose-600">
            Total: {formatCurrency(totalVariableInCents)}
          </span>
        </div>

        {variableTransactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Nenhuma despesa variável registrada neste mês.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {variableTransactions.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{t.description}</h4>
                  <span className="text-[11px] text-slate-400">{formatDateBR(t.date)}</span>
                </div>
                <span className="font-bold font-mono-num text-xs text-rose-600">
                  -{formatCurrency(t.amountInCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal to Add New Fixed Expense */}
      {showAddFixedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-3">Nova Despesa Fixa</h3>
            <form onSubmit={handleAddFixedExpense} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Conta</label>
                <input
                  type="text"
                  value={newFixedName}
                  onChange={(e) => setNewFixedName(e.target.value)}
                  placeholder="Ex: Aluguel, Netflix, Academia..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    value={newFixedAmount}
                    onChange={(e) => setNewFixedAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newFixedDueDay}
                    onChange={(e) => setNewFixedDueDay(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFixedModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
