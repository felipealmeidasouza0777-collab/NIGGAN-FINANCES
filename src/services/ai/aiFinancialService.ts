import { AppDatabaseState } from '../database/storage';
import {
  computeFinancialSummary,
  computeTikTokMetrics,
  formatCurrency,
  projectFutureScenarios,
} from '../../lib/finance';

export interface AIInsight {
  category: 'patrimony' | 'tiktok' | 'expenses' | 'budget' | 'alert';
  title: string;
  description: string;
  recommendation: string;
  type: 'positive' | 'warning' | 'neutral' | 'urgent';
  metric?: string;
}

export interface AIQuestionAnswer {
  question: string;
  answer: string;
  keyFigures: { label: string; value: string; positive?: boolean }[];
  suggestedAction?: string;
}

class AIFinancialService {
  /**
   * Analyzes live financial state and generates intelligent diagnosis
   */
  public analyzeFinances(state: AppDatabaseState): AIInsight[] {
    const summary = computeFinancialSummary(
      state.accounts,
      state.transactions,
      state.recurringExpenses,
      state.moneyBoxes,
      state.tiktokEntries,
      state.tiktokReinvestExpenses,
      state.settings,
      state.selectedMonthYear
    );

    const tiktokMetrics = computeTikTokMetrics(
      state.tiktokEntries,
      state.tiktokReinvestExpenses,
      state.selectedMonthYear
    );

    const insights: AIInsight[] = [];

    // 1. Patrimony Goal Analysis
    const targetCents = state.settings.globalPatrimonyGoal.targetInCents;
    const currentPatrimony = summary.totalPatrimonyInCents;
    const progress = summary.goalProgressPercentage;

    if (currentPatrimony >= targetCents) {
      insights.push({
        category: 'patrimony',
        title: 'Meta de R$ 30.000 Conquistada!',
        description: `Seu patrimônio total atingiu ${formatCurrency(currentPatrimony)}, ultrapassando os 100% da meta global estipulada para Maio/2027.`,
        recommendation: 'Parabéns! Considere estipular um novo objetivo financeiro para continuar expandindo seu patrimônio.',
        type: 'positive',
        metric: `${progress}%`,
      });
    } else {
      insights.push({
        category: 'patrimony',
        title: 'Progresso Rumo aos R$ 30.000',
        description: `Você já acumulou ${formatCurrency(currentPatrimony)} (${progress}% da meta). Faltam ${formatCurrency(summary.goalRemainingInCents)} até Maio/2027.`,
        recommendation: `Mantendo um aporte médio de cerca de ${formatCurrency(Math.round(summary.goalRemainingInCents / 10))} por mês nos próximos 10 meses, você atinge o objetivo com tranquilidade.`,
        type: 'neutral',
        metric: `${progress}% concluído`,
      });
    }

    // 2. TikTok Shop Revenue Analysis
    if (tiktokMetrics.totalCommissionInCents > 0) {
      insights.push({
        category: 'tiktok',
        title: 'Tração no TikTok Shop',
        description: `Suas comissões somam ${formatCurrency(tiktokMetrics.totalCommissionInCents)} neste mês com ${tiktokMetrics.totalSalesCount} vendas registradas. Média diária de ${formatCurrency(tiktokMetrics.averageDailyCommissionInCents)}.`,
        recommendation: `Você tem ${formatCurrency(tiktokMetrics.reinvestBoxBalanceInCents)} disponíveis na Caixa de Reinvestimento. Use em amostras e anúncios para acelerar o crescimento.`,
        type: 'positive',
        metric: `${formatCurrency(tiktokMetrics.totalCommissionInCents)} gerados`,
      });
    } else {
      insights.push({
        category: 'tiktok',
        title: 'Potencial TikTok Shop Aberto',
        description: 'Nenhuma comissão registrada para o mês selecionado até o momento.',
        recommendation: `Sua meta mensal é de ${formatCurrency(state.settings.tiktokConfig.monthlyRevenueTargetInCents)} e ${state.settings.tiktokConfig.monthlyVideosTarget} vídeos. Publique vídeos diários focando nos produtos com maior taxa de conversão.`,
        type: 'neutral',
        metric: `Meta: ${formatCurrency(state.settings.tiktokConfig.monthlyRevenueTargetInCents)}`,
      });
    }

    // 3. Fixed vs Variable Expenses
    const pendingFixed = summary.fixedExpensesPendingInCents;
    if (pendingFixed > 0) {
      insights.push({
        category: 'expenses',
        title: 'Contas Fixas a Vencer',
        description: `Existem ${formatCurrency(pendingFixed)} em despesas fixas pendentes de pagamento no mês atual (incluindo Dízimo e Assinaturas).`,
        recommendation: 'Verifique a aba de Despesas para dar baixa nas contas pagas e manter o fluxo de caixa 100% atualizado.',
        type: 'warning',
        metric: `${formatCurrency(pendingFixed)} pendente`,
      });
    }

    // 4. Reinvestment Box Status
    const ttBox = state.moneyBoxes.find(b => b.type === 'tiktok_reinvest');
    if (ttBox && ttBox.balanceInCents > 0) {
      insights.push({
        category: 'budget',
        title: 'Caixa TikTok Disponível',
        description: `Você possui ${formatCurrency(ttBox.balanceInCents)} acumulados exclusivamente para reinvestir na sua operação digital.`,
        recommendation: 'Adquira novas amostras de produtos vencedores ou invista em ferramentas profissionais de edição.',
        type: 'positive',
        metric: formatCurrency(ttBox.balanceInCents),
      });
    }

    return insights;
  }

