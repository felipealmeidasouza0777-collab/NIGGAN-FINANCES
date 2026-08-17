-- =========================================================================
-- NIGGAN FINANCES — SUPABASE POSTGRESQL DATABASE SCHEMA (PROD & RLS READY)
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (User profiles synced with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text,
  currency text default 'BRL',
  tithe_percentage numeric default 10,
  enable_tithe_auto_calc boolean default true,
  fgl_salary_cents bigint default 150000,
  contracts_estimated_cents bigint default 75000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ACCOUNTS TABLE (Checking, Investments, Cash, etc.)
create table if not exists public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('checking', 'investment', 'wallet', 'savings', 'credit')),
  initial_balance_cents bigint default 0 not null,
  current_balance_cents bigint default 0 not null,
  institution text,
  icon_name text default 'Wallet',
  color text default '#10B981',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense', 'investment')),
  color text default '#64748B',
  icon_name text default 'Tag',
  is_system boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TRANSACTIONS TABLE (Stores amounts strictly in integer cents)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete restrict not null,
  category_id uuid references public.categories on delete set null,
  to_account_id uuid references public.accounts on delete set null,
  from_box_id uuid,
  to_box_id uuid,
  type text not null check (type in ('income', 'expense', 'transfer', 'investment')),
  amount_cents bigint not null check (amount_cents >= 0),
  description text,
  date date not null default current_date,
  income_source text,
  is_tiktok_commission boolean default false,
  tiktok_sales_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. RECURRING EXPENSES TABLE (Dízimo, Vivo, Combustível, Assinaturas, etc.)
create table if not exists public.recurring_expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  account_id uuid references public.accounts on delete set null,
  name text not null,
  amount_cents bigint not null,
  due_day int not null check (due_day between 1 and 31),
  income_source text default 'Salário FGL Brasil',
  is_fixed boolean default true,
  is_paid boolean default false,
  is_tithe boolean default false,
  tithe_percentage numeric default 10,
  active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. MONEY BOXES TABLE (Caixas: Disponível, Investimentos, Reinvestimento TikTok, Reserva, Objetivos)
create table if not exists public.money_boxes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('available', 'investments', 'tiktok_reinvest', 'emergency', 'goals')),
  balance_cents bigint default 0 not null,
  target_cents bigint default 0,
  color text default '#3B82F6',
  icon_name text default 'Box',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TIKTOK REVENUE TABLE
create table if not exists public.tiktok_revenue (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  gross_revenue_cents bigint default 0 not null,
  commission_cents bigint not null,
  sales_count int default 0 not null,
  videos_posted int default 0,
  product_name text,
  investment_amount_cents bigint default 0 not null,
  reinvestment_amount_cents bigint default 0 not null,
  personal_amount_cents bigint default 0 not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. TIKTOK REINVESTMENT EXPENSES TABLE (Ferramentas, Amostras, Tráfego)
create table if not exists public.tiktok_reinvestment_expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  description text not null,
  amount_cents bigint not null,
  category text not null check (category in ('ferramentas', 'amostras', 'trafego', 'equipamentos', 'outros')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. MONTHLY PATRIMONY GOALS TABLE (R$ 30.000 até Maio/2027)
create table if not exists public.monthly_patrimony_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  month_year text not null, -- format 'YYYY-MM'
  label text not null,      -- format 'Ago/2026'
  target_cents bigint not null,
  real_cents bigint default 0 not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month_year)
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.money_boxes enable row level security;
alter table public.tiktok_revenue enable row level security;
alter table public.tiktok_reinvestment_expenses enable row level security;
alter table public.monthly_patrimony_goals enable row level security;

-- Create simple RLS policies for each table
create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users can manage own accounts" on public.accounts
  for all using (auth.uid() = user_id);

create policy "Users can manage own categories" on public.categories
  for all using (auth.uid() = user_id);

create policy "Users can manage own transactions" on public.transactions
  for all using (auth.uid() = user_id);

create policy "Users can manage own recurring expenses" on public.recurring_expenses
  for all using (auth.uid() = user_id);

create policy "Users can manage own money boxes" on public.money_boxes
  for all using (auth.uid() = user_id);

create policy "Users can manage own tiktok revenue" on public.tiktok_revenue
  for all using (auth.uid() = user_id);

create policy "Users can manage own tiktok reinvestment expenses" on public.tiktok_reinvestment_expenses
  for all using (auth.uid() = user_id);

create policy "Users can manage own monthly patrimony goals" on public.monthly_patrimony_goals
  for all using (auth.uid() = user_id);

-- Indexes for ultra fast queries
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_type on public.transactions(type);
create index if not exists idx_tiktok_revenue_date on public.tiktok_revenue(user_id, date desc);
