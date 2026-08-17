import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  ArrowLeftRight,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Plus,
  X,
} from 'lucide-react';
import { Transaction, Category, Account, TransactionType } from '../../types/finance';
import { formatCurrency, formatDateBR } from '../../lib/finance';
import { db } from '../../services/database/storage';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onOpenQuickAdd: (type?: TransactionType) => void;
  onSuccessToast: (msg: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  accounts,
  onOpenQuickAdd,
  onSuccessToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.incomeSource && t.incomeSource.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === 'all' || t.type === selectedType;
      const matchCat = selectedCategory === 'all' || t.categoryId === selectedCategory;
      const matchAcc = selectedAccount === 'all' || t.accountId === selectedAccount;

      return matchSearch && matchType && matchCat && matchAcc;
    });
  }, [transactions, searchTerm, selectedType, selectedCategory, selectedAccount]);

  // Group by day for clean UX as requested: "Ex: 17 AGO -> Saldo do dia: R$ 293,00"
  const groupedByDay = useMemo(() => {
    const map = new Map<string, { transactions: Transaction[]; dayBalanceInCents: number }>();

    filtered.forEach((t) => {
      if (!map.has(t.date)) {
        map.set(t.date, { transactions: [], dayBalanceInCents: 0 });
      }
      const entry = map.get(t.date)!;
      entry.transactions.push(t);

      if (t.type === 'income') entry.dayBalanceInCents += t.amountInCents;
      else if (t.type === 'expense' || t.type === 'investment') entry.dayBalanceInCents -= t.amountInCents;
    });

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Tem certeza que deseja excluir "${desc}"?`)) {
      db.deleteTransaction(id);
      onSuccessToast('Movimentação excluída com sucesso.');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    db.updateTransaction(editingTransaction.id, {
      description: editingTransaction.description,
      amountInCents: editingTransaction.amountInCents,
      date: editingTransaction.date,
      categoryId: editingTransaction.categoryId,
      accountId: editingTransaction.accountId,
    });
    setEditingTransaction(null);
    onSuccessToast('Movimentação atualizada com sucesso.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Extrato de Movimentações
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Histórico completo agrupado por dia com cálculo de saldo diário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-colors"
          >
            - Nova Despesa
          </button>
          <button
            onClick={() => onOpenQuickAdd('income')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
          >
            + Nova Receita
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              aria-label="Filtrar por tipo de movimentação"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="income">Receitas (+)</option>
              <option value="expense">Despesas (-)</option>
              <option value="investment">Investimentos (Aporte)</option>
              <option value="transfer">Transferências</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              aria-label="Filtrar por categoria"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              aria-label="Filtrar por conta"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="all">Todas as Contas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Day List */}
      {groupedByDay.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-1">Nenhuma movimentação encontrada</p>
          <p className="text-xs text-slate-400 mb-4">Tente ajustar os filtros ou adicione uma nova movimentação.</p>
          <button
            onClick={() => onOpenQuickAdd()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            + Registrar Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDay.map(([dayDate, group]) => {
            const isPositiveDay = group.dayBalanceInCents >= 0;
            return (
              <div
                key={dayDate}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Day Header with Daily Balance */}
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      {formatDateBR(dayDate, 'dayMonth')}
                    </span>
                    <span className="text-[11px] text-slate-400">({group.transactions.length} registros)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className="text-slate-500 text-[11px]">Saldo do dia:</span>
                    <span
                      className={`font-mono-num font-bold ${
                        isPositiveDay ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositiveDay ? '+' : ''}
                      {formatCurrency(group.dayBalanceInCents)}
                    </span>
                  </div>
                </div>

                {/* Day Items */}
                <div className="divide-y divide-slate-100">
                  {group.transactions.map((t) => {
                    const category = categories.find((c) => c.id === t.categoryId);
                    const account = accounts.find((a) => a.id === t.accountId);

                    return (
                      <div
                        key={t.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              t.type === 'income'
                                ? 'bg-emerald-100 text-emerald-700'
                                : t.type === 'expense'
                                ? 'bg-rose-100 text-rose-700'
                                : t.type === 'investment'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {t.type === 'income' ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : t.type === 'expense' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : t.type === 'investment' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <ArrowLeftRight className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {t.description}
                              </h4>
                              {t.isTikTokCommission && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">
                                  TikTok Shop
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-medium">{category?.name || 'Geral'}</span>
                              <span>•</span>
                              <span>{account?.name || 'Conta'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold font-mono-num text-xs sm:text-sm ${
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

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingTransaction(t)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id, t.description)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Editar Movimentação</h3>
              <button onClick={() => setEditingTransaction(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição</label>
                <input
                  type="text"
                  value={editingTransaction.description}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={(editingTransaction.amountInCents / 100).toFixed(2)}
                  onChange={(e) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      amountInCents: Math.round(parseFloat(e.target.value || '0') * 100),
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Data</label>
                <input
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, date: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 py-2 text-xs font-bold bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