  /**
   * Generates a conversational AI executive summary of user finances
   */
  public generateFinancialSummary(state: AppDatabaseState): string {
    const summary = computeFinancialSummary(
      state.accounts,
      state.transactions,
      state.recurringExpenses,
      state.moneyBoxes,
      state.tiktokEntries,
      state.tiktokReinvestExpenses,
      state.settings,
      state.selectedMonthYear
    );

    const netStatus = summary.netMonthBalanceInCents >= 0 ? 'superávit' : 'déficit';

    return `Olá ${state.settings.userName}! Seu patrimônio atual é de ${formatCurrency(summary.totalPatrimonyInCents)}, representando ${summary.goalProgressPercentage}% da meta de ${state.settings.globalPatrimonyGoal.title}. No mês atual, suas entradas somam ${formatCurrency(summary.totalIncomeInCents)}, com despesas totais de ${formatCurrency(summary.totalExpensesInCents)} e investimentos de ${formatCurrency(summary.totalInvestedInCents)}, gerando um ${netStatus} de ${formatCurrency(Math.abs(summary.netMonthBalanceInCents))}.`;
  }

  /**
   * Evaluates questions asked by the user in natural language with strict mathematical accuracy
   */
  public answerFinancialQuestion(question: string, state: AppDatabaseState): AIQuestionAnswer {
    const q = question.toLowerCase();
    const summary = computeFinancialSummary(
      state.accounts,
      state.transactions,
      state.recurringExpenses,
      state.moneyBoxes,
      state.tiktokEntries,
      state.tiktokReinvestExpenses,
      state.settings,
      state.selectedMonthYear
    );

    const tiktokMetrics = computeTikTokMetrics(
      state.tiktokEntries,
      state.tiktokReinvestExpenses,
      state.selectedMonthYear
    );

    // Question: "Quanto posso gastar essa semana?" / "Quanto posso gastar?"
    if (q.includes('posso gastar') || q.includes('gastar') || q.includes('orçamento') || q.includes('semana')) {
      const available = summary.currentAvailableInCents;
      const pendingExpenses = summary.fixedExpensesPendingInCents;
      const safeRemaining = Math.max(0, available - pendingExpenses);
      const safeWeekly = Math.round(safeRemaining / 4);

      return {
        question,
        answer: `Considerando seu saldo em contas correntes/dinheiro (${formatCurrency(available)}) e descontando as contas fixas pendentes (${formatCurrency(pendingExpenses)}), você tem uma margem livre de ${formatCurrency(safeRemaining)}. Dividindo pelas 4 semanas do mês, o limite seguro para gastos discricionários é de aproximadamente ${formatCurrency(safeWeekly)} por semana.`,
        keyFigures: [
          { label: 'Saldo Disponível', value: formatCurrency(available) },
          { label: 'Fixas Pendentes', value: formatCurrency(pendingExpenses) },
          { label: 'Limite Semanal Seguro', value: formatCurrency(safeWeekly), positive: true },
        ],
        suggestedAction: 'Registrar despesas variáveis no modal rápido sempre que fizer uma compra.',
      };
    }

    // Question: "Quanto falta para os R$30 mil?" / "Meta" / "Patrimônio"
    if (q.includes('30') || q.includes('meta') || q.includes('falta') || q.includes('patrimônio') || q.includes('patrimonio')) {
      const current = summary.totalPatrimonyInCents;
      const target = state.settings.globalPatrimonyGoal.targetInCents;
      const remaining = summary.goalRemainingInCents;
      const progress = summary.goalProgressPercentage;
      const monthlyNeeded = Math.round(remaining / 10); // 10 months

      return {
        question,
        answer: `Seu patrimônio total contabilizado é de ${formatCurrency(current)}, atingindo ${progress}% da sua meta de ${formatCurrency(target)} para Maio/2027. Faltam exatamente ${formatCurrency(remaining)}. Para atingir a meta no prazo de 10 meses, seu aporte médio necessário é de ${formatCurrency(monthlyNeeded)} por mês.`,
        keyFigures: [
          { label: 'Patrimônio Atual', value: formatCurrency(current), positive: true },
          { label: 'Meta Global', value: formatCurrency(target) },
          { label: 'Aporte Mensal Alvo', value: formatCurrency(monthlyNeeded) },
        ],
        suggestedAction: 'Acompanhar a evolução mês a mês na aba "Patrimônio".',
      };
    }

    // Question: "Quanto o TikTok gerou?" / "TikTok Shop"
    if (q.includes('tiktok') || q.includes('comissão') || q.includes('comissao') || q.includes('vendas')) {
      const monthComm = tiktokMetrics.totalCommissionInCents;
      const allTime = tiktokMetrics.allTimeCommissionInCents;
      const reinvestBox = tiktokMetrics.reinvestBoxBalanceInCents;
      const cfg = state.settings.tiktokConfig;

      return {
        question,
        answer: `O TikTok Shop gerou ${formatCurrency(monthComm)} em comissões no mês selecionado (${tiktokMetrics.totalSalesCount} vendas) e ${formatCurrency(allTime)} no histórico acumulado. Pela sua regra de distribuição (${cfg.investmentPercentage}% Invest / ${cfg.reinvestmentPercentage}% Reinvest / ${cfg.personalPercentage}% Pessoal), você tem atualmente ${formatCurrency(reinvestBox)} reservados na Caixa de Reinvestimento.`,
        keyFigures: [
          { label: 'Comissão do Mês', value: formatCurrency(monthComm), positive: true },
          { label: 'Total de Vendas', value: `${tiktokMetrics.totalSalesCount}` },
          { label: 'Caixa Reinvestimento', value: formatCurrency(reinvestBox), positive: true },
        ],
        suggestedAction: 'Ver a aba "TikTok Shop" para métricas detalhadas e controle de amostras.',
      };
    }

    // Question: "Quanto posso investir este mês?"
    if (q.includes('investir') || q.includes('aporte') || q.includes('investimento')) {
      const totalIncome = summary.totalIncomeInCents;
      const fixedExpenses = summary.totalExpensesInCents;
      const surplus = Math.max(0, totalIncome - fixedExpenses);
      const recommendedAport = Math.round(surplus * 0.7);

      return {
        question,
        answer: `Com suas receitas de ${formatCurrency(totalIncome)} e despesas totais de ${formatCurrency(fixedExpenses)}, seu saldo de sobra antes de aportes é de ${formatCurrency(surplus)}. Recomendamos destinar ${formatCurrency(recommendedAport)} (70% da sobra) para seus investimentos em CDB/Reserva no C6/XP.`,
        keyFigures: [
          { label: 'Receitas Totais', value: formatCurrency(totalIncome), positive: true },
          { label: 'Despesas Realizadas', value: formatCurrency(fixedExpenses) },
          { label: 'Aporte Recomendado', value: formatCurrency(recommendedAport), positive: true },
        ],
        suggestedAction: 'Transferir o valor para a Caixa de Investimentos no app.',
      };
    }

    // Question: "Estou gastando demais?" / "Como estão meus gastos?"
    if (q.includes('gastando') || q.includes('demais') || q.includes('gastos') || q.includes('despesas')) {
      const totalExp = summary.totalExpensesInCents;
      const totalInc = summary.totalIncomeInCents;
      const expenseRatio = totalInc > 0 ? Math.round((totalExp / totalInc) * 100) : 0;
      const isHealthy = expenseRatio <= 65;

      return {
        question,
        answer: `Suas despesas totais representam ${expenseRatio}% da sua renda deste mês. ${isHealthy ? 'Sua taxa de consumo está saudável (abaixo de 65%), garantindo boa capacidade de poupança e reinvestimento.' : 'Atenção: seus gastos estão consumindo uma fatia alta das receitas. Monitore despesas variáveis como Lazer e Compras.'}`,
        keyFigures: [
          { label: 'Total Gasto', value: formatCurrency(totalExp) },
          { label: 'Comprometimento da Renda', value: `${expenseRatio}%`, positive: isHealthy },
          { label: 'Sobra Líquida', value: formatCurrency(summary.netMonthBalanceInCents), positive: summary.netMonthBalanceInCents >= 0 },
        ],
        suggestedAction: 'Revisar despesas na aba "Despesas".',
      };
    }

    // Default general answer
    return {
      question,
      answer: `Com base nos seus dados financeiros atuais: Seu patrimônio é de ${formatCurrency(summary.totalPatrimonyInCents)} (${summary.goalProgressPercentage}% rumo a R$30.000). Suas entradas neste mês somam ${formatCurrency(summary.totalIncomeInCents)}, despesas de ${formatCurrency(summary.totalExpensesInCents)} e você possui ${formatCurrency(tiktokMetrics.reinvestBoxBalanceInCents)} disponíveis na Caixa do TikTok.`,
      keyFigures: [
        { label: 'Patrimônio', value: formatCurrency(summary.totalPatrimonyInCents), positive: true },
        { label: 'Entradas Mês', value: formatCurrency(summary.totalIncomeInCents) },
        { label: 'Progresso Meta', value: `${summary.goalProgressPercentage}%` },
      ],
      suggestedAction: 'Explore as abas do menu para navegar entre Dashboard, TikTok Shop, Despesas e Metas.',
    };
  }

