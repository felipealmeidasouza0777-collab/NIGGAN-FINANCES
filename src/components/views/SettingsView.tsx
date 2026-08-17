import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Percent,
  Target,
  CreditCard,
  Layers,
  ShieldAlert,
  Code,
  FileSpreadsheet,
} from 'lucide-react';
import {
  FinancialSettings,
  Account,
  Category,
  MoneyBox,
  Transaction,
  MonthlyPatrimonyGoal,
} from '../../types/finance';
import { db } from '../../services/database/storage';
import { SUPABASE_SCHEMA_SQL } from '../../services/database/schemaSql';
import { formatCurrency } from '../../lib/finance';

interface SettingsViewProps {
  settings: FinancialSettings;
  accounts: Account[];
  categories: Category[];
  boxes: MoneyBox[];
  transactions: Transaction[];
  goals: MonthlyPatrimonyGoal[];
  onSuccessToast: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  accounts,
  categories,
  boxes,
  transactions,
  goals,
  onSuccessToast,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);

  // Settings form states
  const [tithePct, setTithePct] = useState(settings.tithePercentage || 10);
  const [targetGoalAmount, setTargetGoalAmount] = useState(
    ((settings.globalPatrimonyGoal?.targetInCents || 3000000) / 100).toString()
  );
  const [targetDate, setTargetDate] = useState(
    settings.globalPatrimonyGoal?.targetDate || '2027-05'
  );

  // Account editing modal/state
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountType, setNewAccountType] = useState<Account['type']>('checking');

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCents = Math.round(parseFloat(targetGoalAmount.replace(',', '.')) * 100);

    db.updateSettings({
      tithePercentage: tithePct,
      globalPatrimonyGoal: {
        targetInCents: targetCents || 3000000,
        targetDate: targetDate,
        title: 'Meta de Patrimônio R$ 30.000',
      },
    });

    onSuccessToast('Configurações salvas com sucesso!');
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balCents = Math.round(parseFloat(newAccountBalance.replace(',', '.')) * 100);
    if (!newAccountName.trim()) return;

    db.addAccount({
      name: newAccountName.trim(),
      type: newAccountType,
      initialBalanceInCents: balCents || 0,
      color: '#10b981',
      iconName: 'CreditCard',
      institution: newAccountName.trim(),
    });

    setNewAccountName('');
    setNewAccountBalance('');
    onSuccessToast(`Conta "${newAccountName}" adicionada com sucesso!`);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onSuccessToast('SQL do Supabase copiado para a área de transferência!');
  };

  const handleExportJson = () => {
    const data = {
      settings,
      accounts,
      categories,
      boxes,
      transactions,
      goals,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `niggan_finances_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onSuccessToast('Backup exportado com sucesso!');
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Data', 'Tipo', 'Descrição', 'Valor (R$)', 'Fonte/Origem', 'Categoria', 'Conta'];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || '';
      const acc = accounts.find((a) => a.id === t.accountId)?.name || '';
      return [
        t.id,
        t.date,
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        (t.amountInCents / 100).toFixed(2),
        `"${(t.incomeSource || '').replace(/"/g, '""')}"`,
        `"${cat}"`,
        `"${acc}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `niggan_finances_extrato_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onSuccessToast('Extrato CSV gerado com sucesso!');
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar os dados para a planilha original de Felipe? Isso substituirá as edições não salvas em backup.'
      )
    ) {
      db.resetToSpreadsheetDefaults();
      onSuccessToast('Dados restaurados com base na planilha original!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Configurações & Integração
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Regras de negócio, contas bancárias, backup de dados e preparação para Supabase
          </p>
        </div>
      </div>

      {/* Grid: Regras Gerais & Contas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regras Gerais Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Regras Financeiras & Metas
            </h3>
          </div>

          <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Porcentagem de Dízimo Automático (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={tithePct}
                onChange={(e) => setTithePct(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Calcula o dízimo pendente sobre todas as receitas cadastradas no mês.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Meta de Patrimônio (R$)
                </label>
                <input
                  type="text"
                  value={targetGoalAmount}
                  onChange={(e) => setTargetGoalAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Data Limite da Meta
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Gerenciamento de Contas */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                Contas Bancárias & Carteiras
              </h3>
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    <span className="font-bold text-slate-800">{acc.name}</span>
                    <span className="text-[10px] text-slate-400">({acc.type})</span>
                  </div>
                  <span className="font-bold font-mono-num text-slate-900">
                    {formatCurrency(acc.currentBalanceInCents)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Account */}
          <form onSubmit={handleAddAccount} className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              + Adicionar Nova Conta
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nome (ex: Nubank)"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
              <input
                type="text"
                placeholder="Saldo inicial R$"
                value={newAccountBalance}
                onChange={(e) => setNewAccountBalance(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono-num"
                required
              />
              <button
                type="submit"
                className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backup & Export Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-slate-700" />
          <h3 className="font-extrabold text-base text-slate-900">
            Exportação, Backup e Restauração
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExportJson}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Exportar Extrato (CSV)</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="p-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-800 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-rose-600" />
            <span>Restaurar Dados da Planilha</span>
          </button>
        </div>
      </div>

      {/* Supabase Architecture / Schema SQL Viewer */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Arquitetura Supabase / PostgreSQL
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                  Pronto para Produção
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Schema DDL com tabelas normalizadas, inteiros em centavos, RLS e índices otimizados
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Copiado!' : 'Copiar SQL do Supabase'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono max-h-60 overflow-y-auto text-emerald-400/90 leading-relaxed">
          <pre>{SUPABASE_SCHEMA_SQL}</pre>
        </div>

        <p className="text-[11px] text-slate-400">
          💡 Para migrar para a nuvem, basta abrir o SQL Editor no painel do seu projeto no Supabase e colar o script acima. O frontend está totalmente desacoplado através de <code>src/services/database/storage.ts</code>.
        </p>
      </div>
    </div>
  );
};
