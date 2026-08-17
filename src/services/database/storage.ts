import {
  Account,
  Category,
  Transaction,
  RecurringExpense,
  MoneyBox,
  TikTokEntry,
  TikTokReinvestmentExpense,
  MonthlyPatrimonyGoal,
  FinancialSettings,
} from '../../types/finance';

const STORAGE_KEY = 'niggan_finances_data_v1';

export interface AppDatabaseState {
  settings: FinancialSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  moneyBoxes: MoneyBox[];
  tiktokEntries: TikTokEntry[];
  tiktokReinvestExpenses: TikTokReinvestmentExpense[];
  monthlyGoals: MonthlyPatrimonyGoal[];
  selectedMonthYear: string; // e.g. "2026-08"
}

// Initial Data derived from Felipe's spreadsheet
export const initialDefaultState: AppDatabaseState = {
  selectedMonthYear: '2026-08',
  settings: {
    userName: 'Felipe',
    currency: 'BRL',
    tithePercentage: 10,
    enableTitheAutoCalc: true,
    fglSalaryInCents: 150000, // R$ 1.500,00
    contractsEstimatedInCents: 75000, // R$ 750,00
    tiktokConfig: {
      investmentPercentage: 50, // 50%
      reinvestmentPercentage: 20, // 20%
      personalPercentage: 30, // 30%
      monthlyRevenueTargetInCents: 150000, // R$ 1.500,00
      monthlyVideosTarget: 300,
      monthlyInvestTargetInCents: 100000, // R$ 1.000,00
    },
    globalPatrimonyGoal: {
      targetInCents: 3000000, // R$ 30.000,00
      targetDate: '2027-05',
      title: 'R$ 30.000 até Maio/2027',
    },
  },
  accounts: [
    {
      id: 'acc_c6',
      name: 'C6 Investimentos',
      type: 'investment',
      initialBalanceInCents: 997631, // R$ 9.976,31
      currentBalanceInCents: 997631,
      iconName: 'TrendingUp',
      color: '#0284c7',
      institution: 'C6 Bank',
      isDefault: false,
    },
    {
      id: 'acc_xp',
      name: 'XP Investimentos',
      type: 'investment',
      initialBalanceInCents: 0,
      currentBalanceInCents: 0,
      iconName: 'BarChart3',
      color: '#eab308',
      institution: 'XP',
    },
    {
      id: 'acc_mp',
      name: 'Mercado Pago',
      type: 'checking',
      initialBalanceInCents: 30344, // R$ 303,44
      currentBalanceInCents: 30344,
      iconName: 'CreditCard',
      color: '#06b6d4',
      institution: 'Mercado Pago',
      isDefault: true,
    },
    {
      id: 'acc_cash',
      name: 'Dinheiro em conta',
      type: 'wallet',
      initialBalanceInCents: 42010, // R$ 420,10
      currentBalanceInCents: 42010,
      iconName: 'Wallet',
      color: '#10b981',
      institution: 'Conta Corrente',
    },
    {
      id: 'acc_santander',
      name: 'Santander',
      type: 'checking',
      initialBalanceInCents: 28478, // R$ 284,78
      currentBalanceInCents: 28478,
      iconName: 'Building',
      color: '#ef4444',
      institution: 'Santander',
    },
  ],
  categories: [
    // Income Categories
    { id: 'cat_salario', name: 'Salário FGL Brasil', type: 'income', color: '#10b981', iconName: 'Briefcase', isSystem: true },
    { id: 'cat_contratos', name: 'Contratos / Instalações', type: 'income', color: '#06b6d4', iconName: 'Hammer', isSystem: true },
    { id: 'cat_tiktok', name: 'TikTok Shop', type: 'income', color: '#8b5cf6', iconName: 'Video', isSystem: true },
    { id: 'cat_outras_rec', name: 'Outras receitas', type: 'income', color: '#14b8a6', iconName: 'Coins', isSystem: true },

    // Expense Categories
    { id: 'cat_dizimo', name: 'Dízimo', type: 'expense', color: '#f59e0b', iconName: 'HeartHandshake', isSystem: true },
    { id: 'cat_internet', name: 'Internet VIVO', type: 'expense', color: '#6366f1', iconName: 'Wifi', isSystem: true },
    { id: 'cat_combustivel', name: 'Combustível', type: 'expense', color: '#ef4444', iconName: 'Fuel', isSystem: true },
    { id: 'cat_cartao', name: 'Cartão de Crédito', type: 'expense', color: '#ec4899', iconName: 'CreditCard', isSystem: true },
    { id: 'cat_cabelo', name: 'Corte de Cabelo', type: 'expense', color: '#a855f7', iconName: 'Scissors', isSystem: true },
    { id: 'cat_assinaturas', name: 'Assinaturas (IA, VPN, etc.)', type: 'expense', color: '#3b82f6', iconName: 'Sparkles', isSystem: true },
    { id: 'cat_lazer', name: 'Lazer', type: 'expense', color: '#f97316', iconName: 'Smile', isSystem: true },
    { id: 'cat_presentes', name: 'Presentes', type: 'expense', color: '#fb7185', iconName: 'Gift', isSystem: true },
    { id: 'cat_alimentacao', name: 'Alimentação', type: 'expense', color: '#eab308', iconName: 'Utensils', isSystem: true },
    { id: 'cat_transporte', name: 'Transporte', type: 'expense', color: '#64748b', iconName: 'Car', isSystem: true },
    { id: 'cat_compras', name: 'Compras', type: 'expense', color: '#0ea5e9', iconName: 'ShoppingBag', isSystem: true },
    { id: 'cat_imprevistos', name: 'Imprevistos / Outros', type: 'expense', color: '#94a3b8', iconName: 'AlertCircle', isSystem: true },

    // Investment Categories
    { id: 'cat_inv_cdb', name: 'CDB / Renda Fixa', type: 'investment', color: '#10b981', iconName: 'TrendingUp', isSystem: true },
    { id: 'cat_inv_reserva', name: 'Reserva de Emergência', type: 'investment', color: '#0284c7', iconName: 'ShieldCheck', isSystem: true },
    { id: 'cat_inv_reinvest_tt', name: 'Reinvestimento TikTok', type: 'investment', color: '#8b5cf6', iconName: 'Rocket', isSystem: true },
  ],
  recurringExpenses: [
    {
      id: 'rec_dizimo',
      name: 'Dízimo (10% das Entradas)',
      amountInCents: 25228, // Calculated 10% of R$ 2.522,75
      dueDay: 10,
      categoryId: 'cat_dizimo',
      accountId: 'acc_cash',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: false,
      isTithe: true,
      tithePercentage: 10,
      notes: '10% de todas as entradas do mês',
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'rec_internet',
      name: 'Internet VIVO',
      amountInCents: 6533, // R$ 65,33
      dueDay: 15,
      categoryId: 'cat_internet',
      accountId: 'acc_mp',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: true,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'rec_combustivel',
      name: 'Combustível',
      amountInCents: 18439, // R$ 184,39
      dueDay: 20,
      categoryId: 'cat_combustivel',
      accountId: 'acc_cash',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: true,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'rec_cartao',
      name: 'Cartão de Crédito',
      amountInCents: 13250, // R$ 132,50
      dueDay: 25,
      categoryId: 'cat_cartao',
      accountId: 'acc_santander',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: true,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'rec_cabelo',
      name: 'Corte de Cabelo',
      amountInCents: 6500, // R$ 65,00
      dueDay: 18,
      categoryId: 'cat_cabelo',
      accountId: 'acc_cash',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: true,
      createdAt: '2026-08-01T00:00:00Z',
    },
    {
      id: 'rec_assinaturas',
      name: 'Assinaturas (IA, VPN, etc.)',
      amountInCents: 6300, // R$ 63,00
      dueDay: 28,
      categoryId: 'cat_assinaturas',
      accountId: 'acc_mp',
      incomeSource: 'Salário FGL Brasil',
      isFixed: true,
      isPaid: false,
      createdAt: '2026-08-01T00:00:00Z',
    },
  ],
  moneyBoxes: [
    {
      id: 'box_disponivel',
      name: 'Disponível',
      type: 'available',
      balanceInCents: 72354, // R$ 723,54
      iconName: 'Banknote',
      color: '#10b981',
      description: 'Dinheiro livre para gastos cotidianos e necessidades do mês.',
    },
    {
      id: 'box_investimentos',
      name: 'Investimentos',
      type: 'investments',
      balanceInCents: 997631, // R$ 9.976,31
      targetInCents: 3000000,
      iconName: 'TrendingUp',
      color: '#0284c7',
      description: 'Construção de patrimônio e investimentos no C6 / XP / CDBs.',
    },
    {
      id: 'box_tiktok',
      name: 'Reinvestimento TikTok',
      type: 'tiktok_reinvest',
      balanceInCents: 30000, // R$ 300,00 acumulados
      iconName: 'Rocket',
      color: '#8b5cf6',
      description: 'Saldo exclusivo reservado para amostras, ferramentas e tráfego do TikTok.',
    },
    {
      id: 'box_reserva',
      name: 'Reserva de Emergência',
      type: 'emergency',
      balanceInCents: 500000, // R$ 5.000,00
      targetInCents: 1000000,
      iconName: 'ShieldCheck',
      color: '#f59e0b',
      description: 'Colchão de segurança para imprevistos e tranquilidade.',
    },
    {
      id: 'box_objetivos',
      name: 'Objetivos & Sonhos',
      type: 'goals',
      balanceInCents: 120000, // R$ 1.200,00
      targetInCents: 500000,
      iconName: 'Target',
      color: '#ec4899',
      description: 'Viagens, upgrades de equipamentos e metas pessoais.',
    },
  ],
  transactions: [
    // Initial incomes for August 2026
    {
      id: 'tx_salario_ago',
      amountInCents: 150000, // R$ 1.500,00
      type: 'income',
      categoryId: 'cat_salario',
      accountId: 'acc_cash',
      description: 'Salário Mensal FGL Brasil',
      date: '2026-08-05',
      incomeSource: 'Salário FGL Brasil',
      createdAt: '2026-08-05T10:00:00Z',
    },
    {
      id: 'tx_contrato_ago',
      amountInCents: 75000, // R$ 750,00
      type: 'income',
      categoryId: 'cat_contratos',
      accountId: 'acc_mp',
      description: 'Contratos e Instalações Realizadas',
      date: '2026-08-12',
      incomeSource: 'Contratos / Instalações',
      createdAt: '2026-08-12T14:30:00Z',
    },
    {
      id: 'tx_outras_ago',
      amountInCents: 27275, // R$ 272,75
      type: 'income',
      categoryId: 'cat_outras_rec',
      accountId: 'acc_santander',
      description: 'Outras receitas e comissões extras',
      date: '2026-08-15',
      incomeSource: 'Outras receitas',
      createdAt: '2026-08-15T18:00:00Z',
    },
    // Paid Fixed Expenses
    {
      id: 'tx_pago_vivo',
      amountInCents: 6533,
      type: 'expense',
      categoryId: 'cat_internet',
      accountId: 'acc_mp',
      description: 'Internet VIVO Fibra',
      date: '2026-08-15',
      createdAt: '2026-08-15T09:00:00Z',
    },
    {
      id: 'tx_pago_combustivel',
      amountInCents: 18439,
      type: 'expense',
      categoryId: 'cat_combustivel',
      accountId: 'acc_cash',
      description: 'Combustível - Posto Ipiranga',
      date: '2026-08-14',
      createdAt: '2026-08-14T11:20:00Z',
    },
    {
      id: 'tx_pago_cartao',
      amountInCents: 13250,
      type: 'expense',
      categoryId: 'cat_cartao',
      accountId: 'acc_santander',
      description: 'Fatura Cartão de Crédito',
      date: '2026-08-10',
      createdAt: '2026-08-10T16:00:00Z',
    },
    {
      id: 'tx_pago_cabelo',
      amountInCents: 6500,
      type: 'expense',
      categoryId: 'cat_cabelo',
      accountId: 'acc_cash',
      description: 'Corte de Cabelo e Barba',
      date: '2026-08-16',
      createdAt: '2026-08-16T15:00:00Z',
    },
    // Variable Expenses from spreadsheet
    {
      id: 'tx_var_lazer',
      amountInCents: 19679,
      type: 'expense',
      categoryId: 'cat_lazer',
      accountId: 'acc_cash',
      description: 'Lazer e Saídas de Fim de Semana',
      date: '2026-08-16',
      createdAt: '2026-08-16T22:00:00Z',
    },
    {
      id: 'tx_var_presentes',
      amountInCents: 5890,
      type: 'expense',
      categoryId: 'cat_presentes',
      accountId: 'acc_mp',
      description: 'Presente Aniversário',
      date: '2026-08-11',
      createdAt: '2026-08-11T19:30:00Z',
    },
    {
      id: 'tx_var_imprevisto',
      amountInCents: 800,
      type: 'expense',
      categoryId: 'cat_imprevistos',
      accountId: 'acc_cash',
      description: 'Imprevistos pequenos',
      date: '2026-08-17',
      createdAt: '2026-08-17T08:15:00Z',
    },
    // Sample TikTok transaction
    {
      id: 'tx_tt_sample',
      amountInCents: 32800, // R$ 328,00
      type: 'income',
      categoryId: 'cat_tiktok',
      accountId: 'acc_mp',
      description: 'Comissões TikTok Shop (Vídeos de Afiliado)',
      date: '2026-08-17',
      incomeSource: 'TikTok Shop',
      isTikTokCommission: true,
      tiktokSalesCount: 14,
      createdAt: '2026-08-17T09:00:00Z',
    },
    // Investment from spreadsheet
    {
      id: 'tx_inv_salario',
      amountInCents: 54000, // R$ 540,00
      type: 'investment',
      categoryId: 'cat_inv_cdb',
      accountId: 'acc_c6',
      description: 'Aporte Mensal CDB C6 Bank (do Salário)',
      date: '2026-08-06',
      createdAt: '2026-08-06T10:00:00Z',
    },
  ],
  tiktokEntries: [
    {
      id: 'tt_1',
      date: '2026-08-17',
      grossRevenueInCents: 164000, // R$ 1.640,00 vendido
      commissionInCents: 32800,   // R$ 328,00 comissão (20%)
      salesCount: 14,
      videosPosted: 8,
      productName: 'Mini Seladora & Fone Gamer',
      investmentAmountInCents: 16400, // 50%
      reinvestmentAmountInCents: 6560, // 20%
      personalAmountInCents: 9840, // 30%
      notes: 'Melhor performance nos vídeos curtos da manhã',
      createdAt: '2026-08-17T09:00:00Z',
    },
    {
      id: 'tt_2',
      date: '2026-08-16',
      grossRevenueInCents: 89000,
      commissionInCents: 17800,
      salesCount: 7,
      videosPosted: 6,
      productName: 'Lâmpada Led RGB',
      investmentAmountInCents: 8900,
      reinvestmentAmountInCents: 3560,
      personalAmountInCents: 5340,
      notes: 'Bom engajamento com CTA direto',
      createdAt: '2026-08-16T18:00:00Z',
    },
  ],
  tiktokReinvestExpenses: [
    {
      id: 'tre_1',
      date: '2026-08-10',
      description: 'Assinatura CapCut Pro para edição',
      amountInCents: 4990,
      category: 'ferramentas',
      createdAt: '2026-08-10T12:00:00Z',
    },
    {
      id: 'tre_2',
      date: '2026-08-14',
      description: 'Amostra de 2 produtos para gravação',
      amountInCents: 7500,
      category: 'amostras',
      createdAt: '2026-08-14T15:30:00Z',
    },
  ],
  monthlyGoals: [
    { id: 'mg_1', monthYear: '2026-08', label: 'Ago/2026', targetInCents: 300000, realInCents: 1098463, notes: 'Ponto de partida' },
    { id: 'mg_2', monthYear: '2026-09', label: 'Set/2026', targetInCents: 600000, realInCents: 0 },
    { id: 'mg_3', monthYear: '2026-10', label: 'Out/2026', targetInCents: 900000, realInCents: 0 },
    { id: 'mg_4', monthYear: '2026-11', label: 'Nov/2026', targetInCents: 1200000, realInCents: 0 },
    { id: 'mg_5', monthYear: '2026-12', label: 'Dez/2026', targetInCents: 1500000, realInCents: 0 },
    { id: 'mg_6', monthYear: '2027-01', label: 'Jan/2027', targetInCents: 1800000, realInCents: 0 },
    { id: 'mg_7', monthYear: '2027-02', label: 'Fev/2027', targetInCents: 2100000, realInCents: 0 },
    { id: 'mg_8', monthYear: '2027-03', label: 'Mar/2027', targetInCents: 2400000, realInCents: 0 },
    { id: 'mg_9', monthYear: '2027-04', label: 'Abr/2027', targetInCents: 2700000, realInCents: 0 },
    { id: 'mg_10', monthYear: '2027-05', label: 'Mai/2027', targetInCents: 3000000, realInCents: 0, notes: 'Meta Final R$ 30.000' },
  ],
};

