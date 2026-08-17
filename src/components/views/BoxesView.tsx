import React from 'react';
import {
  Banknote,
  TrendingUp,
  Rocket,
  ShieldCheck,
  Target,
  ArrowRightLeft,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { MoneyBox, Transaction } from '../../types/finance';
import { formatCurrency } from '../../lib/finance';

interface BoxesViewProps {
  boxes: MoneyBox[];
  boxTransactions: Transaction[];
  onOpenTransfer: (fromBoxId?: string) => void;
}

export const BoxesView: React.FC<BoxesViewProps> = ({
  boxes,
  boxTransactions,
  onOpenTransfer,
}) => {
  const totalInBoxesInCents = boxes.reduce((sum, b) => sum + b.balanceInCents, 0);

  const getBoxIcon = (type: string) => {
    switch (type) {
      case 'available':
        return <Banknote className="w-5 h-5 text-emerald-600" />;
      case 'investments':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'tiktok_reinvest':
        return <Rocket className="w-5 h-5 text-purple-600" />;
      case 'emergency':
        return <ShieldCheck className="w-5 h-5 text-amber-600" />;
      case 'goals':
        return <Target className="w-5 h-5 text-pink-600" />;
      default:
        return <Layers className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sistema de Caixas Financeiras
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Separação inteligente do dinheiro para evitar misturar gastos cotidianos, investimentos e TikTok
          </p>
        </div>

        <button
          onClick={() => onOpenTransfer()}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span>Transferir entre Caixas</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Regra de Isolamento de Caixas: </span>
          Mover dinheiro de uma caixa para outra (ex: do <em>Disponível</em> para <em>Investimentos</em> ou para <em>Reinvestimento TikTok</em>) nunca altera suas receitas ou despesas no mês. O capital continua sendo seu, apenas separado por objetivo!
        </div>
      </div>

      {/* 5 Big Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {boxes.map((box) => {
          const hasTarget = box.targetInCents && box.targetInCents > 0;
          const targetPct = hasTarget
            ? Math.min(100, Math.round((box.balanceInCents / box.targetInCents!) * 100))
            : 0;

          return (
            <div
              key={box.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs"
                    style={{ backgroundColor: `${box.color}15` }}
                  >
                    {getBoxIcon(box.type)}
                  </div>

                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                    style={{
                      backgroundColor: `${box.color}15`,
                      color: box.color,
                    }}
                  >
                    {box.type === 'available'
                      ? '💰 Livre'
                      : box.type === 'investments'
                      ? '📈 Aportes'
                      : box.type === 'tiktok_reinvest'
                      ? '🚀 TikTok'
                      : box.type === 'emergency'
                      ? '🛡️ Reserva'
                      : '🎯 Metas'}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900">{box.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {box.description}
                </p>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Saldo Acumulado
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono-num text-slate-900">
                    {formatCurrency(box.balanceInCents)}
                  </div>
                </div>

                {hasTarget && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Meta: {formatCurrency(box.targetInCents!)}</span>
                      <span className="font-bold text-slate-800">{targetPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: box.color,
                          width: `${targetPct}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenTransfer(box.id)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  <span>Mover Saldo</span>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transfer History Log */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Histórico de Transferências</h3>
            <p className="text-xs text-slate-500">Registros de alocações entre caixas</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {boxTransactions.length} transferências
          </span>
        </div>

        {boxTransactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Nenhuma transferência entre caixas registrada até o momento.
          </div>
        ) : (
          <div className="space-y-2">
            {boxTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{t.description}</h4>
                    <span className="text-slate-400 text-[11px]">{t.date}</span>
                  </div>
                </div>
                <span className="font-bold font-mono-num text-purple-700">
                  {formatCurrency(t.amountInCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
