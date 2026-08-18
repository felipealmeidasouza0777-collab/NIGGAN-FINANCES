-- =========================================================================
-- NIGGAN FINANCES — SCHEMA MÍNIMO DE SINCRONIZAÇÃO (RECOMENDADO PARA COMEÇAR)
-- Guarda o estado inteiro do app (contas, transações, caixas, metas, etc.)
-- como um único JSONB por usuário. Simples de ativar e já resolve o
-- problema real de hoje: os dados só existirem no localStorage do navegador.
--
-- O schema.sql / schemaSql.ts (tabelas normalizadas) continua disponível
-- para quando fizer sentido migrar para um modelo relacional completo.
-- =========================================================================

create table if not exists public.app_state (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "Usuários só acessam seu próprio estado"
  on public.app_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