class DatabaseService {
  private state: AppDatabaseState;
  private listeners: Set<(state: AppDatabaseState) => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): AppDatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initialDefaultState to preserve newly added properties gracefully
        return {
          ...initialDefaultState,
          ...parsed,
          settings: { ...initialDefaultState.settings, ...(parsed.settings || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
    return initialDefaultState;
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
    this.notify();
  }

  public subscribe(listener: (state: AppDatabaseState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public getState(): AppDatabaseState {
    return this.state;
  }

  public setSelectedMonthYear(monthYear: string) {
    this.state.selectedMonthYear = monthYear;
    this.saveToStorage();
  }

  // --- Transactions ---
  public addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const newTx: Transaction = {
      ...transaction,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
    };

    // If it's a TikTok commission, update the TikTok entries and allocations automatically
    if (newTx.isTikTokCommission) {
      const config = this.state.settings.tiktokConfig;
      const invest = Math.round((newTx.amountInCents * config.investmentPercentage) / 100);
      const reinvest = Math.round((newTx.amountInCents * config.reinvestmentPercentage) / 100);
      const personal = newTx.amountInCents - invest - reinvest;

      const newEntry: TikTokEntry = {
        id: 'tt_' + Date.now(),
        date: newTx.date,
        grossRevenueInCents: newTx.amountInCents * 5, // estimated 20% commission
        commissionInCents: newTx.amountInCents,
        salesCount: newTx.tiktokSalesCount || 1,
        investmentAmountInCents: invest,
        reinvestmentAmountInCents: reinvest,
        personalAmountInCents: personal,
        notes: newTx.description,
        createdAt: newTx.createdAt,
      };
      this.state.tiktokEntries = [newEntry, ...this.state.tiktokEntries];

      // Also add to TikTok Reinvestment Box
      const ttBox = this.state.moneyBoxes.find(b => b.type === 'tiktok_reinvest');
      if (ttBox) {
        ttBox.balanceInCents += reinvest;
      }
    }

    this.state.transactions = [newTx, ...this.state.transactions];
    this.recalculateAccountBalances();
    this.saveToStorage();
    return newTx;
  }

  public updateTransaction(id: string, updates: Partial<Transaction>) {
    this.state.transactions = this.state.transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    this.recalculateAccountBalances();
    this.saveToStorage();
  }

  public deleteTransaction(id: string) {
    this.state.transactions = this.state.transactions.filter(t => t.id !== id);
    this.recalculateAccountBalances();
    this.saveToStorage();
  }

  // --- Quick Recurring Expense Payment ---
  public toggleRecurringExpensePaid(recurringId: string, markPaid: boolean): Transaction | null {
    const expense = this.state.recurringExpenses.find(r => r.id === recurringId);
    if (!expense) return null;

    expense.isPaid = markPaid;

    if (markPaid) {
      // Auto-create matching expense transaction
      const newTx: Transaction = {
        id: 'tx_rec_' + Date.now(),
        amountInCents: expense.amountInCents,
        type: 'expense',
        categoryId: expense.categoryId,
        accountId: expense.accountId || this.state.accounts[0]?.id || 'acc_cash',
        description: `Pagamento: ${expense.name}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      expense.paidTransactionId = newTx.id;
      this.state.transactions = [newTx, ...this.state.transactions];
      this.recalculateAccountBalances();
      this.saveToStorage();
      return newTx;
    } else {
      // If unmarked, optionally remove the linked transaction if present
      if (expense.paidTransactionId) {
        this.state.transactions = this.state.transactions.filter(t => t.id !== expense.paidTransactionId);
        expense.paidTransactionId = undefined;
        this.recalculateAccountBalances();
      }
      this.saveToStorage();
      return null;
    }
  }

  public addRecurringExpense(expense: Omit<RecurringExpense, 'id' | 'createdAt'>) {
    const newRec: RecurringExpense = {
      ...expense,
      id: 'rec_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.state.recurringExpenses = [...this.state.recurringExpenses, newRec];
    this.saveToStorage();
    return newRec;
  }

  public updateRecurringExpense(id: string, updates: Partial<RecurringExpense>) {
    this.state.recurringExpenses = this.state.recurringExpenses.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    this.saveToStorage();
  }

  public deleteRecurringExpense(id: string) {
    this.state.recurringExpenses = this.state.recurringExpenses.filter(r => r.id !== id);
    this.saveToStorage();
  }

  // --- Money Box Transfer (Does NOT count as income/expense) ---
  public transferBetweenBoxes(fromBoxId: string, toBoxId: string, amountInCents: number, notes?: string) {
    const fromBox = this.state.moneyBoxes.find(b => b.id === fromBoxId);
    const toBox = this.state.moneyBoxes.find(b => b.id === toBoxId);

    if (!fromBox || !toBox || amountInCents <= 0) return false;

    fromBox.balanceInCents = Math.max(0, fromBox.balanceInCents - amountInCents);
    toBox.balanceInCents += amountInCents;

    // Record internal transfer transaction
    const transferTx: Transaction = {
      id: 'tx_box_tr_' + Date.now(),
      amountInCents,
      type: 'transfer',
      categoryId: 'cat_transfer_box',
      accountId: this.state.accounts[0]?.id || 'acc_cash',
      fromBoxId,
      toBoxId,
      description: `Transferência de Caixa: ${fromBox.name} ➔ ${toBox.name}${notes ? ` (${notes})` : ''}`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    this.state.transactions = [transferTx, ...this.state.transactions];
    this.saveToStorage();
    return true;
  }

  public addTikTokReinvestmentExpense(expense: Omit<TikTokReinvestmentExpense, 'id' | 'createdAt'>) {
    const newExp: TikTokReinvestmentExpense = {
      ...expense,
      id: 'tre_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Deduct from TikTok Reinvestment Box
    const ttBox = this.state.moneyBoxes.find(b => b.type === 'tiktok_reinvest');
    if (ttBox) {
      ttBox.balanceInCents = Math.max(0, ttBox.balanceInCents - expense.amountInCents);
    }

    this.state.tiktokReinvestExpenses = [newExp, ...this.state.tiktokReinvestExpenses];
    this.saveToStorage();
    return newExp;
  }

  public addTikTokEntry(entry: Omit<TikTokEntry, 'id' | 'createdAt'>) {
    const newEntry: TikTokEntry = {
      ...entry,
      id: 'tt_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Add reinvestment allocation to the TikTok box
    const ttBox = this.state.moneyBoxes.find(b => b.type === 'tiktok_reinvest');
    if (ttBox) {
      ttBox.balanceInCents += entry.reinvestmentAmountInCents;
    }

    this.state.tiktokEntries = [newEntry, ...this.state.tiktokEntries];

    // Create an Income transaction
    const tx: Transaction = {
      id: 'tx_tt_' + Date.now(),
      amountInCents: entry.commissionInCents,
      type: 'income',
      categoryId: 'cat_tiktok',
      accountId: this.state.accounts.find(a => a.type === 'checking')?.id || 'acc_mp',
      description: `Comissão TikTok Shop (${entry.salesCount} vendas)${entry.productName ? ` - ${entry.productName}` : ''}`,
      date: entry.date,
      incomeSource: 'TikTok Shop',
      isTikTokCommission: true,
      tiktokSalesCount: entry.salesCount,
      createdAt: newEntry.createdAt,
    };
    this.state.transactions = [tx, ...this.state.transactions];

    this.recalculateAccountBalances();
    this.saveToStorage();
    return newEntry;
  }

  public updatePatrimonyGoalReal(monthYear: string, realInCents: number) {
    const goal = this.state.monthlyGoals.find(g => g.monthYear === monthYear);
    if (goal) {
      goal.realInCents = realInCents;
    } else {
      this.state.monthlyGoals.push({
        id: 'mg_' + Date.now(),
        monthYear,
        label: monthYear,
        targetInCents: 3000000,
        realInCents,
      });
    }
    this.saveToStorage();
  }

  public updateSettings(settings: Partial<FinancialSettings>) {
    this.state.settings = {
      ...this.state.settings,
      ...settings,
      tiktokConfig: {
        ...this.state.settings.tiktokConfig,
        ...(settings.tiktokConfig || {}),
      },
      globalPatrimonyGoal: {
        ...this.state.settings.globalPatrimonyGoal,
        ...(settings.globalPatrimonyGoal || {}),
      },
    };
    this.saveToStorage();
  }

  public updateAccount(id: string, updates: Partial<Account>) {
    this.state.accounts = this.state.accounts.map(a =>
      a.id === id ? { ...a, ...updates } : a
    );
    this.recalculateAccountBalances();
    this.saveToStorage();
  }

  public addAccount(account: Omit<Account, 'id' | 'currentBalanceInCents'>) {
    const newAcc: Account = {
      ...account,
      id: 'acc_' + Date.now(),
      currentBalanceInCents: account.initialBalanceInCents || 0,
    };
    this.state.accounts = [...this.state.accounts, newAcc];
    this.recalculateAccountBalances();
    this.saveToStorage();
    return newAcc;
  }

  public deleteAccount(id: string) {
    this.state.accounts = this.state.accounts.filter(a => a.id !== id);
    this.saveToStorage();
  }

  public addCategory(cat: Omit<Category, 'id'>) {
    const newCat: Category = {
      ...cat,
      id: 'cat_' + Date.now(),
    };
    this.state.categories = [...this.state.categories, newCat];
    this.saveToStorage();
    return newCat;
  }

  public resetToSpreadsheetDefaults() {
    this.state = JSON.parse(JSON.stringify(initialDefaultState));
    this.saveToStorage();
  }

  public exportDataJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importDataJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings && parsed.accounts && parsed.transactions) {
        this.state = {
          ...initialDefaultState,
          ...parsed,
        };
        this.recalculateAccountBalances();
        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON data:', e);
    }
    return false;
  }

  private recalculateAccountBalances() {
    // Recalculates dynamically based on transactions
    this.state.accounts = this.state.accounts.map(acc => {
      let balance = acc.initialBalanceInCents || 0;
      this.state.transactions.forEach(t => {
        if (t.accountId === acc.id) {
          if (t.type === 'income') balance += t.amountInCents;
          else if (t.type === 'expense' || t.type === 'investment') balance -= t.amountInCents;
          else if (t.type === 'transfer' && t.toAccountId) balance -= t.amountInCents;
        }
        if (t.type === 'transfer' && t.toAccountId === acc.id) {
          balance += t.amountInCents;
        }
      });
      return { ...acc, currentBalanceInCents: balance };
    });
  }
}

export const db = new DatabaseService();
