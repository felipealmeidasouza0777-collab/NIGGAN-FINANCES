export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';

export type BoxType = 'available' | 'investments' | 'tiktok_reinvest' | 'emergency' | 'goals';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'investment' | 'wallet' | 'savings' | 'credit';
  initialBalanceInCents: number;
  currentBalanceInCents: number;
  iconName: string;
  color: string;
  institution?: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'investment';
  color: string;
  iconName: string;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  amountInCents: number; // Stored in cents (e.g. 1050 = R$ 10,50)
  type: TransactionType;
  categoryId: string;
  categoryName?: string;
  accountId: string;
  accountName?: string;
  toAccountId?: string; // For transfers
  fromBoxId?: string;
  toBoxId?: string; // For box allocations
  description: string;
  date: string; // YYYY-MM-DD
  time?: string;
  incomeSource?: 'Salário FGL Brasil' | 'Contratos / Instalações' | 'TikTok Shop' | 'Outras receitas' | string;
  isTikTokCommission?: boolean;
  tiktokSalesCount?: number;
  tags?: string[];
  createdAt: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amountInCents: number;
  dueDay: number;
  categoryId: string;
  accountId: string;
  incomeSource: string;
  isFixed: boolean;
  isPaid: boolean;
  paidTransactionId?: string;
  isTithe?: boolean; // Dízimo (10% auto or custom)
  tithePercentage?: number;
  notes?: string;
  createdAt: string;
}

export interface MoneyBox {
  id: string;
  name: string;
  type: BoxType;
  balanceInCents: number;
  targetInCents?: number;
  color: string;
  iconName: string;
  description: string;
  locked?: boolean;
}

export interface TikTokEntry {
  id: string;
  date: string; // YYYY-MM-DD
  grossRevenueInCents: number;
  commissionInCents: number;
  salesCount: number;
  videosPosted?: number;
  productName?: string;
  investmentAmountInCents: number; // 50% default
  reinvestmentAmountInCents: number; // 20% default
  personalAmountInCents: number; // 30% default
  notes?: string;
  createdAt: string;
}

export interface TikTokReinvestmentExpense {
  id: string;
  date: string;
  description: string; // e.g. "Ferramenta CapCut Pro", "Amostra de produto", "Tráfego pago"
  amountInCents: number;
  category: 'ferramentas' | 'amostras' | 'trafego' | 'equipamentos' | 'outros';
  createdAt: string;
}

export interface MonthlyPatrimonyGoal {
  id: string;
  monthYear: string; // e.g. "2026-08"
  label: string; // e.g. "Ago/2026"
  targetInCents: number;
  realInCents: number;
  notes?: string;
}

export interface FinancialSettings {
  userName: string;
  currency: string;
  tithePercentage: number;
  enableTitheAutoCalc: boolean;
  fglSalaryInCents: number;
  contractsEstimatedInCents: number;
  tiktokConfig: {
    investmentPercentage: number; // default 50
    reinvestmentPercentage: number; // default 20
    personalPercentage: number; // default 30
    monthlyRevenueTargetInCents: number; // default 150000 = R$ 1.500
    monthlyVideosTarget: number; // default 300
    monthlyInvestTargetInCents: number; // default 100000 = R$ 1.000
  };
  globalPatrimonyGoal: {
    targetInCents: number; // 3000000 = R$ 30.000
    targetDate: string; // 2027-05
    title: string; // "R$ 30.000 até Maio/2027"
  };
}

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  actionLabel?: string;
  actionView?: string;
  actionPayload?: any;
}

export interface FinancialSummary {
  totalIncomeInCents: number;
  totalExpensesInCents: number;
  totalInvestedInCents: number;
  netMonthBalanceInCents: number; // Income - Expenses - Investments
  currentAvailableInCents: number;
  totalPatrimonyInCents: number;
  tiktokMonthCommissionInCents: number;
  tiktokReinvestBoxBalanceInCents: number;
  goalProgressPercentage: number;
  goalRemainingInCents: number;
  fixedExpensesPaidInCents: number;
  fixedExpensesPendingInCents: number;
  titheDueInCents: number;
  tithePaidInCents: number;
}