  private localFallbackAnswer(
    question: string,
    summary: any,
    transactions: any[],
    tiktokEntries: any[],
    settings: any
  ): string {
    const res = this.answerFinancialQuestion(question, {
      settings,
      accounts: [],
      categories: [],
      transactions,
      recurringExpenses: [],
      moneyBoxes: [],
      tiktokEntries,
      tiktokReinvestExpenses: [],
      monthlyGoals: [],
      selectedMonthYear: '2026-08',
    });
    return res.answer;
  }

  /**
   * Asks the real Gemini-powered backend (server.ts / POST /api/ai/ask).
   * Falls back to the local rule-based engine if the server is offline,
   * not configured with a GEMINI_API_KEY, or returns an error — so the
   * advisor tab always answers something, online or not.
   */
  public async askFinancialAdvisor(
    question: string,
    summary: any,
    transactions: any[],
    tiktokEntries: any[],
    settings: any
  ): Promise<{ answer: string; source: 'gemini' | 'local' }> {
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: { summary, tiktokEntries, settings, recentTransactions: transactions.slice(0, 20) },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { answer: data.answer, source: 'gemini' };
      }
    } catch (err) {
      // Server not running / network unavailable — fall through to local mode
      console.warn('[aiFinancialService] Backend de IA indisponível, usando modo local.', err);
    }

    return {
      answer: this.localFallbackAnswer(question, summary, transactions, tiktokEntries, settings),
      source: 'local',
    };
  }
}

export const aiFinancialService = new AIFinancialService();
