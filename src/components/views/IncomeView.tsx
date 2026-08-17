import React, { useMemo } from 'react';
import {
  Briefcase,
  Hammer,
  Video,
  Coins,
  TrendingUp,
  Plus,
  ArrowDownRight,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Transaction, FinancialSettings } from '../../types/finance';
import { formatCurrency, formatDateBR } from '../../lib/finance';

interface IncomeViewProps {
  transactions: Transaction[];
  settings: FinancialSettings;
  onOpenQuickAdd: (type?: 'income') => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  transactions,
  settings,
  onOpenQuickAdd,
}) => {
  const incomeTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'income'),
    [transactions]
  );

  // Group by income sources as structured in Felipe's spreadsheet:
  // - Salário FGL Brasil
  // - Contratos / Instalações
  // - TikTok Shop
  // - Outras receitas
  const sourceBreakdown = useMemo(() => {
    const map = {
      'Salário FGL Brasil': 0,
      'Contratos / Instalações': 0,
      'TikTok Shop': 0,
      'Outras receitas': 0,
    };

    incomeTransactions.forEach((t) => {
      const src = t.incomeSource || 'Outras receitas';
      if (src.includes('Salário') || src.includes('FGL')) {
        map['Salário FGL Brasil'] += t.amountInCents;
      } else if (src.includes('Contrato') || src.includes('Instalaç')) {
        map['Contratos / Instalações'] += t.amountInCents;
      } else if (src.includes('TikTok') || t.isTikTokCommission) {
        map['TikTok Shop'] += t.amountInCents;
      } else {
        map['Outras receitas'] += t.amountInCents;
      }
    });

    const total = Object.values(map).reduce((sum, v) => sum + v, 0);

    return {
      sources: [
        {
          name: 'Salário FGL Brasil',
          amountInCents: map['Salário FGL Brasil'],
          percentage: total > 0 ? Math.round((map['Salário FGL Brasil'] / total) * 100) : 0,
          color: '#10b981',
          icon: <Briefcase className="w-5 h-5" />,
          type: 'Renda Fixa Mensal',
        },
        {
          name: 'Contratos / Instalações',
          amountInCents: map['Contratos / Instalações'],
          percentage: total > 0 ? Math.round((map['Contratos / Instalações'] / total) * 100) : 0,
          color: '#06b6d4',
          icon: <Hammer className="w-5 h-5" />,
          type: 'Serviços & Contratos',
        },
        {
          name: 'TikTok Shop',
          amountInCents: map['TikTok Shop'],
          percentage: total > 0 ? Math.round((map['TikTok Shop'] / total) * 100) : 0,
          color: '#8b5cf6',
          icon: <Video className="w-5 h-5" />,
          type: 'Comissões de Afiliado',
        },
        {
          name: 'Outras receitas',
          amountInCents: map['Outras receitas'],
          percentage: total > 0 ? Math.round((map['Outras receitas'] / total) * 100) : 0,
          color: '#f59e0b',
          icon: <Coins className="w-5 h-5" />,
          type: 'Renda Extra & Rendimentos',
        },
      ],
      totalInCents: total,
    };
  }, [incomeTransactions]);

  const chartData = sourceBreakdown.sources
    .filter((s) => s.amountInCents > 0)
    .map((s) => ({
      name: s.name,
      value: s.amountInCents / 100,
      color: s.color,
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Fontes de Renda & Receitas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhe a proporção de cada fonte no total de entradas do mês
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('income')}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Receita</span>
        </button>
      </div>

      {/* Summary Cards per Income Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sourceBreakdown.sources.map((src) => (
          <div
            key={src.name}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: src.color }}
                >
                  {src.icon}
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${src.color}15`,
                    color: src.color,
                  }}
                >
                  {src.percentage}% do total
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {src.name}
              </h3>
              <div className="text-2xl font-extrabold text-slate-900 font-mono-num mt-1">
                {formatCurrency(src.amountInCents)}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
              {src.type}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Chart & Source Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-base text-slate-900">Distribuição das Receitas</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono-num">
              Total: {formatCurrency(sourceBreakdown.totalInCents)}
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhuma receita registrada
              </div>
            )}
          </div>
        </div>

        {/* Recent Income Transactions List */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900">Lançamentos de Receita</h3>
            <span className="text-xs text-slate-500 font-medium">
              {incomeTransactions.length} entradas
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {incomeTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.description}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatDateBR(t.date)}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700">{t.incomeSource || 'Outros'}</span>
                    </div>
                  </div>
                </div>

                <span className="font-bold font-mono-num text-xs sm:text-sm text-emerald-600">
                  +{formatCurrency(t.amountInCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
