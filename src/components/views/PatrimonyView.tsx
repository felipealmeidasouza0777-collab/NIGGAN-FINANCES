import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  Sparkles,
  Edit3,
  Check,
  Building,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthlyPatrimonyGoal, Account, FinancialSettings, FinancialSummary } from '../../types/finance';
import { formatCurrency, formatCurrencyCompact, projectFutureScenarios } from '../../lib/finance';
import { db } from '../../services/database/storage';

interface PatrimonyViewProps {
  goals: MonthlyPatrimonyGoal[];
  accounts: Account[];
  summary: FinancialSummary;
  settings: FinancialSettings;
  onSuccessToast: (msg: string) => void;
}

export const PatrimonyView: React.FC<PatrimonyViewProps> = ({
  goals,
  accounts,
  summary,
  settings,
  onSuccessToast,
}) => {
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [inputRealAmount, setInputRealAmount] = useState<string>('');

  // Projections simulator state
  const [simulationMonthlyDeposit, setSimulationMonthlyDeposit] = useState<number>(1000);
  const [simulationMonths, setSimulationMonths] = useState<number>(10);

  const goalTargetCents = settings.globalPatrimonyGoal.targetInCents || 3000000;
  const currentPatrimony = summary.totalPatrimonyInCents;
  const progressPct = Math.min(100, Math.round((currentPatrimony / goalTargetCents) * 100));
  const remainingCents = Math.max(0, goalTargetCents - currentPatrimony);

  // Prepare chart data comparing Meta vs Real
  const chartData = useMemo(() => {
    return goals.map((g) => {
      const isCurrentMonth = g.monthYear === '2026-08';
      const realVal = isCurrentMonth ? currentPatrimony / 100 : g.realInCents > 0 ? g.realInCents / 100 : null;

      return {
        name: g.label,
        Meta: g.targetInCents / 100,
        Real: realVal,
      };
    });
  }, [goals, currentPatrimony]);

  // Projected scenarios (Conservador, Base, Agressivo)
  const scenarios = useMemo(() => {
    return projectFutureScenarios(currentPatrimony, simulationMonthlyDeposit * 100, simulationMonths);
  }, [currentPatrimony, simulationMonthlyDeposit, simulationMonths]);

  const handleSaveReal = (monthYear: string) => {
    const valInCents = Math.round(parseFloat(inputRealAmount.replace(',', '.')) * 100);
    db.updatePatrimonyGoalReal(monthYear, isNaN(valInCents) ? 0 : valInCents);
    setEditingMonth(null);
    onSuccessToast('Valor de patrimônio do mês atualizado!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Evolução do Patrimônio
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Rumo aos R$ 30.000
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Acompanhamento mensal da meta de R$ 30.000 até Maio/2027 (Baseada na planilha de referência)
          </p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Patrimônio Atual (Real)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-emerald-600 tracking-tight">
            {formatCurrency(currentPatrimony)}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Soma de todas as contas cadastradas</p>
        </div>

        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Meta Global (Maio/2027)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-slate-900 tracking-tight">
            {formatCurrency(goalTargetCents)}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Objetivo final estabelecido</p>
        </div>

        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Progresso Atingido
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-blue-600 tracking-tight">
            {progressPct}%
          </div>
          <div className="w-full bg-slate-100/80 h-2.5 rounded-full mt-2 overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-xl rounded-[28px] p-6 border border-white/90 shadow-xs hover:bg-white/90 transition-all">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] block mb-1">
            Falta para a Meta
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-amber-600 tracking-tight">
            {formatCurrency(remainingCents)}
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            ~{formatCurrency(Math.round(remainingCents / 10))} / mês em 10 meses
          </p>
        </div>
      </div>

      {/* Interactive Evolution Chart */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              Gráfico de Evolução: Meta vs Real
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Projeção linear de R$ 3.000/mês até R$ 30.000 em Maio/2027
            </p>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', fontSize: '12px' }}
              />
              <Legend
                formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>}
              />
              <Line
                type="monotone"
                dataKey="Meta"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Real"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 6, fill: '#10b981' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-by-Month Spreadsheet Reference Table (Section 12) */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
              Tabela de Evolução Mensal (Ago/2026 a Mai/2027)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Conforme modelo original da planilha financeira
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Mês</th>
                <th className="py-3 px-4">Meta Estipulada</th>
                <th className="py-3 px-4">Patrimônio Real</th>
                <th className="py-3 px-4">Diferença (Real - Meta)</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {goals.map((g) => {
                const isCurrent = g.monthYear === '2026-08';
                const realCents = isCurrent ? currentPatrimony : g.realInCents;
                const diffCents = realCents > 0 ? realCents - g.targetInCents : 0;
                const isPositiveDiff = diffCents >= 0;

                return (
                  <tr
                    key={g.id}
                    className={`hover:bg-white/90 transition-colors ${
                      isCurrent ? 'bg-emerald-500/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {g.label} {isCurrent && <span className="text-[10px] text-emerald-800 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-lg ml-1.5 font-black">Mês Atual</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-slate-600 font-black">
                      {formatCurrency(g.targetInCents)}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num">
                      {editingMonth === g.monthYear ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={inputRealAmount}
                            onChange={(e) => setInputRealAmount(e.target.value)}
                            placeholder="0,00"
                            className="w-24 p-1 border rounded-md text-xs font-mono-num font-bold"
                          />
                          <button
                            onClick={() => handleSaveReal(g.monthYear)}
                            className="p-1 bg-emerald-600 text-white rounded-md cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-black text-slate-900">
                          {realCents > 0 ? formatCurrency(realCents) : '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num">
                      {realCents > 0 ? (
                        <span
                          className={`font-black ${
                            isPositiveDiff ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPositiveDiff ? '+' : ''}
                          {formatCurrency(diffCents)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => {
                            setEditingMonth(g.monthYear);
                            setInputRealAmount((g.realInCents / 100).toFixed(2));
                          }}
                          className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                          title="Editar valor real"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projections Simulator (Section 13) */}
      <div className="bg-white/75 backdrop-blur-xl rounded-[32px] p-6 sm:p-8 border border-white/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                Simulador de Projeções para Maio/2027
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              "Se eu continuar investindo R$ X por mês, quanto terei em Maio/2027?"
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white text-xs font-bold shadow-2xs">
              <span className="text-slate-500">Aporte mensal:</span>
              <span className="text-slate-900 font-black">R$</span>
              <input
                type="number"
                step="100"
                value={simulationMonthlyDeposit}
                onChange={(e) => setSimulationMonthlyDeposit(parseFloat(e.target.value) || 0)}
                className="w-20 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-900 font-black focus:outline-emerald-500 font-mono-num"
              />
            </div>
          </div>
        </div>

        {/* 3 Scenarios Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conservador */}
          <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-md border border-white flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                1. Cenário Conservador
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Aporte de {formatCurrency(Math.round(simulationMonthlyDeposit * 0.75 * 100))} (75%) a 0,60% a.m.
              </p>
              <div className="text-2xl font-black font-mono-num text-slate-800 mt-3">
                {formatCurrency(scenarios.conservative.finalInCents)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex justify-between">
              <span>Juros compostos:</span>
              <span className="font-black text-emerald-600">
                +{formatCurrency(scenarios.conservative.history.reduce((s, h) => s + h.earnedInterestInCents, 0))}
              </span>
            </div>
          </div>

          {/* Base */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.15em]">
                2. Cenário Base (Planejado)
              </span>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Aporte de {formatCurrency(simulationMonthlyDeposit * 100)} a 0,85% a.m. (100% CDI)
              </p>
              <div className="text-2xl font-black font-mono-num text-emerald-700 mt-3">
                {formatCurrency(scenarios.base.finalInCents)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-800 font-medium flex justify-between">
              <span>Juros compostos:</span>
              <span className="font-black text-emerald-700">
                +{formatCurrency(scenarios.base.history.reduce((s, h) => s + h.earnedInterestInCents, 0))}
              </span>
            </div>
          </div>

          {/* Agressivo */}
          <div className="p-5 rounded-2xl bg-purple-500/10 backdrop-blur-md border border-purple-500/20 flex flex-col justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-black text-purple-800 uppercase tracking-[0.15em]">
                3. Cenário Agressivo (Escala TikTok)
              </span>
              <p className="text-[11px] text-purple-700 font-medium mt-1">
                Aporte de {formatCurrency(Math.round(simulationMonthlyDeposit * 1.5 * 100))} (150%) a 1,05% a.m.
              </p>
              <div className="text-2xl font-black font-mono-num text-purple-700 mt-3">
                {formatCurrency(scenarios.aggressive.finalInCents)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-purple-500/20 text-[11px] text-purple-800 font-medium flex justify-between">
              <span>Juros compostos:</span>
              <span className="font-black text-purple-700">
                +{formatCurrency(scenarios.aggressive.history.reduce((s, h) => s + h.earnedInterestInCents, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
