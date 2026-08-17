export const SUPABASE_SCHEMA_SQL = `-- =========================================================================
-- NIGGAN FINANCES — SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Arquitetura 100% preparada para migração para o Supabase com Row Level Security (RLS)
-- Todos os valores monetários são inteiros em centavos (INTEGER / BIGINT)
-- =========================================================================

-- 1. Profiles / Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Felipe',
  email TEXT,
  currency TEXT NOT NULL DEFAULT 'BRL',
  tithe_percentage INTEGER NOT NULL DEFAULT 10,
  enable_tithe_auto_calc BOOLEAN NOT NULL DEFAULT true,
  fgl_salary_in_cents INTEGER NOT NULL DEFAULT 150000,
  contracts_estimated_in_cents INTEGER NOT NULL DEFAULT 75000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Configurações do TikTok Shop
CREATE TABLE IF NOT EXISTS public.tiktok_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  investment_percentage INTEGER NOT NULL DEFAULT 50,
  reinvestment_percentage INTEGER NOT NULL DEFAULT 20,
  personal_percentage INTEGER NOT NULL DEFAULT 30,
  monthly_revenue_target_in_cents INTEGER NOT NULL DEFAULT 150000,
  monthly_videos_target INTEGER NOT NULL DEFAULT 300,
  monthly_invest_target_in_cents INTEGER NOT NULL DEFAULT 100000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Contas Bancárias e Carteiras
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'investment', 'cash', 'wallet', 'credit_card')),
  initial_balance_in_cents INTEGER NOT NULL DEFAULT 0,
  current_balance_in_cents INTEGER NOT NULL DEFAULT 0,
  institution TEXT,
  color TEXT NOT NULL DEFAULT '#10b981',
  icon_name TEXT DEFAULT 'Wallet',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Categorias de Receitas, Despesas e Investimentos
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'transfer')),
  color TEXT NOT NULL DEFAULT '#64748b',
  icon_name TEXT DEFAULT 'Layers',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Caixas Financeiras (Money Boxes)
CREATE TABLE IF NOT EXISTS public.money_boxes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('available', 'investments', 'tiktok_reinvest', 'emergency', 'goals')),
  balance_in_cents INTEGER NOT NULL DEFAULT 0,
  target_in_cents INTEGER,
  color TEXT NOT NULL DEFAULT '#10b981',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Transações / Movimentações Financeiras
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'transfer')),
  amount_in_cents INTEGER NOT NULL CHECK (amount_in_cents > 0),
  description TEXT NOT NULL,
  income_source TEXT,
  is_tiktok_commission BOOLEAN NOT NULL DEFAULT false,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  from_box_id UUID REFERENCES public.money_boxes(id) ON DELETE SET NULL,
  to_box_id UUID REFERENCES public.money_boxes(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Despesas Fixas e Recorrentes
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount_in_cents INTEGER NOT NULL CHECK (amount_in_cents >= 0),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  income_source TEXT DEFAULT 'Salário FGL Brasil',
  is_fixed BOOLEAN NOT NULL DEFAULT true,
  is_tithe BOOLEAN NOT NULL DEFAULT false,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Lançamentos Detalhados do TikTok Shop
CREATE TABLE IF NOT EXISTS public.tiktok_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  gross_revenue_in_cents INTEGER NOT NULL DEFAULT 0,
  commission_in_cents INTEGER NOT NULL CHECK (commission_in_cents >= 0),
  sales_count INTEGER NOT NULL DEFAULT 1,
  videos_posted INTEGER NOT NULL DEFAULT 0,
  product_name TEXT,
  investment_amount_in_cents INTEGER NOT NULL DEFAULT 0,
  reinvestment_amount_in_cents INTEGER NOT NULL DEFAULT 0,
  personal_amount_in_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Gastos da Caixa de Reinvestimento do TikTok Shop
CREATE TABLE IF NOT EXISTS public.tiktok_reinvest_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount_in_cents INTEGER NOT NULL CHECK (amount_in_cents > 0),
  category TEXT NOT NULL CHECK (category IN ('ferramentas', 'amostras', 'trafego', 'equipamentos', 'outros')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Metas Mensais de Patrimônio (Ago/2026 - Mai/2027)
CREATE TABLE IF NOT EXISTS public.monthly_patrimony_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL, -- 'YYYY-MM'
  label TEXT NOT NULL,
  target_in_cents INTEGER NOT NULL,
  real_in_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_reinvest_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_patrimony_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para isolamento por usuário (auth.uid() = user_id)
CREATE POLICY "Users can manage their own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their tiktok_configs" ON public.tiktok_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their categories" ON public.categories FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage their money_boxes" ON public.money_boxes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their recurring_expenses" ON public.recurring_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their tiktok_entries" ON public.tiktok_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their tiktok_reinvest_expenses" ON public.tiktok_reinvest_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their monthly_patrimony_goals" ON public.monthly_patrimony_goals FOR ALL USING (auth.uid() = user_id);
`;
