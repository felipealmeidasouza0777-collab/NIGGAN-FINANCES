import {
  Transaction,
  RecurringExpense,
  Account,
  MoneyBox,
  TikTokEntry,
  TikTokReinvestmentExpense,
  FinancialSettings,
  FinancialSummary,
  MonthlyPatrimonyGoal
} from '../types/finance';

/**
 * Formats integer cents into formatted Brazilian Real string.
 * Example: 1050 -> "R$ 10,50"
 */
export function formatCurrency(cents: number | undefined | null): string {
  if (cents === undefined || cents === null || isNaN(cents)) {
    return 'R$ 0,00';
  }
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const reais = absCents / 100;
  
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats a short currency value (e.g. for charts and chips)
 */
export function formatCurrencyCompact(cents: number): string {
  if (Math.abs(cents) >= 100000) {
    return `R$ ${(cents / 100000).toFixed(1)}k`.replace('.', ',');
  }
  return formatCurrency(cents);
}

/**
 * Converts a raw text or number input into integer cents.
 * Handles "10,50", "10.50", "1.500,00", "1500" -> 150000
 */
export function parseCurrencyToCents(value: string | number): number {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }
  if (!value || typeof value !== 'string') return 0;
  
  // Clean string
  let clean = value.replace(/[^0-9,-.]/g, '');
  if (!clean) return 0;
  
  // Handle Brazilian format (1.500,50)
  if (clean.includes(',') && clean.includes('.')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  
  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Converts integer cents to float for chart libraries.
 */
export function centsToReais(cents: number): number {
  return (cents || 0) / 100;
}

/**
 * Converts float reais to integer cents.
 */
export function reaisToCents(reais: number): number {
  return Math.round((reais || 0) * 100);
}

/**
 * Calculates current month string e.g. "2026-08"
 */
export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats a date string into readable PT-BR date.
 * Example: "2026-08-17" -> "17 de agosto de 2026" or "17 Ago"
 */
export function formatDateBR(dateStr: string, format: 'short' | 'long' | 'dayMonth' = 'short'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(date.getTime())) return dateStr;
  
  const monthsShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthsLong = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const day = parts[2];
  const monthIdx = parseInt(parts[1]) - 1;
  const year = parts[0];
  
  if (format === 'dayMonth') {
    return `${day} ${monthsShort[monthIdx]}`;
  }
  if (format === 'short') {
    return `${day}/${parts[1]}/${year}`;
  }
  return `${day} de ${monthsLong[monthIdx]} de ${year}`;
}

/**
 * Calculates total income for a given month or all time.
 */
export function calculateTotalIncome(transactions: Transaction[], monthYear?: string): number {
  return transactions
    .filter(t => t.type === 'income' && (!monthYear || t.date.startsWith(monthYear)))
    .reduce((sum, t) => sum + (t.amountInCents || 0), 0);
}

/**
 * Calculates total expenses for a given month or all time.
 */
export function calculateTotalExpenses(transactions: Transaction[], monthYear?: string): number {
  return transactions
    .filter(t => t.type === 'expense' && (!monthYear || t.date.startsWith(monthYear)))
    .reduce((sum, t) => sum + (t.amountInCents || 0), 0);
}

/**
 * Calculates total investments for a given month or all time.
 */
export function calculateTotalInvestments(transactions: Transaction[], monthYear?: string): number {
  return transactions
    .filter(t => t.type === 'investment' && (!monthYear || t.date.startsWith(monthYear)))
    .reduce((sum, t) => sum + (t.amountInCents || 0), 0);
}

/**
 * Calculates total Dízimo due (10% default of total month income)
 */
export function calculateTitheDue(totalIncomeInCents: number, percentage = 10): number {
  return Math.round((totalIncomeInCents * percentage) / 100);
}

/**
 * Calculates TikTok commission allocation based on configured percentages (e.g. 50/20/30).
 */
export function calculateTikTokAllocation(
  commissionInCents: number,
  config: { investmentPercentage: number; reinvestmentPercentage: number; personalPercentage: number }
) {
  const invest = Math.round((commissionInCents * config.investmentPercentage) / 100);
  const reinvest = Math.round((commissionInCents * config.reinvestmentPercentage) / 100);
  const personal = commissionInCents - invest - reinvest; // Ensure exact 100% rounding
  
  return {
    investInCents: invest,
    reinvestInCents: reinvest,
    personalInCents: personal,
  };
}

/**
 * Computes TikTok statistics
 */
export function computeTikTokMetrics(
  entries: TikTokEntry[],
  reinvestExpenses: TikTokReinvestmentExpense[],
  monthYear?: string
) {
  const filtered = monthYear ? entries.filter(e => e.date.startsWith(monthYear)) : entries;
  
  const totalCommissionInCents = filtered.reduce((sum, e) => sum + (e.commissionInCents || 0), 0);
  const totalSalesCount = filtered.reduce((sum, e) => sum + (e.salesCount || 0), 0);
  const totalGrossRevenueInCents = filtered.reduce((sum, e) => sum + (e.grossRevenueInCents || 0), 0);
  const totalVideos = filtered.reduce((sum, e) => sum + (e.videosPosted || 0), 0);
  
  // All time commission
  const allTimeCommissionInCents = entries.reduce((sum, e) => sum + (e.commissionInCents || 0), 0);
  
  // Total allocated for reinvestment all time
  const totalReinvestAllocatedInCents = entries.reduce((sum, e) => sum + (e.reinvestmentAmountInCents || 0), 0);
  
  // Total reinvestment spent
  const totalReinvestSpentInCents = reinvestExpenses.reduce((sum, exp) => sum + (exp.amountInCents || 0), 0);
  
  // Current available in the Reinvestment Box
  const reinvestBoxBalanceInCents = Math.max(0, totalReinvestAllocatedInCents - totalReinvestSpentInCents);
  
  // Daily and weekly averages
  const daysWithData = filtered.length || 1;
  const averageDailyCommissionInCents = Math.round(totalCommissionInCents / Math.max(1, daysWithData));
  const averageWeeklyCommissionInCents = averageDailyCommissionInCents * 7;
  
  // Best day
  let bestDay: { date: string; amountInCents: number; sales: number } | null = null;
  for (const entry of filtered) {
    if (!bestDay || entry.commissionInCents > bestDay.amountInCents) {
      bestDay = {
        date: entry.date,
        amountInCents: entry.commissionInCents,
        sales: entry.salesCount
      };
    }
  }

  return {
    totalCommissionInCents,
    totalSalesCount,
    totalGrossRevenueInCents,
    totalVideos,
    allTimeCommissionInCents,
    totalReinvestAllocatedInCents,
    totalReinvestSpentInCents,
    reinvestBoxBalanceInCents,
    averageDailyCommissionInCents,
    averageWeeklyCommissionInCents,
    bestDay,
  };
}

/**
 * Calculates current balances for accounts dynamically
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Account[] {
  return accounts.map(acc => {
    let balance = acc.initialBalanceInCents || 0;
    
    transactions.forEach(t => {
      if (t.accountId === acc.id) {
        if (t.type === 'income') {
          balance += t.amountInCents;
        } else if (t.type === 'expense' || t.type === 'investment') {
          balance -= t.amountInCents;
        } else if (t.type === 'transfer' && t.toAccountId) {
          balance -= t.amountInCents;
        }
      }
      
      // If incoming transfer
      if (t.type === 'transfer' && t.toAccountId === acc.id) {
        balance += t.amountInCents;
      }
    });
    
    return {
      ...acc,
      currentBalanceInCents: balance,
    };
  });
}

/**
 * Generates overall financial summary
 */
export function computeFinancialSummary(
  accounts: Account[],
  transactions: Transaction[],
  recurringExpenses: RecurringExpense[],
  boxes: MoneyBox[],
  tiktokEntries: TikTokEntry[],
  tiktokReinvestExpenses: TikTokReinvestmentExpense[],
  settings: FinancialSettings,
  monthYear: string
): FinancialSummary {
  const totalIncomeInCents = calculateTotalIncome(transactions, monthYear);
  const totalExpensesInCents = calculateTotalExpenses(transactions, monthYear);
  const totalInvestedInCents = calculateTotalInvestments(transactions, monthYear);
  
  const calculatedAccounts = calculateAccountBalances(accounts, transactions);
  const totalPatrimonyInCents = calculatedAccounts.reduce((sum, a) => sum + a.currentBalanceInCents, 0);
  
  // Net balance for this month: Income - Expenses - Investments
  const netMonthBalanceInCents = totalIncomeInCents - totalExpensesInCents - totalInvestedInCents;
  
  // Available money = Checking & Cash accounts balance
  const currentAvailableInCents = calculatedAccounts
    .filter(a => a.type === 'checking' || a.type === 'wallet')
    .reduce((sum, a) => sum + a.currentBalanceInCents, 0);
    
  const tiktokMetrics = computeTikTokMetrics(tiktokEntries, tiktokReinvestExpenses, monthYear);
  
  const targetGoalCents = settings.globalPatrimonyGoal.targetInCents || 3000000;
  const goalProgressPercentage = Math.min(100, Math.round((totalPatrimonyInCents / targetGoalCents) * 100));
  const goalRemainingInCents = Math.max(0, targetGoalCents - totalPatrimonyInCents);
  
  const fixedExpensesPaidInCents = recurringExpenses
    .filter(r => r.isPaid)
    .reduce((sum, r) => sum + r.amountInCents, 0);
    
  const fixedExpensesPendingInCents = recurringExpenses
    .filter(r => !r.isPaid)
    .reduce((sum, r) => sum + r.amountInCents, 0);
    
  const titheDueInCents = calculateTitheDue(totalIncomeInCents, settings.tithePercentage);
  const titheExpense = recurringExpenses.find(r => r.isTithe);
  const tithePaidInCents = titheExpense && titheExpense.isPaid ? titheExpense.amountInCents : 0;

  return {
    totalIncomeInCents,
    totalExpensesInCents,
    totalInvestedInCents,
    netMonthBalanceInCents,
    currentAvailableInCents,
    totalPatrimonyInCents,
    tiktokMonthCommissionInCents: tiktokMetrics.totalCommissionInCents,
    tiktokReinvestBoxBalanceInCents: tiktokMetrics.reinvestBoxBalanceInCents,
    goalProgressPercentage,
    goalRemainingInCents,
    fixedExpensesPaidInCents,
    fixedExpensesPendingInCents,
    titheDueInCents,
    tithePaidInCents,
  };
}

/**
 * Projects patrimony for the 3 scenarios (Conservador, Base, Agressivo)
 */
export function projectFutureScenarios(
  currentPatrimonyInCents: number,
  monthlyBaseContributionInCents: number,
  monthsCount = 10 // Ago/2026 to Mai/2027 is approx 10 months
) {
  // Conservative: lower contribution, 0.6% monthly interest (approx 7.4% yearly)
  const consContribution = Math.round(monthlyBaseContributionInCents * 0.75);
  const consRate = 0.006;
  
  // Base scenario: planned contribution, 0.85% monthly interest (approx 10.7% CDI)
  const baseContribution = monthlyBaseContributionInCents;
  const baseRate = 0.0085;
  
  // Aggressive scenario: higher contribution (TikTok scale up), 1.05% monthly interest (13.4% compound)
  const aggContribution = Math.round(monthlyBaseContributionInCents * 1.5);
  const aggRate = 0.0105;
  
  const runProjection = (monthlyDeposit: number, rate: number) => {
    let total = currentPatrimonyInCents;
    const history: { month: number; totalInCents: number; earnedInterestInCents: number }[] = [];
    
    for (let m = 1; m <= monthsCount; m++) {
      const interest = Math.round(total * rate);
      total = total + monthlyDeposit + interest;
      history.push({
        month: m,
        totalInCents: total,
        earnedInterestInCents: interest
      });
    }
    return {
      finalInCents: total,
      history,
    };
  };

  return {
    conservative: runProjection(consContribution, consRate),
    base: runProjection(baseContribution, baseRate),
    aggressive: runProjection(aggContribution, aggRate),
  };
}
