import React from 'react';
import { AlertCircle, TrendingUp, Sparkles, CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { FinancialSummary, MonthlyPatrimonyGoal } from '../types/finance';
import { formatCurrency } from '../lib/finance';

interface AlertsBannerProps {
  summary: FinancialSummary;
  currentGoal?: MonthlyPatrimonyGoal;
  onNavigateTab: (tab: string) => void;
}

export const AlertsBanner: React.FC<AlertsBannerProps> = ({
  summary,
  currentGoal,
  onNavigateTab,
}) => {
  const alerts: {
    id: string;
    type: 'success' | 'warning' | 'info' | 'purple';
    icon: React.ReactNode;
    title: string;
    message: string;
    actionTab?: string;
    actionLabel?: string;
  }[] = [];

  // TikTok Reinvestment Box alert
  if (summary.tiktokReinvestBoxBalanceInCents > 0) {
    alerts.push({
      id: 'alert_tt_box',
      type: 'purple',
      icon: <Rocket className="w-4 h-4 text-purple-600 shrink-0" />,
      title: 'Caixa de Reinvestimento TikTok',
      message: `Você possui ${formatCurrency(summary.tiktokReinvestBoxBalanceInCents)} acumulados exclusivamente para ferramentas, amostras ou tráfego.`,
      actionTab: 'tiktok',
      actionLabel: 'Ver TikTok Shop',
    });
  }

  // Patrimony vs Goal alert
  if (currentGoal) {
    const diff = summary.totalPatrimonyInCents - currentGoal.targetInCents;
    if (diff >= 0) {
      alerts.push({
        id: 'alert_goal_ok',
        type: 'success',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        title: 'Dentro da Meta do Mês',
        message: `Seu patrimônio de ${formatCurrency(summary.totalPatrimonyInCents)} está ${formatCurrency(diff)} acima da meta esperada (${formatCurrency(currentGoal.targetInCents)}) para este período!`,
        actionTab: 'patrimony',
        actionLabel: 'Ver Evolução R$30k',
      });
    } else {
      alerts.push({
        id: 'alert_goal_below',
        type: 'warning',
        icon: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />,
        title: 'Atenção à Meta Mensal',
        message: `Seu patrimônio está ${formatCurrency(Math.abs(diff))} abaixo do esperado (${formatCurrency(currentGoal.targetInCents)}) para este mês.`,
        actionTab: 'patrimony',
        actionLabel: 'Ver Metas',
      });
    }
  }

  // Pending Fixed Expenses
  if (summary.fixedExpensesPendingInCents > 0) {
    alerts.push({
      id: 'alert_fixed_pending',
      type: 'info',
      icon: <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />,
      title: 'Despesas Fixas Pendentes',
      message: `Você possui ${formatCurrency(summary.fixedExpensesPendingInCents)} em contas fixas a pagar no mês (incluindo Dízimo e Assinaturas).`,
      actionTab: 'expenses',
      actionLabel: 'Ver Despesas',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
      {alerts.slice(0, 3).map((a) => (
        <div
          key={a.id}
          className={`p-4 rounded-3xl border backdrop-blur-xl shadow-xs flex items-start gap-3.5 transition-all ${
            a.type === 'purple'
              ? 'bg-purple-500/10 border-purple-300/40 text-purple-950'
              : a.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-300/40 text-emerald-950'
              : a.type === 'warning'
              ? 'bg-amber-500/10 border-amber-300/40 text-amber-950'
              : 'bg-blue-500/10 border-blue-300/40 text-blue-950'
          }`}
        >
          <div className="mt-0.5 p-2 rounded-xl bg-white/60 backdrop-blur-md shadow-2xs border border-white">
            {a.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h4 className="text-xs font-black uppercase tracking-wider">{a.title}</h4>
              {a.actionTab && (
                <button
                  onClick={() => onNavigateTab(a.actionTab!)}
                  className="text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {a.actionLabel || 'Ver'} <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">{a.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
