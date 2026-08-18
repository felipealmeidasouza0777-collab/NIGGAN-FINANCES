# Setup — IA real (Gemini) e Sincronização na Nuvem (Supabase)

Este app funciona **sem nenhuma configuração**, exatamente como antes (dados só no navegador,
IA com respostas locais por regras). As seções abaixo são só para *ativar* as versões reais.

## 1. Rodando localmente

```bash
npm install
cp .env.example .env   # depois preencha as chaves abaixo
```

## 2. Ativar IA real (Gemini)

1. Pegue uma chave grátis em https://aistudio.google.com/apikey
2. Cole em `.env`:
   ```
   GEMINI_API_KEY="sua-chave-aqui"
   ```
3. Rode em dois terminais:
   ```bash
   npm run server   # backend da IA (porta 8787)
   npm run dev      # frontend (porta 3000)
   ```
4. Abra o app, vá em "IA" e pergunte algo. As respostas com o selo **✨ Gemini** vieram do
   modelo de verdade; se aparecer **Modo local**, o backend não está rodando ou a chave está errada.

A chave nunca é exposta ao navegador — só o `server.ts` (backend) a usa.

## 3. Ativar Supabase (login + sincronização na nuvem)

1. Crie um projeto grátis em https://supabase.com
2. No painel do projeto: **SQL Editor** → cole o SQL que está em
   **Configurações → Sincronização na Nuvem — Passo 1** dentro do próprio app (ou em
   `src/services/database/appStateSchema.sql`) → Run.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**
   (nunca a `service_role key`).
4. Cole em `.env`:
   ```
   VITE_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
   VITE_SUPABASE_ANON_KEY="sua-chave-anon-publica"
   ```
5. Reinicie `npm run dev`. O app agora pede login/cadastro antes de entrar, e todo o
   estado (contas, transações, caixas, metas etc.) sincroniza automaticamente pela nuvem —
   dá pra abrir no celular e no computador com os mesmos dados.

Por padrão o Supabase exige confirmação por e-mail no cadastro. Se quiser pular isso durante
os testes: **Authentication → Providers → Email → desmarque "Confirm email"**.

## 4. Deploy em produção

- O frontend (`npm run build`) pode ir para Vercel/Netlify normalmente.
- O `server.ts` precisa rodar em algum lugar com Node (Cloud Run, Railway, Render, etc.),
  com `GEMINI_API_KEY` configurada como variável de ambiente do servidor — nunca no frontend.
- Aponte o proxy `/api` do seu host de frontend para a URL pública do backend
  (equivalente ao `proxy` do `vite.config.ts`, que só vale em dev).
